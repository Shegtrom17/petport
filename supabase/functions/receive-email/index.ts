import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostmarkInboundEmail {
  FromName: string;
  From: string;
  To: string;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  Date: string;
  MessageID: string;
  Attachments?: Array<{
    Name: string;
    Content: string;
    ContentType: string;
    ContentLength: number;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[RECEIVE-EMAIL] Processing inbound email');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the incoming email from Postmark
    const inboundEmail: PostmarkInboundEmail = await req.json();

    console.log('[RECEIVE-EMAIL] Email received from:', inboundEmail.From);
    console.log('[RECEIVE-EMAIL] Subject:', inboundEmail.Subject);
    console.log('[RECEIVE-EMAIL] To:', inboundEmail.To);

    // Store the incoming email in a database table
    const { data, error } = await supabaseClient
      .from('inbound_emails')
      .insert({
        from_email: inboundEmail.From,
        from_name: inboundEmail.FromName,
        to_email: inboundEmail.To,
        subject: inboundEmail.Subject,
        text_body: inboundEmail.TextBody,
        html_body: inboundEmail.HtmlBody,
        message_id: inboundEmail.MessageID,
        received_at: inboundEmail.Date,
        raw_data: inboundEmail,
      });

    if (error) {
      console.error('[RECEIVE-EMAIL] Error storing email:', error);
      throw error;
    }

    console.log('[RECEIVE-EMAIL] Email stored successfully:', data);

    // You can add custom logic here, such as:
    // - Auto-reply to certain emails
    // - Notify admins via another email
    // - Process specific commands in the subject/body
    // - Forward to specific users based on the To address

    return new Response(
      JSON.stringify({ success: true, message: 'Email received and processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[RECEIVE-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
