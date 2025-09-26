import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SETUP-STRIPE-WEBHOOK] ${step}${details ? " " + JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Require setup token to prevent unauthorized access
    const url = new URL(req.url);
    const providedToken = url.searchParams.get("token");
    const expectedToken = Deno.env.get("SETUP_TOKEN");
    
    if (!expectedToken) {
      throw new Error("SETUP_TOKEN is not configured");
    }
    
    if (providedToken !== expectedToken) {
      log("Unauthorized access attempt", { providedToken: providedToken ? "***" : null });
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized: Invalid or missing token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    log("Authorized setup request");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Target webhook endpoint (Supabase Edge Function URL)
    const endpointUrl = "https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/stripe-webhook";

    // Events our webhook function handles
    const enabledEvents = [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
      "invoice.paid",
      "invoice.payment_failed",
    ];

    log("Listing existing webhook endpoints");
    const existingList = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = existingList.data.find((e: any) => e.url === endpointUrl);

    if (existing) {
      log("Updating existing webhook endpoint", { id: existing.id });
      const updated = await stripe.webhookEndpoints.update(existing.id, {
        enabled_events: enabledEvents,
        api_version: "2023-10-16",
        description: "PetPort Supabase webhook",
      });

      return new Response(
        JSON.stringify({
          ok: true,
          status: "updated",
          endpoint_id: updated.id,
          url: endpointUrl,
          next_steps:
            "Open Stripe → Developers → Webhooks → this endpoint → Reveal Signing secret (whsec_...) and paste it into Supabase as STRIPE_WEBHOOK_SECRET.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      log("Creating webhook endpoint");
      // Note: Stripe returns `secret` only on create; capture it to help setup.
      const created = (await stripe.webhookEndpoints.create({
        url: endpointUrl,
        api_version: "2023-10-16",
        enabled_events: enabledEvents,
        description: "PetPort Supabase webhook",
      })) as Stripe.Response<Stripe.WebhookEndpoint & { secret?: string }>; 

      return new Response(
        JSON.stringify({
          ok: true,
          status: "created",
          endpoint_id: created.id,
          url: endpointUrl,
          // If present, show it so you can immediately store it. It will not be retrievable again from the API.
          secret: created.secret ?? null,
          note:
            created.secret
              ? "This Signing secret is shown only once. Store it safely and paste it into Supabase as STRIPE_WEBHOOK_SECRET."
              : "If no secret is shown here, reveal it in Stripe dashboard on the endpoint page.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});