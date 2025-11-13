import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

const log = (msg: string, extra?: unknown) =>
  console.log(`[CHECK-SUBSCRIPTION-SAFE] ${msg}${extra ? ` ${JSON.stringify(extra)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Start");

    // Secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id || !user.email) throw new Error("User not authenticated or email not available");

    // Load existing subscriber record (to avoid false downgrades)
    const { data: existingSub, error: existingErr } = await supabase
      .from("subscribers")
      .select("stripe_customer_id, status, subscribed, subscription_end, pet_limit, additional_pets")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingErr) log("Existing subscriber lookup error", { message: existingErr.message });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Prefer a known customer id; otherwise fall back to email lookup
    let customerId = existingSub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    // If we still don't have a Stripe customer, DO NOT DOWNGRADE a clearly active user
    if (!customerId) {
      log("No Stripe customer found by id or email", { email: user.email });

      const now = new Date();
      const subEnd = existingSub?.subscription_end ? new Date(existingSub.subscription_end) : null;
      const looksActive =
        (existingSub?.status === "active") ||
        (subEnd !== null && subEnd > now) ||
        (existingSub?.subscribed === true);

      if (looksActive) {
        log("Preserving active status due to existing record", existingSub);
        // Light touch upsert to ensure user_id/email are linked but without overwriting fields
        await supabase
          .from("subscribers")
          .upsert({ email: user.email, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: "email" });

        const responseBody = JSON.stringify({
          subscribed: true,
          status: "active",
          subscription_tier: null,
          subscription_end: existingSub?.subscription_end ?? null,
          additional_pets: existingSub?.additional_pets ?? 0,
          pet_limit: existingSub?.pet_limit ?? 1,
          grace_period_end: null,
        });
        return new Response(responseBody, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Otherwise keep the prior behavior (mark as inactive)
      // CRITICAL: Do NOT set stripe_customer_id to null - preserve existing value
      const inactiveUpdate: any = {
        email: user.email,
        user_id: user.id,
        subscribed: false,
        status: "inactive" as any,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      };
      
      // Only set stripe_customer_id to null if it doesn't already exist
      if (!existingSub?.stripe_customer_id) {
        inactiveUpdate.stripe_customer_id = null;
      }
      
      await supabase.from("subscribers").upsert(inactiveUpdate, { onConflict: "email" });

      const responseBody = JSON.stringify({ subscribed: false });
      return new Response(responseBody, { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // At this point we have a customer id -> fetch subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      expand: ["data.items.data.price"],
    });

    const activeOrTrialing = subscriptions.data.filter((s: any) => s.status === "active" || s.status === "trialing");
    const hasActiveSub = activeOrTrialing.length > 0;

    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;

    const matchedSub = activeOrTrialing[0];
    if (matchedSub) {
      const endTs = matchedSub.status === "trialing" && matchedSub.trial_end ? matchedSub.trial_end : matchedSub.current_period_end;
      if (endTs) subscriptionEnd = new Date(endTs * 1000).toISOString();

      const priceId = matchedSub.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      if (amount <= 999) subscriptionTier = "Basic";
      else if (amount <= 1999) subscriptionTier = "Premium";
      else subscriptionTier = "Enterprise";
    }

    // Compute additional pet slots
    let additionalPets = 0;
    for (const s of activeOrTrialing) {
      for (const item of s.items.data) {
        const price = item.price;
        const priceId = price.id;
        const priceWithProduct = await stripe.prices.retrieve(priceId, { expand: ["product"] });
        const product: any = priceWithProduct.product || null;

        const priceMetadata = price.metadata || {};
        const productMetadata = product?.metadata || {};

        if (priceMetadata.plan === "addon" && priceMetadata.type === "additional_pets") {
          const addsPerUnit = parseInt(priceMetadata.adds_per_unit || "1", 10);
          additionalPets += (item.quantity || 1) * addsPerUnit;
        } else if (productMetadata.product_type === "pet_slot") {
          const addonCount = parseInt(productMetadata.addon_count || "1", 10);
          additionalPets += (item.quantity || 1) * addonCount;
        }
      }
    }

    const petLimit = 1 + additionalPets;

    // Status with 14-day grace logic
    let status: "inactive" | "active" | "grace" | "suspended" = "inactive";
    let gracePeriodEnd: string | null = null;
    let paymentFailedAt: string | null = null;

    if (hasActiveSub) {
      status = "active";
      gracePeriodEnd = null;
      paymentFailedAt = null;
    } else {
      const allSubs = subscriptions.data;
      const problemSubs = allSubs.filter((s: any) => s.status === "past_due" || s.status === "unpaid" || s.status === "incomplete");

      if (problemSubs.length > 0) {
        const { data: existing } = await supabase
          .from("subscribers")
          .select("grace_period_end, payment_failed_at, status")
          .eq("email", user.email)
          .maybeSingle();

        const now = new Date();
        const existingGraceEnd = existing?.grace_period_end ? new Date(existing.grace_period_end) : null;

        if (!existingGraceEnd) {
          status = "grace";
          gracePeriodEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
          paymentFailedAt = now.toISOString();
        } else if (now <= existingGraceEnd) {
          status = "grace";
          gracePeriodEnd = existingGraceEnd.toISOString();
          paymentFailedAt = existing?.payment_failed_at || now.toISOString();
        } else {
          status = "suspended";
          gracePeriodEnd = existingGraceEnd.toISOString();
          paymentFailedAt = existing?.payment_failed_at || now.toISOString();
        }
      }
    }

    // Persist - CRITICAL: Protect existing stripe_customer_id from NULL overwrites
    const updatePayload: any = {
      email: user.email,
      user_id: user.id,
      subscribed: hasActiveSub,
      status: status as any,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      additional_pets: additionalPets,
      pet_limit: petLimit,
      grace_period_end: gracePeriodEnd,
      payment_failed_at: paymentFailedAt,
      updated_at: new Date().toISOString(),
    };
    
    // SAFEGUARD: Only update stripe_customer_id if we have a valid value
    // OR if there's no existing value (don't overwrite with null)
    if (customerId) {
      // We have a valid Stripe customer ID - safe to update
      updatePayload.stripe_customer_id = customerId;
      log("Updating stripe_customer_id", { 
        customerId, 
        hadExisting: !!existingSub?.stripe_customer_id 
      });
    } else if (!existingSub?.stripe_customer_id) {
      // No existing ID and no new ID - can safely set to null for new records
      updatePayload.stripe_customer_id = null;
      log("Setting stripe_customer_id to null for new record");
    } else {
      // CRITICAL: We have an existing ID but no new ID - preserve existing
      log("⚠️ PROTECTED: Preserving existing stripe_customer_id", { 
        existingId: existingSub.stripe_customer_id 
      });
      // Don't include stripe_customer_id in update to preserve existing value
    }
    
    await supabase.from("subscribers").upsert(updatePayload, { onConflict: "email" });

    const responseBody = JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      additional_pets: additionalPets,
      pet_limit: petLimit,
      status,
      grace_period_end: gracePeriodEnd,
    });

    return new Response(responseBody, { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (err) {
    log("Error", { message: (err as Error).message });
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
