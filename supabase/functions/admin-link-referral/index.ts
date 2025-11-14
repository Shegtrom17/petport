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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    
    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();
    
    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { referral_code, referred_user_email } = await req.json();

    if (!referral_code || !referred_user_email) {
      return new Response(
        JSON.stringify({ error: "Missing referral_code or referred_user_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ADMIN-LINK-REFERRAL] Request:", { referral_code, referred_user_email });

    // Get referred user ID from email
    const { data: users } = await supabaseClient.auth.admin.listUsers();
    const referredUser = users.users.find(u => u.email === referred_user_email);
    
    if (!referredUser) {
      return new Response(
        JSON.stringify({ error: `User not found: ${referred_user_email}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get subscriber info to confirm yearly plan
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("plan_interval, status")
      .eq("user_id", referredUser.id)
      .single();

    if (!subscriber || subscriber.plan_interval !== "year") {
      return new Response(
        JSON.stringify({ 
          error: "User must have a yearly subscription to qualify for referral commission",
          current_plan: subscriber?.plan_interval || "none",
          status: subscriber?.status || "none"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the referral code owner's blank referral record
    const { data: referralData, error: findError } = await supabaseClient
      .from("referrals")
      .select("id, referrer_user_id, referred_user_id")
      .eq("referral_code", referral_code)
      .is("referred_user_id", null)
      .single();

    if (findError || !referralData) {
      return new Response(
        JSON.stringify({ 
          error: "Referral code not found or already used",
          code: referral_code
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate trial end date (7 days from user creation)
    const userCreatedAt = new Date(referredUser.created_at);
    const trialEndDate = new Date(userCreatedAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Update the referral record
    const { error: updateError } = await supabaseClient
      .from("referrals")
      .update({
        referred_user_id: referredUser.id,
        referred_plan_interval: "year",
        trial_completed_at: trialEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", referralData.id);

    if (updateError) {
      console.error("[ADMIN-LINK-REFERRAL] Update error:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ADMIN-LINK-REFERRAL] Successfully linked:", {
      referral_id: referralData.id,
      referrer_user_id: referralData.referrer_user_id,
      referred_user_id: referredUser.id,
      referred_email: referred_user_email,
      trial_end: trialEndDate.toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Referral linked successfully",
        referral_id: referralData.id,
        referred_user: referred_user_email,
        trial_end: trialEndDate.toISOString(),
        approval_date: new Date(trialEndDate.getTime() + (38 * 24 * 60 * 60 * 1000)).toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[ADMIN-LINK-REFERRAL] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
