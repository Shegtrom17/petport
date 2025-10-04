import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId } = await req.json();

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    console.log(`Creating Stripe Connect account for user: ${user.id}`);

    // Check if user already has a Stripe Connect account
    const { data: payoutData } = await supabaseClient
      .from("user_payouts")
      .select("stripe_connect_id, onboarding_status")
      .eq("user_id", user.id)
      .maybeSingle();

    let accountId = payoutData?.stripe_connect_id;
    let isNewAccount = false;

    // Create or retrieve Stripe Connect account
    if (!accountId) {
      console.log("Creating new Stripe Connect Express account");
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      accountId = account.id;
      isNewAccount = true;
      console.log(`Created Stripe Connect account: ${accountId}`);

      // Store account ID in database
      const { error: upsertError } = await supabaseClient
        .from("user_payouts")
        .upsert({
          user_id: user.id,
          stripe_connect_id: accountId,
          onboarding_status: "pending",
        });

      if (upsertError) {
        console.error("Failed to store Stripe Connect ID:", upsertError);
        throw upsertError;
      }
    }

    // Create Account Link for onboarding
    const returnUrl = `${Deno.env.get("APP_ORIGIN")}/referrals?stripe=success`;
    const refreshUrl = `${Deno.env.get("APP_ORIGIN")}/referrals?stripe=refresh`;

    console.log(`Creating account link for account: ${accountId}`);
    console.log(`Return URL: ${returnUrl}`);
    console.log(`Refresh URL: ${refreshUrl}`);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    console.log(`Account link created: ${accountLink.url}`);

    // Update onboarding status
    if (isNewAccount || payoutData?.onboarding_status !== "pending") {
      await supabaseClient
        .from("user_payouts")
        .update({ onboarding_status: "pending" })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: accountId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in stripe-connect-onboard:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
