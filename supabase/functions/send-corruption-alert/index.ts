import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CorruptionAlert {
  userId: string;
  userEmail: string;
  stripeCustomerId: string | null;
  status: string;
  detectedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { corruptedRecords }: { corruptedRecords: CorruptionAlert[] } = await req.json();

    console.log('[CORRUPTION-ALERT] Processing alert for', corruptedRecords.length, 'records');

    const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL');

    if (!postmarkApiKey) {
      throw new Error('Postmark API key not configured');
    }

    if (!adminEmail) {
      throw new Error('Admin email not configured');
    }

    // Build corruption details table
    const recordsTable = corruptedRecords.map((record, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left;">${index + 1}</td>
        <td style="padding: 12px; text-align: left;"><code>${record.userId}</code></td>
        <td style="padding: 12px; text-align: left;">${record.userEmail}</td>
        <td style="padding: 12px; text-align: left;">
          ${record.stripeCustomerId ? `<code>${record.stripeCustomerId}</code>` : '<span style="color: #ef4444; font-weight: bold;">NULL ⚠️</span>'}
        </td>
        <td style="padding: 12px; text-align: left;">
          <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
            record.status === 'active' ? '#dcfce7' : '#fef3c7'
          }; color: ${
            record.status === 'active' ? '#166534' : '#92400e'
          };">${record.status}</span>
        </td>
        <td style="padding: 12px; text-align: left;">${new Date(record.detectedAt).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailBody = {
      From: 'alerts@petport.app',
      To: adminEmail,
      Subject: `🚨 CRITICAL: ${corruptedRecords.length} Corrupted Subscription Record${corruptedRecords.length > 1 ? 's' : ''} Detected`,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px;">
            <h2 style="color: #dc2626; margin: 0 0 8px 0;">🚨 Database Corruption Alert</h2>
            <p style="margin: 0; color: #991b1b;">
              <strong>${corruptedRecords.length}</strong> subscription record${corruptedRecords.length > 1 ? 's have' : ' has'} corrupted stripe_customer_id (NULL) values with active/grace status.
            </p>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #2d3748;">Impact Assessment</h3>
            <ul style="color: #4a5568;">
              <li>Users affected: <strong>${corruptedRecords.length}</strong></li>
              <li>These users have active/grace subscriptions but no Stripe customer link</li>
              <li>Billing operations will fail for these accounts</li>
              <li>Immediate investigation required</li>
            </ul>
          </div>

          <h3 style="color: #2d3748;">Corrupted Records</h3>
          <table style="width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left;">#</th>
                <th style="padding: 12px; text-align: left;">User ID</th>
                <th style="padding: 12px; text-align: left;">Email</th>
                <th style="padding: 12px; text-align: left;">Stripe Customer ID</th>
                <th style="padding: 12px; text-align: left;">Status</th>
                <th style="padding: 12px; text-align: left;">Detected At</th>
              </tr>
            </thead>
            <tbody>
              ${recordsTable}
            </tbody>
          </table>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px;">
            <h3 style="margin-top: 0; color: #1e40af;">Recommended Actions</h3>
            <ol style="color: #1e3a8a; margin: 0; padding-left: 20px;">
              <li>Investigate the root cause in check-subscription edge functions</li>
              <li>Review recent Stripe webhook events for these users</li>
              <li>Check database trigger logs for prevention attempts</li>
              <li>Manually restore stripe_customer_id from Stripe dashboard if needed</li>
              <li>Consider temporarily suspending affected accounts until resolved</li>
            </ol>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #a0aec0; font-size: 12px;">
            This is an automated alert from the PetPort Corruption Monitoring System. 
            <br>Next scheduled check: 6 hours from now.
            <br><a href="https://supabase.com/dashboard/project/dxghbhujugsfmaecilrq/editor" style="color: #3b82f6;">View Database →</a>
          </p>
        </div>
      `,
      MessageStream: 'outbound',
    };

    const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkApiKey,
      },
      body: JSON.stringify(emailBody),
    });

    if (!postmarkResponse.ok) {
      const errorText = await postmarkResponse.text();
      console.error('[CORRUPTION-ALERT] Postmark error:', errorText);
      throw new Error(`Failed to send alert email: ${errorText}`);
    }

    const result = await postmarkResponse.json();
    console.log('[CORRUPTION-ALERT] Alert sent successfully:', result.MessageId);

    return new Response(
      JSON.stringify({ success: true, messageId: result.MessageId, recordsAlerted: corruptedRecords.length }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[CORRUPTION-ALERT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
