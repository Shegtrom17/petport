import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY_TEST");
    if (!stripeSecret) throw new Error("Missing STRIPE_SECRET_KEY_TEST");
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const { plan } = await req.json();
    if (plan !== "monthly" && plan !== "yearly") {
      return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const amount = plan === "monthly" ? 199 : 1299; // cents
    const interval = plan === "monthly" ? "month" : "year";

    const origin = req.headers.get("origin") || "https://petport.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `PetPort ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription (Sandbox)` },
            unit_amount: amount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
      },
      allow_promotion_codes: true,
      success_url: `${origin}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unexpected error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
