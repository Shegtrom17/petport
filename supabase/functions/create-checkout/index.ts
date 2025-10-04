import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Plan = "monthly" | "yearly";

serve(async (req) => {
  console.log("[create-checkout] start", { method: req.method });
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User email not available");

    const { plan }: { plan?: Plan } = await req.json().catch(() => ({}));
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      throw new Error("Invalid plan. Use 'monthly' or 'yearly'.");
    }

    const price = plan === "monthly" ? 199 : 1499;
    const interval = plan === "monthly" ? "month" : "year";

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
            product_data: { name: `PetPort ${plan === "monthly" ? "Monthly" : "Yearly"} Subscription` },
            unit_amount: price,
            recurring: { interval: interval as "month" | "year" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
      },
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[create-checkout] error", { message, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
