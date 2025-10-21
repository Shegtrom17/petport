import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ServerClient } from "npm:postmark@4.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyCareUpdateRequest {
  petId: string;
  updateText: string;
  reportedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { petId, updateText, reportedAt }: NotifyCareUpdateRequest = await req.json();

    console.log('Processing care update notification for pet:', petId);

    // Fetch pet and owner information
    const { data: petData, error: petError } = await supabaseClient
      .from('pets')
      .select('name, user_id')
      .eq('id', petId)
      .single();

    if (petError || !petData) {
      console.error('Error fetching pet:', petError);
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch owner email
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', petData.user_id)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Owner profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the time
    const updateTime = new Date(reportedAt);
    const formattedTime = updateTime.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const carePageUrl = `https://petport.app/care/${petId}`;

    // Send email using Postmark
    const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');
    const messageStream = Deno.env.get('POSTMARK_BROADCAST_STREAM') || 'broadcast';
    
    if (!postmarkApiKey) {
      console.error('[NOTIFY-CARE-UPDATE] POSTMARK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const postmark = new ServerClient(postmarkApiKey);

    try {
      const emailResponse = await postmark.sendEmail({
        From: 'care@petport.app',
        To: profileData.email,
        Subject: `💚 New Care Update for ${petData.name}`,
        HtmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💚 New Care Update</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi${profileData.full_name ? ` ${profileData.full_name}` : ''},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your pet's caretaker has posted a new update about <strong>${petData.name}</strong>.</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">Care Update:</p>
              <p style="margin: 0; color: #1f2937;">"${updateText}"</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">Posted: ${formattedTime}</p>
            </div>
            
            <p style="font-size: 16px; margin: 25px 0;">View all care updates and instructions:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${carePageUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Care Instructions</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">This is an automated notification from PetPort. Stay connected with ${petData.name}'s care while you're away.</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">PetPort - Your Pet's Digital Companion</p>
            <p style="margin: 5px 0;"><a href="https://petport.app" style="color: #10b981; text-decoration: none;">petport.app</a></p>
          </div>
        </body>
        </html>
      `,
        TextBody: `
💚 New Care Update for ${petData.name}

Hi${profileData.full_name ? ` ${profileData.full_name}` : ''},

Your pet's caretaker has posted a new update about ${petData.name}.

Care Update:
"${updateText}"

Posted: ${formattedTime}

View all care updates and instructions:
${carePageUrl}

This is an automated notification from PetPort. Stay connected with ${petData.name}'s care while you're away.

---
PetPort - Your Pet's Digital Companion
https://petport.app
      `,
        MessageStream: messageStream,
      });

      console.log('[NOTIFY-CARE-UPDATE] Email sent successfully:', emailResponse.MessageID);

      return new Response(
        JSON.stringify({ success: true, messageId: emailResponse.MessageID }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (emailError: any) {
      console.error('[NOTIFY-CARE-UPDATE] Failed to send email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in notify-care-update function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
