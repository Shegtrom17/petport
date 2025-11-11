import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[APPROVE-REFERRALS] Starting approval process");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find pending yearly referrals past 45 days from signup (38 days after trial ends)
    // 45 days from signup = 7 day trial + 38 days active subscription
    const approvalDate = new Date();
    approvalDate.setDate(approvalDate.getDate() - 38);

    const { data: pendingReferrals, error: fetchError } = await supabaseClient
      .from("referrals")
      .select("id, referred_user_id, referrer_user_id, referral_code, trial_completed_at")
      .eq("commission_status", "pending")
      .eq("referred_plan_interval", "year")
      .not("referred_user_id", "is", null)
      .not("trial_completed_at", "is", null)
      .lte("trial_completed_at", approvalDate.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`[APPROVE-REFERRALS] Found ${pendingReferrals?.length || 0} pending yearly referrals`);

    let approvedCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    for (const referral of pendingReferrals || []) {
      try {
        // Verify subscription is still active
        const { data: subscriber, error: subError } = await supabaseClient
          .from("subscribers")
          .select("status, plan_interval")
          .eq("user_id", referral.referred_user_id)
          .single();

        if (subError) {
          console.log(`[APPROVE-REFERRALS] Subscription not found for user ${referral.referred_user_id}`);
          skippedCount++;
          continue;
        }

        // Only approve if subscription is active or in grace period AND is yearly
        if (
          (subscriber.status === "active" || subscriber.status === "grace") &&
          subscriber.plan_interval === "year"
        ) {
          const { error: updateError } = await supabaseClient
            .from("referrals")
            .update({
              commission_status: "approved",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", referral.id);

          if (updateError) {
            throw updateError;
          }

          approvedCount++;
          console.log(`[APPROVE-REFERRALS] Approved referral ${referral.id} (code: ${referral.referral_code})`);
        } else {
          console.log(
            `[APPROVE-REFERRALS] Skipped referral ${referral.id} - subscription status: ${subscriber.status}, interval: ${subscriber.plan_interval}`
          );
          skippedCount++;
        }
      } catch (error) {
        console.error(`[APPROVE-REFERRALS] Error processing referral ${referral.id}:`, error);
        errors.push({ referralId: referral.id, error: error.message });
        skippedCount++;
      }
    }

    const summary = {
      total_pending: pendingReferrals?.length || 0,
      approved: approvedCount,
      skipped: skippedCount,
      errors: errors.length,
      error_details: errors,
    };

    console.log("[APPROVE-REFERRALS] Approval process completed:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[APPROVE-REFERRALS] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
