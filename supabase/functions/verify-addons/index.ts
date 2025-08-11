import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[verify-addons] ${step} ${details ? JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("start");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    log("session retrieved", { id: session.id, mode: session.mode, status: session.payment_status });

    if (session.mode !== "payment") {
      throw new Error("Session is not a one-time payment");
    }
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Extract metadata and email
    const addonCountStr = (session.metadata as any)?.addon_count as string | undefined;
    const addonCount = addonCountStr ? parseInt(addonCountStr, 10) : NaN;
    if (!addonCount || isNaN(addonCount) || ![1, 3, 5].includes(addonCount)) {
      throw new Error("Invalid or missing add-on count in session metadata");
    }

    // Prefer customer_details.email which is present on successful Checkout
    const email = session.customer_details?.email || (session.customer_email as string | undefined);
    if (!email) throw new Error("No email found on session");

    const userId = (session.metadata as any)?.supabase_user_id as string | undefined;

    // Admin client for DB writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch existing subscriber row by email
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("email, user_id, additional_pets, additional_pets_purchased")
      .eq("email", email)
      .maybeSingle();

    const newAdditional = (existing?.additional_pets ?? 0) + addonCount;
    const newPurchased = (existing?.additional_pets_purchased ?? 0) + addonCount;

    // Upsert subscriber totals
    const { error: upsertErr } = await supabaseAdmin
      .from("subscribers")
      .upsert(
        {
          email,
          user_id: userId ?? existing?.user_id ?? null,
          additional_pets: newAdditional,
          additional_pets_purchased: newPurchased,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    if (upsertErr) throw upsertErr;

    // Record order as paid
    const { error: orderErr } = await supabaseAdmin.from("orders").insert({
      user_id: userId ?? existing?.user_id ?? null,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
      stripe_session_id: session.id,
      quantity: addonCount,
      product_type: "pet_slot",
    });
    if (orderErr) throw orderErr;

    log("success", { email, addonCount });
    return new Response(
      JSON.stringify({ success: true, email, added: addonCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", { message });
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
