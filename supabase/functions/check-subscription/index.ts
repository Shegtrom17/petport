import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step} ${details ? JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Start");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      await supabaseService.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        status: 'inactive',
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      const responseBody = JSON.stringify({ subscribed: false });
      return new Response(responseBody, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Length": responseBody.length.toString()
        },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      expand: ["data.items.data.price"],
    });

    const activeOrTrialing = subscriptions.data.filter((s: any) => s.status === "active" || s.status === "trialing");
    const hasActiveSub = activeOrTrialing.length > 0;

    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;

    // Determine tier/end from the first active or trialing subscription
    const matchedSub = activeOrTrialing[0];
    if (matchedSub) {
      const endTs = matchedSub.status === "trialing" && matchedSub.trial_end
        ? matchedSub.trial_end
        : matchedSub.current_period_end;
      if (endTs) subscriptionEnd = new Date(endTs * 1000).toISOString();

      const priceId = matchedSub.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      if (amount <= 999) subscriptionTier = "Basic";
      else if (amount <= 1999) subscriptionTier = "Premium";
      else subscriptionTier = "Enterprise";
    }

    // Compute total additional pet slots from all active/trialing subscriptions
    let additionalPets = 0;
    for (const s of activeOrTrialing) {
      for (const item of s.items.data) {
        const price = item.price;
        const priceId = price.id;
        
        // Retrieve the price with product expanded separately
        const priceWithProduct = await stripe.prices.retrieve(priceId, { expand: ['product'] });
        const product: any = priceWithProduct.product || null;
        
        // Check price metadata first (preferred), then product metadata
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

    // Determine subscription status with 14-day grace logic
    let status = 'inactive';
    let gracePeriodEnd: string | null = null;
    let paymentFailedAt: string | null = null;

    if (hasActiveSub) {
      // Active subscription - clear grace period
      status = 'active';
      gracePeriodEnd = null;
      paymentFailedAt = null;
    } else {
      // Check for past_due, unpaid, or incomplete subscriptions
      const allSubs = subscriptions.data;
      const problemSubs = allSubs.filter((s: any) => 
        s.status === 'past_due' || 
        s.status === 'unpaid' || 
        s.status === 'incomplete'
      );

      if (problemSubs.length > 0) {
        // Get existing subscriber data to check current grace status
        const { data: existingSub } = await supabaseService
          .from("subscribers")
          .select("grace_period_end, payment_failed_at, status")
          .eq("email", user.email)
          .maybeSingle();

        const now = new Date();
        const existingGraceEnd = existingSub?.grace_period_end ? new Date(existingSub.grace_period_end) : null;

        if (!existingGraceEnd) {
          // No grace period set yet - start 14-day grace
          status = 'grace';
          gracePeriodEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days from now
          paymentFailedAt = now.toISOString();
        } else if (now <= existingGraceEnd) {
          // Still within grace period - keep full access
          status = 'grace';
          gracePeriodEnd = existingGraceEnd.toISOString();
          paymentFailedAt = existingSub?.payment_failed_at || now.toISOString();
        } else {
          // Grace period expired - suspend access
          status = 'suspended';
          gracePeriodEnd = existingGraceEnd.toISOString();
          paymentFailedAt = existingSub?.payment_failed_at || now.toISOString();
        }
      }
    }

    await supabaseService.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      status: status as any,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      additional_pets: additionalPets,
      pet_limit: petLimit,
      grace_period_end: gracePeriodEnd,
      payment_failed_at: paymentFailedAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    const responseBody = JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      additional_pets: additionalPets,
      pet_limit: petLimit,
      status: status,
      grace_period_end: gracePeriodEnd,
    });
    return new Response(responseBody, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Length": responseBody.length.toString()
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    const errorBody = JSON.stringify({ error: message });
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
