import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

const log = (step: string, details?: any) => console.log(`[VERIFY-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      const errorBody = JSON.stringify({ error: "session_id is required" });
      return new Response(errorBody, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Length": errorBody.length.toString()
        },
        status: 400,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const origin = req.headers.get("origin") || "";

    log("Retrieving session", { session_id });
    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["subscription"] });
    if (!session) throw new Error("Checkout session not found");

    const email = session.customer_details?.email || session.customer_email;
    if (!email) throw new Error("No customer email found on session");

    // Validate payment/subscription status
    if (session.mode !== "subscription" || session.status !== "complete") {
      const errorBody = JSON.stringify({ error: "Subscription not completed" });
      return new Response(errorBody, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Length": errorBody.length.toString()
        },
        status: 400,
      });
    }

    const subscription: any = session.subscription;
    const currentPeriodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
    const priceAmount = subscription?.items?.data?.[0]?.price?.unit_amount ?? 0;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    
    // Determine plan interval (monthly vs yearly)
    const planInterval = subscription?.items?.data?.[0]?.plan?.interval || 
                         subscription?.items?.data?.[0]?.price?.recurring?.interval || 
                         'year';
    log("Detected plan interval", { planInterval });

    // Determine tier from amount (simple mapping)
    let tier: string | null = null;
    if (priceAmount <= 299) tier = "Basic"; else if (priceAmount <= 1499) tier = "Premium"; else tier = "Enterprise";

    // Supabase admin client (service role)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if a user exists
    log("Checking if user exists", { email });
    const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw new Error(`List users failed: ${listErr.message}`);

    const matched = usersList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    const authUserExists = !!matched;
    let userId: string | null = matched?.id ?? null;

    // Check if subscriber record exists and is linked
    let existingUser = false;
    if (authUserExists && userId) {
      log("Auth user found, checking for linked subscriber", { userId });
      const { data: subData } = await supabase
        .from("subscribers")
        .select("user_id")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      
      // Only treat as existing user if they have a linked subscriber record
      existingUser = !!(subData?.user_id);
      
      if (existingUser) {
        log("Existing user with linked subscriber found", { userId });
      } else {
        log("Auth user exists but no linked subscriber - needs account setup", { userId, email });
      }
    } else {
      // For new users, we'll store payment info without creating account yet
      log("New user - will need account setup", { email });
      userId = null; // Account will be created by client after payment verification
    }

    // Calculate additional pets from subscription items if available
    let additionalPets = 0;
    if (subscription?.items?.data) {
      for (const item of subscription.items.data) {
        const price = item.price;
        const product: any = price.product;
        
        // Check price metadata first, then product metadata
        const priceMetadata = price.metadata || {};
        const productMetadata = product?.metadata || {};
        
        if (priceMetadata.plan === 'addon' && priceMetadata.type === 'additional_pets') {
          const addsPerUnit = parseInt(priceMetadata.adds_per_unit || '1', 10);
          additionalPets += (item.quantity || 1) * addsPerUnit;
        } else if (productMetadata.product_type === 'pet_slot') {
          const addonCount = parseInt(productMetadata.addon_count || '1', 10);
          additionalPets += (item.quantity || 1) * addonCount;
        }
      }
    }

    // Calculate total pet limit: base (1) + additional pets
    const petLimit = 1 + additionalPets;

    // Upsert subscriber row with immediate activation; skip user_id if not known yet
    log("Upserting subscriber", { additionalPets, petLimit, planInterval, hasUserId: !!userId });
    const upsertData: any = {
      email,
      stripe_customer_id: customerId ?? null,
      subscribed: true,
      status: 'active',
      subscription_tier: tier,
      subscription_end: currentPeriodEnd,
      pet_limit: petLimit,
      additional_pets: additionalPets,
      plan_interval: planInterval, // Track plan interval for referral eligibility
      // Clear any grace period fields on successful checkout
      grace_period_end: null,
      payment_failed_at: null,
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      upsertData.user_id = userId;
    }

    const { error: upsertErr } = await supabase
      .from("subscribers")
      .upsert(upsertData, { onConflict: "email" });
    if (upsertErr) throw new Error(`Upsert subscriber failed: ${upsertErr.message}`);

    log("Subscriber upserted successfully", { email, petLimit, planInterval });

    // Link referral if code exists in subscription metadata AND plan is yearly
    const referralCode = subscription?.metadata?.referral_code;
    if (referralCode && userId && planInterval === 'year') {
      log("Processing referral code", { referralCode, userId });
      
      try {
        const { data: referralData } = await supabase
          .from('referrals')
          .select('id')
          .eq('referral_code', referralCode)
          .is('referred_user_id', null)
          .single();
        
        if (referralData) {
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : new Date().toISOString();
          
          // Update referrals table
          await supabase
            .from('referrals')
            .update({
              referred_user_id: userId,
              trial_completed_at: trialEnd,
              referred_plan_interval: 'year',
              updated_at: new Date().toISOString()
            })
            .eq('id', referralData.id);
          
          // Update referral_visits to mark conversion
          await supabase
            .from('referral_visits')
            .update({
              converted_user_id: userId,
              converted_at: new Date().toISOString(),
              plan_type: 'yearly'
            })
            .eq('referral_code', referralCode)
            .is('converted_user_id', null)
            .order('visited_at', { ascending: false })
            .limit(1);
          
          log("Referral linked successfully", { referralId: referralData.id });
        }
      } catch (refError) {
        log("Error linking referral (non-fatal)", { error: refError.message });
      }
    }

    const responseBody = JSON.stringify({ success: true, needsAccountSetup: !existingUser, existingUser, email });
    return new Response(responseBody, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Length": responseBody.length.toString()
      },
      status: 200,
    });
  } catch (error: any) {
    log("ERROR", { message: error?.message });
    const errorBody = JSON.stringify({ error: error?.message || "Unexpected error" });
    return new Response(errorBody, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Length": errorBody.length.toString()
      },
      status: 500,
    });
  }
});
