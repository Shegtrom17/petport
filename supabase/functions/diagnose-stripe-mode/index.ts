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
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    console.log('[DIAGNOSE-STRIPE] Secret key prefix:', stripeSecret.substring(0, 12));

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    // Retrieve account to check mode
    const account = await stripe.accounts.retrieve();

    const diagnostics = {
      keyPrefix: stripeSecret.substring(0, 12),
      isLiveMode: !stripeSecret.startsWith('sk_test_'),
      accountId: account.id,
      accountName: account.business_profile?.name || 'N/A',
      country: account.country,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      timestamp: new Date().toISOString()
    };

    console.log('[DIAGNOSE-STRIPE] Results:', JSON.stringify(diagnostics, null, 2));

    return new Response(JSON.stringify(diagnostics, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('[DIAGNOSE-STRIPE] Error:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
