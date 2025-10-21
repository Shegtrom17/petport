import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RelayEmailRequest {
  petId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  pageType: 'missing' | 'profile' | 'resume' | 'care' | 'gallery';
  ipAddress?: string;
}

// Input validation and sanitization
const sanitizeText = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const containsSuspiciousContent = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\s*\(/i,
  ];
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body: RelayEmailRequest = await req.json();
    const { petId, senderName, senderEmail, message, pageType, ipAddress } = body;

    console.log('[RELAY-EMAIL] Processing request for pet:', petId);

    // Validate required fields
    if (!petId || !senderName || !senderEmail || !message || !pageType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths
    if (senderName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Name must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length < 10 || message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message must be between 10 and 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!validateEmail(senderEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const cleanName = sanitizeText(senderName);
    const cleanMessage = sanitizeText(message);

    // Check for suspicious content
    if (containsSuspiciousContent(cleanName) || containsSuspiciousContent(cleanMessage)) {
      return new Response(
        JSON.stringify({ error: 'Message contains invalid content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check messages from this sender in the last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const { data: recentMessages, error: rateLimitError } = await supabase
      .from('contact_messages')
      .select('id')
      .or(`sender_email.eq.${senderEmail},ip_address.eq.${ipAddress || 'none'}`)
      .gte('created_at', oneHourAgo);

    if (rateLimitError) {
      console.error('[RELAY-EMAIL] Rate limit check error:', rateLimitError);
    }

    if (recentMessages && recentMessages.length >= 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait an hour before sending more messages.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch pet information
    const { data: petData, error: petError } = await supabase
      .from('pets')
      .select('id, name, user_id')
      .eq('id', petId)
      .single();

    if (petError || !petData) {
      console.error('[RELAY-EMAIL] Pet not found:', petError);
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch owner's email from profiles (NEVER expose this)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', petData.user_id)
      .single();

    if (profileError || !profileData || !profileData.email) {
      console.error('[RELAY-EMAIL] Owner email not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Unable to send message. Owner email not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ownerEmail = profileData.email;
    const ownerName = profileData.full_name || 'Pet Owner';
    const petName = petData.name;

    // Determine page context
    const pageContextMap = {
      'missing': 'Lost Pet Alert',
      'profile': 'Pet Profile',
      'resume': 'Pet Resume',
      'care': 'Care Instructions',
      'gallery': 'Photo Gallery'
    };
    const pageContext = pageContextMap[pageType] || 'PetPort';

    console.log('[RELAY-EMAIL] Sending email to owner:', ownerEmail);

    // Send email via Resend from relay@petport.app
    const emailResponse = await resend.emails.send({
      from: "PetPort Relay <relay@petport.app>",
      replyTo: senderEmail,
      to: [ownerEmail],
      subject: `🐾 [PetPort] Message about ${petName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #5691af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #5691af; margin: 20px 0; }
            .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #5691af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🐾 PetPort Message</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${ownerName},</p>
              
              <p>Someone has contacted you about <strong>${petName}</strong> through PetPort.</p>
              
              <p><strong>From:</strong> ${cleanName} (${senderEmail})<br>
              <strong>Page:</strong> ${pageContext}</p>
              
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${cleanMessage}</p>
              </div>
              
              <p style="margin-top: 30px;">
                <a href="mailto:${senderEmail}" class="button">Reply to ${cleanName}</a>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This message was sent via PetPort's secure relay system.</p>
              <p style="margin: 5px 0 0 0;">🔒 Your email address is never shared publicly. Reply directly to this email to respond to the sender.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${ownerName},

Someone has contacted you about ${petName} through PetPort.

From: ${cleanName} (${senderEmail})
Page: ${pageContext}

Message:
${cleanMessage}

---
This message was sent via PetPort's secure relay system.
Reply directly to this email to respond to the sender.

🔒 Your email address is never shared publicly.
      `
    });

    console.log('[RELAY-EMAIL] Email sent successfully:', emailResponse);

    // Log the message to contact_messages table for audit trail
    const { error: logError } = await supabase
      .from('contact_messages')
      .insert({
        pet_id: petId,
        sender_name: cleanName,
        sender_email: senderEmail,
        message: cleanMessage,
        ip_address: ipAddress || null,
        page_type: pageType
      });

    if (logError) {
      console.error('[RELAY-EMAIL] Failed to log message:', logError);
      // Don't fail the request if logging fails
    }

    // Optional: Send confirmation to sender
    try {
      await resend.emails.send({
        from: "PetPort <noreply@petport.app>",
        to: [senderEmail],
        subject: `✅ Your message about ${petName} has been sent`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2 style="color: #5691af; margin-top: 0;">✅ Message Delivered</h2>
                <p>Hi ${cleanName},</p>
                <p>Your message about <strong>${petName}</strong> has been successfully delivered to the owner via PetPort's secure relay system.</p>
                <p>The owner will receive your message at their private email and can reply directly to you at <strong>${senderEmail}</strong>.</p>
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                  Thank you for using PetPort! 🐾
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
✅ Message Delivered

Hi ${cleanName},

Your message about ${petName} has been successfully delivered to the owner via PetPort's secure relay system.

The owner will receive your message at their private email and can reply directly to you at ${senderEmail}.

Thank you for using PetPort! 🐾
        `
      });
    } catch (confirmError) {
      console.error('[RELAY-EMAIL] Failed to send confirmation:', confirmError);
      // Don't fail the request if confirmation fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Message sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[RELAY-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send message. Please try again later.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
