import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CORRUPTION-CHECK] Starting corruption scan at', new Date().toISOString());

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all corrupted records: NULL stripe_customer_id with active/grace status
    const { data: corruptedRecords, error } = await supabase
      .from('subscribers')
      .select('user_id, email, stripe_customer_id, status, updated_at')
      .is('stripe_customer_id', null)
      .in('status', ['active', 'grace']);

    if (error) {
      console.error('[CORRUPTION-CHECK] Database error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log('[CORRUPTION-CHECK] Found', corruptedRecords?.length || 0, 'corrupted records');

    if (corruptedRecords && corruptedRecords.length > 0) {
      // Format records for alert email
      const alertData = corruptedRecords.map(record => ({
        userId: record.user_id,
        userEmail: record.email,
        stripeCustomerId: record.stripe_customer_id,
        status: record.status,
        detectedAt: new Date().toISOString(),
      }));

      // Send alert via send-corruption-alert edge function
      console.log('[CORRUPTION-CHECK] Sending alert for', alertData.length, 'records');
      
      const { data: alertResult, error: alertError } = await supabase.functions.invoke('send-corruption-alert', {
        body: { corruptedRecords: alertData },
      });

      if (alertError) {
        console.error('[CORRUPTION-CHECK] Alert sending failed:', alertError);
        throw new Error(`Failed to send alert: ${alertError.message}`);
      }

      console.log('[CORRUPTION-CHECK] Alert sent successfully:', alertResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          corruptionDetected: true,
          recordsFound: corruptedRecords.length,
          alertSent: true,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.log('[CORRUPTION-CHECK] No corruption detected - database healthy');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          corruptionDetected: false,
          recordsFound: 0,
          message: 'All subscription records are healthy',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('[CORRUPTION-CHECK] Critical error:', error);
    return new Response(
      JSON.stringify({ error: error.message, timestamp: new Date().toISOString() }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
