import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUSPEND-EXPIRED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting grace period expiration check");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find users in grace period with expired grace period
    const { data: expiredUsers, error } = await supabaseClient
      .from("subscribers")
      .select("user_id, email")
      .eq("status", "grace")
      .lt("grace_period_end", new Date().toISOString());

    if (error) {
      throw error;
    }

    logStep("Found expired grace period users", { count: expiredUsers?.length || 0 });

    if (expiredUsers && expiredUsers.length > 0) {
      // Update all expired users to suspended status
      for (const user of expiredUsers) {
        await supabaseClient.rpc("update_subscriber_status", {
          _user_id: user.user_id,
          _status: 'suspended',
          _suspended_at: new Date().toISOString()
        });

        logStep("Suspended user", { userId: user.user_id, email: user.email });
      }
    }

    return new Response(JSON.stringify({ 
      processed: expiredUsers?.length || 0,
      message: "Grace period expiration check completed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in suspend-expired-grace", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});