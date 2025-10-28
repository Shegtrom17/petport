import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getGiftEmailTemplate, type GiftEmailType } from "../_shared/email-templates.ts";

const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftEmailRequest {
  type: 'gift-purchase-confirmation' | 'gift-notification' | 'gift-activated' | 'gift-renewal-reminder-60' | 'gift-renewal-reminder-30' | 'gift-renewal-reminder-7' | 'gift-expired';
  recipientEmail: string;
  senderName?: string;
  recipientName?: string;
  giftMessage?: string;
  giftCode: string;
  redemptionLink: string;
  expiresAt: string;
  daysRemaining?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: GiftEmailRequest = await req.json();
    
    console.log("=== GIFT EMAIL BEING SENT ===");
    console.log("Type:", emailData.type);
    console.log("To:", emailData.recipientEmail);
    console.log("Gift Code:", emailData.giftCode);
    console.log("Holiday Mode:", Deno.env.get('HOLIDAY_MODE') === 'true' ? 'ACTIVE 🎄' : 'OFF');
    
    // Get the appropriate template based on holiday mode
    const templateId = getGiftEmailTemplate(emailData.type as GiftEmailType);
    
    console.log("Using Template:", templateId);
    console.log("=============================");

    // Prepare subject lines
    const subjects = {
      'gift-purchase-confirmation': Deno.env.get('HOLIDAY_MODE') === 'true' 
        ? '🎁 Your PetPort Gift Has Been Sent!'
        : '✅ Gift Purchase Confirmed - PetPort',
      'gift-notification': Deno.env.get('HOLIDAY_MODE') === 'true'
        ? '🎁 You\'ve Been Gifted PetPort — A Year of Pawsitivity!'
        : '🎁 You\'ve Received a PetPort Gift Membership!',
      'gift-activated': Deno.env.get('HOLIDAY_MODE') === 'true'
        ? '🎉 Your PetPort Gift Is Now Active!'
        : '✅ Welcome to PetPort - Your Gift Membership Is Active',
      'gift-renewal-reminder-60': '🎁 Your PetPort Gift Expires in 60 Days',
      'gift-renewal-reminder-30': '⏰ Your PetPort Gift Expires in 30 Days',
      'gift-renewal-reminder-7': '🚨 Your PetPort Gift Expires in 7 Days',
      'gift-expired': 'Your PetPort Gift Membership Has Expired'
    };

    const subject = subjects[emailData.type] || 'PetPort Gift Notification';

    // Send email via Postmark Template API
    const emailResponse = await fetch("https://api.postmarkapp.com/email/withTemplate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: "PetPort <gifts@petport.app>",
        To: emailData.recipientEmail,
        TemplateAlias: templateId,
        TemplateModel: {
          sender_name: emailData.senderName || 'A PetPort supporter',
          recipient_email: emailData.recipientEmail,
          recipient_name: emailData.recipientName || null,
          gift_message: emailData.giftMessage || null,
          redemption_link: emailData.redemptionLink,
          gift_code: emailData.giftCode,
          expires_at: emailData.expiresAt,
          days_remaining: emailData.daysRemaining || null,
          product_name: 'PetPort',
          product_url: 'https://petport.app',
          support_email: 'support@petport.app',
          company_name: 'PetPort',
          company_address: 'PetPort, Digital Pet Passport'
        },
        MessageStream: "outbound",
      }),
    });

    const result = await emailResponse.json();
    
    console.log("Postmark response:", result);

    // Check if the email was sent successfully
    if (!emailResponse.ok) {
      console.error("Postmark API error:", result);
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.Message || "Failed to send gift email",
        errorCode: result.ErrorCode
      }), {
        status: emailResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (!result.MessageID) {
      console.error("No message ID returned from Postmark");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email service did not return a message ID"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    console.log("=== GIFT EMAIL SENT SUCCESSFULLY ===");
    console.log("Message ID:", result.MessageID);
    console.log("To:", emailData.recipientEmail);
    console.log("Template:", templateId);
    console.log("====================================");

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.MessageID,
      template: templateId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending gift email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
