import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'profile' | 'care' | 'credentials' | 'resume' | 'reviews' | 'review_request' | 'missing_pet' | 'app_share' | 'welcome_trial' | 'transfer_invite_new' | 'transfer_invite_existing' | 'transfer_success' | 'transfer_limit_reached';
  recipientEmail: string;
  recipientName?: string;
  petName: string;
  petId: string;
  shareUrl: string;
  petPhoto?: string;
  customMessage?: string;
  senderName?: string;
  trialEndDate?: string;
  billingAmount?: string;
  pdfAttachment?: string; // Base64 encoded PDF
  pdfFileName?: string;
  transferToken?: string;
  transferUrl?: string;
  recipientStatus?: string;
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
        <h2>${petName}'s Credentials</h2>
        <p>${sender} has shared professional credentials or certifications for ${petName}.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; font-style: italic;">"${customMessage}"</blockquote>` : ''}
      `
    },
    resume: {
      subject: `${sender} shared ${petName}'s resume with you`,
      content: `
        <h2>${petName}'s Professional Resume</h2>
        <p>${sender} has shared ${petName}'s professional resume with you.</p>
        <p>View training, achievements, experience, and professional credentials.</p>
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
    review_request: {
      subject: `${sender} is requesting a review for ${petName}`,
      content: `
        <h2>📝 Review Request for ${petName}</h2>
        <p>${sender} would love to get your feedback about your experience with ${petName}!</p>
        <p>Your review helps other pet parents and pet care professionals. Please take a moment to share your experience.</p>
        ${customMessage ? `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        <p style="color: #4b5563;">Click the button below to leave your review. You can rate your experience and write about:</p>
        <ul style="color: #4b5563; margin: 15px 0; padding-left: 20px;">
          <li>Your overall experience with ${petName}</li>
          <li>${petName}'s behavior and temperament</li>
          <li>Any special memories or moments</li>
          <li>Recommendations for other pet care providers</li>
        </ul>
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
    },
    app_share: {
      subject: `Check out PetPort - Digital Pet Passport App`,
      content: `
        <h2>🐾 You've been invited to try PetPort!</h2>
        <p>${sender} thought you'd love PetPort - the digital passport for your pets!</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">✨ Finally... Everything Your Pet Needs</h3>
          <p style="margin: 10px 0; color: #6b7280;">Your pet doesn't have a voice. Give them a permanent record.</p>
          
          <ul style="color: #4b5563; margin: 15px 0; padding-left: 20px;">
            <li>Create beautiful digital profiles for your pets</li>
            <li>Store emergency information and medical records</li>
            <li>Share profiles with caregivers, vets, and boarders</li>
            <li>Generate missing pet flyers with QR codes</li>
            <li>Keep vaccination records and important documents safe</li>
          </ul>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <p>Join thousands of pet owners who trust PetPort to keep their pets safe and organized.</p>
      `
    },
    welcome_trial: {
      subject: `🎉 Welcome to PetPort - Your Free Trial Has Started!`,
      content: `
        <h2>🎉 Welcome to PetPort!</h2>
        <p>Hi ${data.recipientName || 'there'},</p>
        <p>Thank you for signing up! Your 7-day free trial has started and you can now create digital profiles for your pets.</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">⚠️ Important Trial Information</h3>
          <p style="margin: 10px 0; color: #92400e;"><strong>Your free trial ends on ${data.trialEndDate}</strong></p>
          <p style="margin: 10px 0; color: #92400e;">Cancel anytime before that date to avoid being charged. After that, your card will be billed <strong>${data.billingAmount}</strong> unless canceled.</p>
          <p style="margin: 10px 0; color: #92400e;">You can cancel anytime in your Account Settings or by contacting support.</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">🚀 Get Started</h3>
          <ul style="color: #0c4a6e; margin: 15px 0; padding-left: 20px;">
            <li><strong>Add your first pet</strong> - Create a beautiful digital profile</li>
            <li><strong>Upload photos</strong> - Showcase your pet's best moments</li>
            <li><strong>Add emergency contacts</strong> - Keep important information safe</li>
            <li><strong>Upload medical records</strong> - Store vaccination and health documents</li>
            <li><strong>Share with caregivers</strong> - Send profiles to vets, boarders, and sitters</li>
          </ul>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <p>Questions? Reply to this email or visit our Help Center. We're here to help!</p>
        <p>Welcome to the PetPort family! 🐾</p>
      `
    },
    transfer_invite_new: {
      subject: `🐾 ${petName}'s pet profile is waiting for you - Start your free trial`,
      content: `
        <h2>🐾 ${petName}'s profile is waiting for you!</h2>
        <p>${sender} has shared ${petName}'s complete pet profile with you on PetPort.</p>
        
        <div style="background: linear-gradient(135deg, #5691af 10%, #4a7c95 90%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">✨ Create your PetPort account and start your free 7-day trial to receive it</h3>
          <p style="margin: 10px 0; color: rgba(255,255,255,0.9);">
            Join thousands of pet owners who trust PetPort to keep their pets safe and organized.
          </p>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0c4a6e;">🎯 What you'll get:</h4>
          <ul style="color: #0c4a6e; margin: 15px 0; padding-left: 20px;">
            <li>Access to ${petName}'s complete profile and information</li>
            <li>7-day free trial with all premium features</li>
            <li>Create unlimited digital profiles for your own pets</li>
            <li>Emergency information and medical record storage</li>
            <li>Share profiles with caregivers, vets, and boarders</li>
          </ul>
        </div>
      `
    },
    transfer_invite_existing: {
      subject: `✅ ${petName}'s pet profile has been transferred to your PetPort`,
      content: `
        <h2>✅ ${petName}'s profile has been successfully transferred!</h2>
        <p>Great news! ${sender} has transferred ${petName}'s complete pet profile to your PetPort account.</p>
        
        <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #047857;">🎉 ${petName} is now in your account</h3>
          <p style="margin: 10px 0; color: #047857;">You can now access all of ${petName}'s information, photos, and documents in your PetPort dashboard.</p>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <p>Click the button below to view ${petName}'s profile and start managing their information.</p>
      `
    },
    transfer_success: {
      subject: `🎉 ${petName}'s profile transfer completed successfully`,
      content: `
        <h2>🎉 Transfer Complete!</h2>
        <p>Hi ${data.recipientName || 'there'},</p>
        <p>${petName}'s profile has been successfully transferred to your PetPort account!</p>
        
        <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #047857;">✅ What happens next:</h3>
          <ul style="color: #047857; margin: 15px 0; padding-left: 20px;">
            <li>${petName} now appears in your PetPort dashboard</li>
            <li>You have full access to edit and manage their profile</li>
            <li>All photos, documents, and information are preserved</li>
            <li>You can share ${petName}'s profile with others anytime</li>
          </ul>
        </div>
        
        <p>Thank you for using PetPort to keep ${petName}'s information safe and organized!</p>
      `
    },
    transfer_limit_reached: {
      subject: `🐾 ${petName}'s profile is waiting - Add a pet slot to claim it`,
      content: `
        <h2>🐾 ${petName}'s profile is waiting for you!</h2>
        <p>${sender} wants to transfer ${petName}'s profile to your PetPort account.</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">📋 Additional Pet Slot Needed</h3>
          <p style="margin: 10px 0; color: #92400e;">
            You've reached your current pet limit. Add an additional pet slot to your subscription to claim ${petName}'s profile.
          </p>
          <p style="margin: 10px 0; color: #92400e;">
            <strong>Additional pet slots are just $3.99/year each.</strong>
          </p>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <p>Click the button below to add a pet slot and claim ${petName}'s profile.</p>
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
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PetPort</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Digital Pet Profile & Information Sharing Platform</p>
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
            <a href="${(() => {
              // Determine the correct button URL based on email type
              const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
              
              // For transfer emails, use transferUrl instead of shareUrl
              if (type === 'transfer_invite_new' || type === 'transfer_invite_existing' || type === 'transfer_limit_reached') {
                return data.transferUrl || `${baseUrl}/transfer/accept/${data.transferToken}`;
              } else if (type === 'transfer_success') {
                return `${baseUrl}/profile/${data.petId}`;
              }
              
              // For non-transfer emails, use shareUrl with redirect extraction
              try {
                const url = new URL(shareUrl);
                const redirectParam = url.searchParams.get('redirect');
                return redirectParam ? decodeURIComponent(redirectParam) : shareUrl;
              } catch {
                return shareUrl; // Fallback to original if URL parsing fails
              }
            })()} " 
               style="display: inline-block; background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${isDocumentShare ? '📄 View Document' : 
                  type === 'review_request' ? `📝 Leave a Review for ${petName}` :
                  type === 'transfer_invite_new' ? 'Create Account & Start Free Trial' :
                  type === 'transfer_invite_existing' ? `Accept ${petName}'s Transfer` :
                  type === 'transfer_success' ? `View ${petName}'s Profile` :
                  type === 'transfer_limit_reached' ? 'Add Pet Slot & Claim Profile' :
                  `View ${petName}'s ${type === 'profile' ? 'Profile' : type === 'missing_pet' ? 'Missing Pet Alert' : type === 'resume' ? 'Resume' : type.charAt(0).toUpperCase() + type.slice(1)}`}
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
            <p>This email was sent via PetPort - Digital Pet Profile & Information Sharing Platform</p>
            <p>Visit <a href="https://petport.app" style="color: #5691af;">petport.app</a> to create your own pet profile</p>
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
    
    console.log("=== EMAIL BEING SENT ===");
    console.log("To:", emailData.recipientEmail);
    console.log("Pet:", emailData.petName);
    console.log("Type:", emailData.type);
    console.log("Share URL:", emailData.shareUrl);
    console.log("Transfer URL:", emailData.transferUrl);
    console.log("Transfer Token:", emailData.transferToken);
    console.log("Custom Message:", emailData.customMessage || "None");
    console.log("Sender:", emailData.senderName || "A PetPort user");
    
    // Determine final button URL for logging
    const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
    let finalButtonUrl = emailData.shareUrl;
    
    if (emailData.type === 'transfer_invite_new' || emailData.type === 'transfer_invite_existing' || emailData.type === 'transfer_limit_reached') {
      finalButtonUrl = emailData.transferUrl || `${baseUrl}/transfer/accept/${emailData.transferToken}`;
    } else if (emailData.type === 'transfer_success') {
      finalButtonUrl = `${baseUrl}/profile/${emailData.petId}`;
    }
    
    console.log("Final Button URL:", finalButtonUrl);
    console.log("=========================");

    const templates = {
      profile: {
        subject: emailData.customMessage && (
          emailData.customMessage.includes('document') || 
          emailData.customMessage.includes('vaccination') || 
          emailData.customMessage.includes('insurance') || 
          emailData.customMessage.includes('medical') ||
          emailData.customMessage.includes('certificate')
        ) 
          ? `📄 Document from ${emailData.petName} - Shared via PetPort`
          : `${emailData.senderName || 'A PetPort user'} shared ${emailData.petName}'s PetPort profile with you`
      },
      care: {
        subject: `${emailData.senderName || 'A PetPort user'} shared ${emailData.petName}'s care instructions with you`
      },
      credentials: {
        subject: `${emailData.senderName || 'A PetPort user'} shared ${emailData.petName}'s credentials with you`
      },
      resume: {
        subject: `${emailData.senderName || 'A PetPort user'} shared ${emailData.petName}'s resume with you`
      },
      reviews: {
        subject: `${emailData.senderName || 'A PetPort user'} shared ${emailData.petName}'s reviews with you`
      },
      review_request: {
        subject: `${emailData.senderName || 'A PetPort user'} is requesting a review for ${emailData.petName}`
      },
      missing_pet: {
        subject: `🚨 MISSING PET ALERT - ${emailData.petName} needs your help!`
      },
      app_share: {
        subject: `Check out PetPort - Digital Pet Passport App`
      },
      welcome_trial: {
        subject: `🎉 Welcome to PetPort - Your Free Trial Has Started!`
      },
      transfer_invite_new: {
        subject: `🐾 ${emailData.petName}'s pet profile is waiting for you - Start your free trial`
      },
      transfer_invite_existing: {
        subject: `✅ ${emailData.petName}'s pet profile has been transferred to your PetPort`
      },
      transfer_success: {
        subject: `🎉 ${emailData.petName}'s profile transfer completed successfully`
      },
      transfer_limit_reached: {
        subject: `🐾 ${emailData.petName}'s profile is waiting - Add a pet slot to claim it`
      }
    };

    const emailTemplate = generateEmailTemplate(emailData);
    const subject = templates[emailData.type]?.subject || `PetPort - ${emailData.petName}`;

    // Send email via Postmark API
    const emailResponse = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: "PetPort <noreply@petport.app>",
        To: emailData.recipientEmail,
        Subject: subject,
        HtmlBody: emailTemplate,
        MessageStream: "outbound",
        ...(emailData.pdfAttachment && emailData.pdfFileName ? {
          Attachments: [{
            Name: emailData.pdfFileName,
            Content: emailData.pdfAttachment,
            ContentType: "application/pdf"
          }]
        } : {})
      }),
    });

    const result = await emailResponse.json();
    
    console.log("Postmark response:", result);

    // Check if the email was sent successfully
    if (!emailResponse.ok) {
      console.error("Postmark API error:", result);
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.Message || "Failed to send email"
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

    console.log("=== EMAIL SENT SUCCESSFULLY ===");
    console.log("Message ID:", result.MessageID);
    console.log("To:", emailData.recipientEmail);
    console.log("Subject:", subject);
    console.log("================================");

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.MessageID 
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