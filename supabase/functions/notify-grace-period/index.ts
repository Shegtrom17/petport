import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GracePeriodNotification {
  userEmail: string;
  userName?: string;
  status: 'started' | 'reminder' | 'expired';
  gracePeriodEnd?: string;
  daysRemaining?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, status, gracePeriodEnd, daysRemaining }: GracePeriodNotification = await req.json();
    
    console.log("Sending grace period notification:", { userEmail, status, daysRemaining });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let emailType: string;
    let emailSubject: string;
    
    switch (status) {
      case 'started':
        emailType = 'grace_period_started';
        emailSubject = '⚠️ Payment Failed - Your PetPort Account is in Grace Period';
        break;
      case 'reminder':
        emailType = 'grace_period_reminder';
        emailSubject = `⏰ ${daysRemaining} Days Left - PetPort Grace Period Ending Soon`;
        break;
      case 'expired':
        emailType = 'grace_period_expired';
        emailSubject = '🚫 PetPort Account Suspended - Reactivate Now';
        break;
      default:
        throw new Error(`Unknown status: ${status}`);
    }

    // Call send-email function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: emailType,
        recipientEmail: userEmail,
        recipientName: userName,
        gracePeriodEnd,
        daysRemaining,
        subject: emailSubject
      }
    });

    if (error) {
      console.error("Error sending grace period email:", error);
      throw error;
    }

    console.log("Grace period notification sent successfully");

    return new Response(
      JSON.stringify({ success: true, emailType }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in notify-grace-period:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
