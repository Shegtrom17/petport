import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting grace period reminder check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find users in grace period with 3 or fewer days remaining
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: expiringUsers, error: queryError } = await supabase
      .from('subscribers')
      .select('user_id, email, grace_period_end')
      .eq('status', 'grace')
      .not('grace_period_end', 'is', null)
      .lte('grace_period_end', threeDaysFromNow.toISOString());

    if (queryError) {
      console.error("Error querying subscribers:", queryError);
      throw queryError;
    }

    if (!expiringUsers || expiringUsers.length === 0) {
      console.log("No users found with expiring grace periods");
      return new Response(
        JSON.stringify({ message: "No reminders to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${expiringUsers.length} users with expiring grace periods`);

    const results = [];

    for (const subscriber of expiringUsers) {
      try {
        const graceEndDate = new Date(subscriber.grace_period_end);
        const now = new Date();
        const daysRemaining = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
          // Grace period has already expired, skip
          continue;
        }

        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', subscriber.user_id)
          .single();

        // Send reminder email
        const { error: emailError } = await supabase.functions.invoke('notify-grace-period', {
          body: {
            userEmail: subscriber.email,
            userName: profile?.full_name,
            status: 'reminder',
            gracePeriodEnd: subscriber.grace_period_end,
            daysRemaining
          }
        });

        if (emailError) {
          console.error(`Failed to send reminder to ${subscriber.email}:`, emailError);
          results.push({ email: subscriber.email, success: false, error: emailError.message });
        } else {
          console.log(`Reminder sent to ${subscriber.email} (${daysRemaining} days remaining)`);
          results.push({ email: subscriber.email, success: true, daysRemaining });
        }
      } catch (error) {
        console.error(`Error processing user ${subscriber.email}:`, error);
        results.push({ email: subscriber.email, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} reminders`,
        results 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in send-grace-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
