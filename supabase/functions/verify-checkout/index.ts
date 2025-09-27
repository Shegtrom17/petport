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
    let existingUser = !!matched;
    let userId: string | null = matched?.id ?? null;

    if (existingUser) {
      log("Existing user found", { userId });
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

    // Upsert subscriber row with immediate activation
    log("Upserting subscriber", { additionalPets, petLimit });
    const { error: upsertErr } = await supabase.from("subscribers").upsert({
      email,
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      subscribed: true,
      status: 'active',
      subscription_tier: tier,
      subscription_end: currentPeriodEnd,
      pet_limit: petLimit,
      additional_pets: additionalPets,
      // Clear any grace period fields on successful checkout
      grace_period_end: null,
      payment_failed_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
    if (upsertErr) throw new Error(`Upsert subscriber failed: ${upsertErr.message}`);

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
