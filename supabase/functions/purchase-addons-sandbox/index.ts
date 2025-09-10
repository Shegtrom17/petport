import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AddonType = "individual" | "bundle";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY_TEST");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY_TEST");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User email not available");

    // Parse request body to determine the addon type and quantity
    const { type, quantity } = await req.json();
    if (!type || !["individual", "bundle"].includes(type)) {
      throw new Error("Invalid addon type. Must be 'individual' or 'bundle'.");
    }
    if (!quantity || quantity < 1) {
      throw new Error("Invalid quantity. Must be at least 1.");
    }

    console.log(`Creating checkout session for ${type} addon with quantity ${quantity}`);

    // Determine pricing based on addon type
    let amount: number;
    let productName: string;
    let checkoutQuantity = 1;

    if (type === "individual") {
      amount = 399; // $3.99 per pet
      productName = "Additional Pet Account";
      checkoutQuantity = quantity; // Use the requested quantity
    } else {
      // Bundle: 5 pets for $12.99
      amount = 1299; // $12.99
      productName = "Foster & Multi-Pet Bundle (5 pets)";
      checkoutQuantity = quantity; // Usually 1 bundle, but allow multiple
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `PetPort ${productName} - Annual (Sandbox)`,
              metadata: {
                product_type: "pet_slot",
                addon_type: type,
                pet_slots: type === "individual" ? quantity.toString() : "5",
              },
            },
            unit_amount: amount,
            recurring: { interval: "year" },
          },
          quantity: checkoutQuantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/billing`,
      metadata: {
        addon_type: type,
        pet_slots: type === "individual" ? quantity.toString() : "5",
        user_id: user.id,
        original_quantity: quantity.toString(),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
