import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[verify-addons-sandbox] ${step} ${details ? JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("start");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY_TEST");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY_TEST");

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    log("session retrieved", { id: session.id, mode: session.mode, status: session.payment_status });

    if (session.mode !== "subscription") {
      throw new Error("Session is not a subscription");
    }
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!customerId) throw new Error("No customer on session");

    const customer = await stripe.customers.retrieve(customerId);
    const email = ("email" in customer ? customer.email : null) || session.customer_details?.email || (session.customer_email as string | undefined);
    if (!email) throw new Error("No email found for customer");

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      expand: ["data.items.data.price.product"],
    });

    let totalSlots = 0;
    for (const s of subs.data) {
      if (s.status !== "active" && s.status !== "trialing") continue;
      for (const item of s.items.data) {
        const product: any = (item.price.product as any) || null;
        const productType = product?.metadata?.product_type;
        if (productType === "pet_slot") {
          const addonCountStr = product?.metadata?.addon_count;
          const addonCount = addonCountStr ? parseInt(addonCountStr, 10) : 1;
          const qty = item.quantity ?? 1;
          totalSlots += addonCount * qty;
        }
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("email, user_id")
      .eq("email", email)
      .maybeSingle();

    const userId = (session.metadata as any)?.supabase_user_id || existing?.user_id || null;

    const { error: upsertErr } = await supabaseAdmin
      .from("subscribers")
      .upsert(
        {
          email,
          user_id: userId,
          stripe_customer_id: customerId,
          additional_pets: totalSlots,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    if (upsertErr) throw upsertErr;

    log("success", { email, totalSlots });
    return new Response(
      JSON.stringify({ success: true, email, added: totalSlots, additional_pets: totalSlots }),
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
