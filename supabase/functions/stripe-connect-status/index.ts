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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's payout info
    const { data: payoutData, error: payoutError } = await supabaseClient
      .from("user_payouts")
      .select("stripe_connect_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (payoutError) {
      throw payoutError;
    }

    if (!payoutData?.stripe_connect_id) {
      return new Response(
        JSON.stringify({
          status: "not_started",
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get account status from Stripe
    const account = await stripe.accounts.retrieve(
      payoutData.stripe_connect_id
    );

    console.log(
      `Stripe account status for ${user.id}:`,
      JSON.stringify({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      })
    );

    // Determine onboarding status
    let onboardingStatus = "pending";
    if (account.details_submitted && account.payouts_enabled) {
      onboardingStatus = "completed";
    }

    // Update database with latest status
    await supabaseClient
      .from("user_payouts")
      .update({ onboarding_status: onboardingStatus })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        status: onboardingStatus,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in stripe-connect-status:", error);
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
