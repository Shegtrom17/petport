import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => 
  console.log(`[PROCESS-PAYOUTS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Starting payout processing");

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized - Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user has admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Unauthorized - Invalid token");
    }

    const { data: hasAdminRole } = await supabaseClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin"
    });

    if (!hasAdminRole) {
      throw new Error("Unauthorized - Admin role required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get all approved but unpaid referrals
    const { data: approvedReferrals, error: fetchError } = await supabaseClient
      .from("referrals")
      .select("id, referrer_user_id, commission_amount, referral_code, created_at")
      .eq("commission_status", "approved")
      .is("paid_at", null);

    if (fetchError) throw fetchError;

    log("Found approved referrals", { count: approvedReferrals?.length || 0 });

    if (!approvedReferrals || approvedReferrals.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No approved referrals to process",
          processed: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Group referrals by referrer
    const referralsByUser = new Map<string, typeof approvedReferrals>();
    for (const referral of approvedReferrals) {
      const existing = referralsByUser.get(referral.referrer_user_id) || [];
      existing.push(referral);
      referralsByUser.set(referral.referrer_user_id, existing);
    }

    log("Grouped referrals by user", { uniqueReferrers: referralsByUser.size });

    let successfulPayouts = 0;
    let failedPayouts = 0;
    const errors: any[] = [];

    // Process each referrer's payouts
    for (const [userId, userReferrals] of referralsByUser.entries()) {
      try {
        log("Processing payouts for user", { userId, referralCount: userReferrals.length });

        // Get user's payout info
        const { data: payoutInfo, error: payoutError } = await supabaseClient
          .from("user_payouts")
          .select("stripe_connect_id, onboarding_status")
          .eq("user_id", userId)
          .single();

        if (payoutError || !payoutInfo) {
          log("No payout info found for user", { userId });
          errors.push({ userId, error: "No payout info found" });
          failedPayouts += userReferrals.length;
          continue;
        }

        if (!payoutInfo.stripe_connect_id) {
          log("User has not connected Stripe", { userId });
          errors.push({ userId, error: "Stripe not connected" });
          failedPayouts += userReferrals.length;
          continue;
        }

        if (payoutInfo.onboarding_status !== "completed") {
          log("User has not completed Stripe onboarding", { userId, status: payoutInfo.onboarding_status });
          errors.push({ userId, error: "Stripe onboarding not completed" });
          failedPayouts += userReferrals.length;
          continue;
        }

        // Calculate total payout amount
        const totalAmount = userReferrals.reduce((sum, ref) => sum + ref.commission_amount, 0);
        
        log("Creating Stripe transfer", { 
          userId, 
          amount: totalAmount, 
          connectId: payoutInfo.stripe_connect_id 
        });

        // Create Stripe transfer to connected account
        const transfer = await stripe.transfers.create({
          amount: totalAmount,
          currency: "usd",
          destination: payoutInfo.stripe_connect_id,
          description: `PetPort referral commission - ${userReferrals.length} referral${userReferrals.length > 1 ? 's' : ''}`,
          metadata: {
            user_id: userId,
            referral_count: userReferrals.length.toString(),
            referral_ids: userReferrals.map(r => r.id).join(',')
          }
        });

        log("Transfer successful", { transferId: transfer.id, amount: totalAmount });

        // Mark referrals as paid
        const referralIds = userReferrals.map(r => r.id);
        const { error: updateError } = await supabaseClient
          .from("referrals")
          .update({
            commission_status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .in("id", referralIds);

        if (updateError) {
          log("Failed to update referrals after transfer", { error: updateError });
          // Transfer succeeded but DB update failed - needs manual intervention
          errors.push({ 
            userId, 
            transferId: transfer.id,
            error: "Transfer succeeded but DB update failed",
            details: updateError 
          });
        } else {
          // Update user's yearly earnings
          await supabaseClient
            .from("user_payouts")
            .update({
              yearly_earnings: totalAmount,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);

          successfulPayouts += userReferrals.length;
          log("Payout complete for user", { userId, referralCount: userReferrals.length });
        }

      } catch (error: any) {
        log("Error processing user payouts", { userId, error: error.message });
        errors.push({ userId, error: error.message });
        failedPayouts += userReferrals.length;
      }
    }

    const summary = {
      total_approved: approvedReferrals.length,
      successful_payouts: successfulPayouts,
      failed_payouts: failedPayouts,
      unique_referrers: referralsByUser.size,
      errors: errors.length,
      error_details: errors
    };

    log("Payout processing complete", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    log("ERROR", { message: error?.message });
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
