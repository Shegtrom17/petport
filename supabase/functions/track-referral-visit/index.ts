import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referral_code } = await req.json();

    if (!referral_code) {
      return new Response(
        JSON.stringify({ error: "Missing referral_code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the referral code exists
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: referralExists } = await supabaseClient
      .from("referrals")
      .select("referral_code")
      .eq("referral_code", referral_code)
      .is("referred_user_id", null)
      .single();

    if (!referralExists) {
      console.log("[TRACK-REFERRAL-VISIT] Invalid or used referral code:", referral_code);
      return new Response(
        JSON.stringify({ error: "Invalid referral code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IP address and user agent
    const ip_address = req.headers.get("x-forwarded-for") || 
                       req.headers.get("x-real-ip") || 
                       "unknown";
    const user_agent = req.headers.get("user-agent") || "unknown";

    // Track the visit
    const { error: insertError } = await supabaseClient
      .from("referral_visits")
      .insert({
        referral_code,
        ip_address,
        user_agent,
      });

    if (insertError) {
      console.error("[TRACK-REFERRAL-VISIT] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[TRACK-REFERRAL-VISIT] Visit tracked:", {
      referral_code,
      ip_address: ip_address.substring(0, 10) + "...", // Partial log for privacy
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[TRACK-REFERRAL-VISIT] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
