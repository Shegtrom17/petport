import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'profile' | 'care' | 'credentials' | 'reviews' | 'missing_pet';
  recipientEmail: string;
  recipientName?: string;
  petName: string;
  petId: string;
  shareUrl: string;
  petPhoto?: string;
  customMessage?: string;
  senderName?: string;
}

const generateEmailTemplate = (data: EmailRequest) => {
  const { type, petName, shareUrl, petPhoto, customMessage, senderName, recipientName } = data;
  
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  const sender = senderName || 'A PetPort user';
  
  // Check if this is document sharing based on custom message
  const isDocumentShare = customMessage && (
    customMessage.includes('document') || 
    customMessage.includes('vaccination') || 
    customMessage.includes('insurance') || 
    customMessage.includes('medical') ||
    customMessage.includes('certificate')
  );

  const templates = {
    profile: {
      subject: isDocumentShare 
        ? `📄 Document from ${petName} - Shared via PetPort`
        : `${sender} shared ${petName}'s PetPort profile with you`,
      content: isDocumentShare ? `
        <h2>📄 Document Shared: ${petName}</h2>
        <p>${sender} has shared a document with you for ${petName}.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        <p style="color: #4b5563;">Click the button below to view or download the document.</p>
      ` : `
        <h2>${petName}'s Pet Profile</h2>
        <p>${sender} thought you'd like to see ${petName}'s complete pet profile and information.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
      `
    },
    care: {
      subject: `${sender} shared ${petName}'s care instructions with you`,
      content: `
        <h2>${petName}'s Care Instructions</h2>
        <p>${sender} has shared detailed care instructions for ${petName} with you.</p>
        <p>This includes feeding schedules, routines, allergies, and behavioral notes to help you take the best care of ${petName}.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
      `
    },
    credentials: {
      subject: `${sender} shared ${petName}'s credentials with you`,
      content: `
        <h2>${petName}'s Credentials & Certifications</h2>
        <p>${sender} has shared ${petName}'s official credentials and certifications with you.</p>
        <p>View training certificates, service animal documentation, and other important credentials.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
      `
    },
    reviews: {
      subject: `${sender} shared ${petName}'s reviews with you`,
      content: `
        <h2>${petName}'s Reviews & Testimonials</h2>
        <p>${sender} has shared reviews and testimonials about ${petName} with you.</p>
        <p>See what others have said about their experiences with ${petName}.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
      `
    },
    missing_pet: {
      subject: `🚨 MISSING PET ALERT - ${petName} needs your help!`,
      content: `
        <h2 style="color: #dc2626;">🚨 MISSING PET ALERT</h2>
        <h3>${petName} is missing and needs your help!</h3>
        <p><strong>${sender} has reported ${petName} as missing.</strong></p>
        <p>Please check the link below for all the details including photos, last known location, and contact information.</p>
        <p><strong>If you see ${petName}, please contact the owner immediately using the information provided.</strong></p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #dc2626; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
        <p style="color: #dc2626; font-weight: bold;">Time is critical - please share this alert with others!</p>
      `
    }
  };

  const template = templates[type];
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PetPort</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Digital Pet Passport & Care Platform</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 20px;">${greeting}</p>
          
          ${petPhoto ? `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${petPhoto}" alt="${petName}" style="max-width: 200px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            </div>
          ` : ''}
          
          ${template.content}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${shareUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ${isDocumentShare ? '📄 View Document' : `View ${petName}'s ${type === 'profile' ? 'Profile' : type === 'missing_pet' ? 'Missing Pet Alert' : type.charAt(0).toUpperCase() + type.slice(1)}`}
            </a>
          </div>
          
          ${isDocumentShare ? `
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                <strong>💡 Tip:</strong> You can download this document by clicking the link above, then using your browser's download option.
              </p>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This email was sent via PetPort - Digital Pet Passport & Care Platform</p>
            <p>Visit <a href="https://petport.app" style="color: #667eea;">petport.app</a> to create your own pet profile</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    
    console.log("Sending email:", emailData);

    const emailTemplate = generateEmailTemplate(emailData);
    
    const emailResponse = await resend.emails.send({
      from: "PetPort <onboarding@resend.dev>",
      to: [emailData.recipientEmail],
      subject: generateEmailTemplate(emailData).match(/<title>(.*?)<\/title>/)?.[1] || `PetPort - ${emailData.petName}`,
      html: emailTemplate,
    });

    console.log("Email response:", emailResponse);

    // Check if the email was sent successfully
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: emailResponse.error.message || "Failed to send email"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (!emailResponse.data?.id) {
      console.error("No message ID returned from Resend");
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
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