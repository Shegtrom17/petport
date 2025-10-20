import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) throw new Error("Missing STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const { plan, referral_code } = await req.json();
    if (plan !== "monthly" && plan !== "yearly") {
      const errorBody = JSON.stringify({ error: "Invalid plan" });
      return new Response(errorBody, { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Length": errorBody.length.toString()
        } 
      });
    }

    const amount = plan === "monthly" ? 199 : 1499; // cents
    const interval = plan === "monthly" ? "month" : "year";

    const origin = req.headers.get("origin") || "https://petport.app";

    // Apply 10% discount for yearly plans with referral code
    const discounts = referral_code && plan === "yearly" 
      ? [{ coupon: "REFERRAL10" }] 
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `PetPort ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription` },
            unit_amount: amount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
        metadata: referral_code ? { referral_code } : {},
      },
      discounts,
      success_url: `${origin}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      allow_promotion_codes: true,
    });
    
    if (referral_code) {
      console.log('[PUBLIC-CREATE-CHECKOUT] Referral code attached to session:', referral_code);
    }

    const responseBody = JSON.stringify({ url: session.url });
    return new Response(responseBody, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Length": responseBody.length.toString()
      },
      status: 200,
    });
  } catch (error: any) {
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
