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
    if (!stripeSecret) {
      console.error('[PUBLIC-CREATE-CHECKOUT] Missing STRIPE_SECRET_KEY');
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const { plan, referral_code, additional_pets } = await req.json();
    console.log('[PUBLIC-CREATE-CHECKOUT] Request:', { plan, referral_code, additional_pets });
    
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

    const additionalPets = additional_pets || 0;
    
    // Validate additional pets
    if (additionalPets < 0 || additionalPets > 19) {
      const errorBody = JSON.stringify({ error: "Additional pets must be between 0 and 19" });
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

    // Build line items - base subscription plus optional additional pets
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: { 
            name: `PetPort ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
            description: `Includes ${1 + additionalPets} pet account${additionalPets > 0 ? 's' : ''}`
          },
          unit_amount: amount,
          recurring: { interval },
        },
        quantity: 1,
      },
    ];

    // Add additional pets as separate recurring line item if > 0
    if (additionalPets > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Additional Pet Accounts",
            description: `${additionalPets} additional pet account${additionalPets > 1 ? 's' : ''}`,
          },
          unit_amount: 399, // $3.99 per year
          recurring: { interval: "year" },
        },
        quantity: additionalPets,
      });
    }
    
    console.log('[PUBLIC-CREATE-CHECKOUT] Line items:', JSON.stringify(lineItems));

    console.log('[PUBLIC-CREATE-CHECKOUT] Creating Stripe session');
    
    const sessionParams: any = {
      mode: "subscription",
      line_items: lineItems,
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          ...(referral_code ? { referral_code } : {}),
          additional_pets: additionalPets.toString(),
        },
      },
      success_url: `${origin}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      allow_promotion_codes: true,
      // Automatically apply REFERRAL10 discount for referred users
      ...(referral_code && plan === "yearly" ? {
        discounts: [{ coupon: 'REFERRAL10' }]
      } : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

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
    console.error('[PUBLIC-CREATE-CHECKOUT] Error:', error.message, error.stack);
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
