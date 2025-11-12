import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'profile' | 'care' | 'credentials' | 'resume' | 'reviews' | 'review_request' | 'missing_pet' | 'app_share' | 'welcome' | 'welcome_trial' | 'transfer_invite_new' | 'transfer_invite_existing' | 'transfer_success' | 'transfer_limit_reached' | 'transfer_sent_confirmation' | 'transfer_completed_sender' | 'gift_purchase_confirmation' | 'gift_notification' | 'gift_activated' | 'gift_renewal_reminder' | 'gift_expired' | 'pet_guardian' | 'grace_period_started' | 'grace_period_reminder' | 'grace_period_expired';
  recipientEmail: string;
  gracePeriodEnd?: string;
  guardianLink?: string;
  guardianName?: string;
  transferRecipientEmail?: string;
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
  // Gift-specific fields
  giftCode?: string;
  giftRecipientEmail?: string; // The person receiving the gift (for purchase confirmation)
  expiresAt?: string;
  daysRemaining?: number;
  giftMessage?: string;
  redemptionLink?: string;
  giftTheme?: string; // Theme for gift emails: 'standard', 'christmas', 'adoption', 'birthday', 'holiday'
}

const generateTextBody = (data: EmailRequest): string => {
  const { type, petName, shareUrl, senderName, recipientName, customMessage, transferUrl, transferToken } = data;
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  const sender = senderName || 'A PetPort user';
  const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";

  const textTemplates = {
    profile: `${greeting}

${sender} has shared ${petName}'s PetPort profile with you.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
View the profile here: ${shareUrl}

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    care: `${greeting}

${sender} has shared detailed care instructions for ${petName} with you.
This includes feeding schedules, routines, allergies, and behavioral notes.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
View care instructions: ${shareUrl}

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    resume: `${greeting}

${sender} has shared ${petName}'s professional resume with you.
View training, achievements, experience, and professional credentials.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
View resume: ${shareUrl}

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    missing_pet: `${greeting}

🚨 MISSING PET ALERT - ${petName} needs your help!

${sender} has reported ${petName} as missing.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
Please check this link for all details including photos, last known location, and contact information:
${shareUrl}

If you see ${petName}, please contact the owner immediately using the information provided.
Time is critical - please share this alert with others!

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    transfer_invite_new: `${greeting}

${sender} is transferring ${petName}'s complete pet profile to you on PetPort.

⏰ This transfer link expires in 7 days.

Create your PetPort account and start your free 7-day trial to complete the transfer.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
What you'll receive:
- Full ownership transfer of ${petName}'s complete profile
- 7-day free trial with all premium features
- All medical records and information
- Emergency contact details and care instructions
- Photo galleries and vaccination records

Accept transfer: ${transferUrl || `${baseUrl}/transfer/accept/${transferToken}`}

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    transfer_invite_existing: `${greeting}

${sender} wants to transfer ${petName}'s complete pet profile to your PetPort account.

⏰ This transfer link expires in 7 days.
${customMessage ? `\nMessage: "${customMessage}"\n` : ''}
Click below to accept and claim ${petName}'s profile. Once you accept, ${petName} and all their information will be transferred to your account.

Accept transfer: ${transferUrl || `${baseUrl}/transfer/accept/${transferToken}`}

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    transfer_success: `${greeting}

${petName}'s profile has been successfully transferred to your PetPort account!

What happens next:
- ${petName} now appears in your PetPort dashboard
- You have full access to edit and manage their profile
- All photos, documents, and information are preserved
- You can share ${petName}'s profile with others anytime

View ${petName}'s profile: ${baseUrl}/profile/${data.petId}

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
PetPort - Digital Pet Passport
https://petport.app`,

    transfer_limit_reached: `${greeting}

${sender} wants to transfer ${petName}'s profile to your PetPort account.

📋 Additional Pet Slot Needed

You've reached your current pet limit. Add an additional pet slot to accept this transfer and bring ${petName} into your account.

Add pet slot and accept transfer: ${transferUrl || `${baseUrl}/transfer/accept/${transferToken}`}

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
Sent via PetPort - Digital Pet Passport
https://petport.app`,

    transfer_sent_confirmation: `${greeting}

Your transfer request for ${petName} has been sent successfully!

Transfer Details:
- Pet: ${petName}
- Recipient: ${data.transferRecipientEmail || data.recipientEmail}
- Expiration: 7 days
${customMessage ? `\nYour message: "${customMessage}"\n` : ''}

What happens next:
- The recipient will receive an email invitation to accept the transfer
- They have 7 days to accept before the transfer link expires
- You'll receive another email when they accept the transfer
- If they don't accept within 7 days, you can send a new transfer request

The recipient will need to:
${data.recipientStatus === 'new' ? '- Create a PetPort account with a 7-day free trial' : 
  data.recipientStatus === 'at_limit' ? '- Purchase an additional pet slot' : 
  '- Accept the transfer in their account'}

View ${petName}'s profile: ${baseUrl}/profile/${data.petId}

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
PetPort - Digital Pet Passport
https://petport.app`,

    transfer_completed_sender: `${greeting}

Great news! ${data.senderName || 'The recipient'} has accepted the transfer of ${petName}.

Transfer Completed:
- Pet: ${petName}
- New Owner: ${data.senderName || data.recipientEmail}
- Completed: ${new Date().toLocaleDateString()}

${petName} has been successfully transferred to their new account. The new owner now has full access to manage ${petName}'s profile, including all photos, documents, and information.

Thank you for keeping ${petName}'s voice with them wherever they go! 🐾

---
PetPort - Digital Pet Passport
https://petport.app`,

    pet_guardian: `${greeting}

You've been designated as a Pet Guardian for ${petName} 🛡️

${sender} has designated you as a trusted guardian to care for ${petName} in case of emergency or long-term incapacitation.

You can access ${petName}'s complete information anytime using this secure link:
${data.guardianLink}

This link is private and should not be shared with others. It provides you with:
- Complete pet profile and emergency contact information
- Medical records and vaccination history
- Care instructions and dietary requirements
- Behavioral notes and special needs
- Authorization to make care decisions

${customMessage ? `\nMessage from ${sender}: "${customMessage}"\n` : ''}

Thank you for being a trusted guardian for ${petName}! 🐾

---
PetPort - Digital Pet Passport
https://petport.app`
  };

  return textTemplates[type as keyof typeof textTemplates] || `${greeting}\n\nView ${petName}'s information: ${shareUrl}\n\n---\nSent via PetPort\nhttps://petport.app`;
};

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
    welcome: {
      subject: `Welcome to PetPort, ${data.recipientName || 'Friend'}! 🐾`,
      content: `
        <h2 style="color: #5691af;">Welcome to PetPort!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">Welcome aboard, ${data.recipientName || 'Friend'} – we're thrilled to have you and your pet with us!</p>
        
        <div style="background: #f8fafc; padding: 22px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #5691af;">
          <h3 style="margin-top: 0; color: #5691af; font-size: 18px;">📱 Access from Any Device</h3>
          <p style="color: #475569; line-height: 1.7; margin: 12px 0;">
            <strong>PetPort is accessible from any digital device</strong> – just head to <a href="https://petport.app" style="color: #5691af; text-decoration: none; font-weight: 600;">PetPort.app</a> and sign in.
          </p>
          <p style="color: #475569; line-height: 1.7; margin: 12px 0;">
            Initially users find entering your pet's info is easiest from a desktop or tablet, and many use voice-to-text – it's up to you! Once the initial information is loaded, it's easy updated from any device.
          </p>
          <p style="color: #475569; line-height: 1.7; margin: 12px 0;">
            <strong>Your info is securely saved in the cloud</strong>, so if you lose your device, your app and data are safe.
          </p>
        </div>
        
        <div style="background: #f0f9ff; padding: 22px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #5691af;">
          <h3 style="margin-top: 0; color: #5691af; font-size: 18px;">📬 Private Email Relay</h3>
          <p style="color: #475569; line-height: 1.7; margin: 0;">
            All emails through PetPort are handled via our private relay system – only after you receive an email will you be able to reply directly. <strong>Your contact info stays private until you decide otherwise.</strong>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 22px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #5691af;">
          <h3 style="margin-top: 0; color: #5691af; font-size: 18px;">⚙️ Important Settings</h3>
          <p style="color: #475569; line-height: 1.7; margin: 0;">
            Be sure to check the Q&A section, review policies, and manage billing in your <strong>Settings</strong>.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: white; font-size: 18px;">🐕‍🦺 Referral Program</h3>
          <p style="margin: 0; color: rgba(255,255,255,0.95); line-height: 1.7;">
            Don't forget to explore our <strong>Referral Program</strong> – help us give every dog a voice for their lifetime.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-top: 30px;">
          Welcome to the pack,<br>
          <strong style="color: #5691af;">– The PetPort Team</strong>
        </p>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e2e8f0; text-align: center;">
          <a href="https://petport.app" style="display: inline-block; text-decoration: none;">
            <div style="background: #5691af; color: white; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              PetPort.app
            </div>
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 15px;">
            Digital Pet Passport | Secure Cloud Storage | Lifetime Records
          </p>
        </div>
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
      subject: `🐾 ${petName} is being transferred to you - Start your free trial`,
      content: `
        <h2>🐾 ${petName} is being transferred to you!</h2>
        <p>${sender} is transferring ${petName}'s complete pet profile and account to you on PetPort.</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">⏰ This transfer link expires in 7 days</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #5691af 10%, #4a7c95 90%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">✨ Create your PetPort account and start your free 7-day trial to complete the transfer</h3>
          <p style="margin: 10px 0; color: rgba(255,255,255,0.9);">
            Join thousands of pet owners who trust PetPort to keep their pets safe and organized.
          </p>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0c4a6e;">🎯 What you'll receive:</h4>
          <ul style="color: #0c4a6e; margin: 15px 0; padding-left: 20px;">
            <li>Full ownership transfer of ${petName}'s complete profile</li>
            <li>7-day free trial with all premium features</li>
            <li>All of ${petName}'s medical records and information</li>
            <li>Emergency contact details and care instructions</li>
            <li>Photo galleries and vaccination records</li>
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
      `
    },
    transfer_invite_existing: {
      subject: `🐾 ${petName} is being transferred to you - Accept to claim`,
      content: `
        <h2>🐾 ${petName} is being transferred to you!</h2>
        <p>${sender} wants to transfer ${petName}'s complete pet profile to your PetPort account.</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">⏰ This transfer link expires in 7 days</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">📦 Click below to accept and claim ${petName}'s profile</h3>
          <p style="margin: 10px 0; color: #0c4a6e;">Once you accept, ${petName} and all their information will be transferred to your account.</p>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <p>Click the button below to accept this transfer and add ${petName} to your account.</p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
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
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
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
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
      `
    },
    transfer_sent_confirmation: {
      subject: `✅ Transfer request sent for ${petName}`,
      content: `
        <h2 style="color: #5691af;">✅ Transfer Request Sent</h2>
        <p>Your transfer request for <strong>${petName}</strong> has been sent successfully!</p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #5691af; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">📋 Transfer Details</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Pet:</strong> ${petName}</li>
            <li><strong>Recipient:</strong> ${data.transferRecipientEmail || data.recipientEmail}</li>
            <li><strong>Expires:</strong> 7 days from now</li>
          </ul>
          ${customMessage ? `<p style="margin: 15px 0; padding: 12px; background: white; border-radius: 6px; font-style: italic; color: #64748b;">"${customMessage}"</p>` : ''}
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fbbf24; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">⏰ What Happens Next</h3>
          <ul style="color: #78350f; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>The recipient will receive an email invitation</li>
            <li>They have <strong>7 days</strong> to accept the transfer</li>
            <li>You'll receive another email when they accept</li>
            <li>If they don't accept, you can send a new request</li>
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">📬 Recipient Requirements</h3>
          <p style="margin: 0; color: rgba(255,255,255,0.95); line-height: 1.7;">
            ${data.recipientStatus === 'new' 
              ? 'The recipient will need to <strong>create a PetPort account</strong> with a 7-day free trial to accept the transfer.' 
              : data.recipientStatus === 'at_limit' 
              ? 'The recipient has reached their pet limit and will need to <strong>purchase an additional pet slot</strong> to accept the transfer.' 
              : 'The recipient will need to <strong>accept the transfer</strong> in their PetPort account.'}
          </p>
        </div>
        
        <p style="color: #64748b; margin-top: 25px;">The transfer is secure and can only be accepted by the email address you specified.</p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
      `
    },
    transfer_completed_sender: {
      subject: `🎉 ${petName}'s transfer is complete!`,
      content: `
        <h2 style="color: #5691af;">🎉 Transfer Complete!</h2>
        <p>Great news! <strong>${data.senderName || 'The recipient'}</strong> has accepted the transfer of <strong>${petName}</strong>.</p>
        
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
          <h3 style="margin: 0; color: white; font-size: 20px;">Transfer Successful</h3>
        </div>
        
        <div style="background: #f8fafc; border: 2px solid #5691af; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">📋 Transfer Summary</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Pet:</strong> ${petName}</li>
            <li><strong>New Owner:</strong> ${data.senderName || data.recipientEmail}</li>
            <li><strong>Completed:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5691af;">
          <h3 style="margin-top: 0; color: #5691af;">✨ What This Means</h3>
          <p style="color: #475569; line-height: 1.7; margin: 0;">
            ${petName} has been successfully transferred to their new account. The new owner now has full access to manage ${petName}'s profile, including all photos, documents, and information.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for keeping ${petName}'s voice with them wherever they go! 🐾
          </p>
        </div>
      `
    },
    pet_guardian: {
      subject: `🛡️ You've Been Designated as a Pet Guardian for ${petName}`,
      content: `
        <h2 style="color: #5691af;">🛡️ You've Been Designated as a Pet Guardian</h2>
        <p><strong>${sender}</strong> has designated you as a trusted guardian to care for <strong>${petName}</strong> in case of emergency or long-term incapacitation.</p>
        
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🛡️</div>
          <h3 style="margin: 0; color: white; font-size: 20px;">Trusted Pet Guardian</h3>
        </div>
        
        ${customMessage ? `<blockquote style="border-left: 4px solid #5691af; padding-left: 16px; margin: 16px 0; font-style: italic; background-color: #f8fafc;">"${customMessage}"</blockquote>` : ''}
        
        <div style="background: #f0f9ff; border-left: 4px solid #5691af; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">📋 Your Guardian Access Includes:</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Complete pet profile and emergency contact information</li>
            <li>Medical records and vaccination history</li>
            <li>Care instructions and dietary requirements</li>
            <li>Behavioral notes and special needs</li>
            <li>Authorization to make care decisions</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; line-height: 1.7;">
            <strong>🔒 Important:</strong> This link is private and should not be shared with others. Please keep it secure for when it's needed.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #5691af;">
          <p style="color: #0c4a6e; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.6;">
            Thank you for being a trusted guardian for ${petName}! 🐾
          </p>
        </div>
      `
    },
    grace_period_started: {
      subject: '⚠️ Payment Failed - Your PetPort Account is in Grace Period',
      content: `
        <h2 style="color: #f59e0b;">⚠️ Payment Failed - Grace Period Started</h2>
        <p>${greeting}</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; line-height: 1.7; font-size: 16px;">
            <strong>We couldn't process your payment.</strong> Your account is now in a 14-day grace period. You can continue using PetPort while you update your payment method.
          </p>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #5691af; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">What This Means:</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Full Access:</strong> All your pet profiles and features remain active</li>
            <li><strong>14-Day Window:</strong> You have 14 days to update your payment method</li>
            <li><strong>After 14 Days:</strong> Your account will be suspended if payment isn't resolved</li>
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #5691af 0%, #4a7c95 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
          <h3 style="margin: 10px 0; color: white; font-size: 24px;">14 Days Remaining</h3>
          <p style="color: rgba(255,255,255,0.95); margin: 10px 0;">Grace period ends: ${data.gracePeriodEnd ? new Date(data.gracePeriodEnd).toLocaleDateString() : ''}</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://petport.app/billing" style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
            💳 Update Payment Method
          </a>
        </p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Need help? Contact us at <a href="mailto:info@petport.app" style="color: #5691af;">info@petport.app</a>
          </p>
        </div>
      `
    },
    grace_period_reminder: {
      subject: `⏰ ${data.daysRemaining} Days Left - PetPort Grace Period Ending Soon`,
      content: `
        <h2 style="color: #dc2626;">⏰ Grace Period Ending Soon</h2>
        <p>${greeting}</p>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 10px;">⚠️</div>
          <h3 style="margin: 10px 0; color: #991b1b; font-size: 28px;">${data.daysRemaining} ${data.daysRemaining === 1 ? 'Day' : 'Days'} Remaining</h3>
          <p style="color: #991b1b; margin: 10px 0; font-size: 16px;">Your account will be suspended on ${data.gracePeriodEnd ? new Date(data.gracePeriodEnd).toLocaleDateString() : ''}</p>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">⚡ Act Now to Avoid Losing Access</h3>
          <p style="color: #78350f; line-height: 1.7; margin: 0;">
            Update your payment method within ${data.daysRemaining} ${data.daysRemaining === 1 ? 'day' : 'days'} to keep your pet profiles, records, and all PetPort features active.
          </p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">What Happens If Payment Isn't Updated:</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>❌ You'll lose access to all pet profiles</li>
            <li>❌ LiveLinks and shared profiles will be disabled</li>
            <li>❌ Pet records and documents won't be accessible</li>
            <li>❌ Lost pet recovery features will be unavailable</li>
          </ul>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://petport.app/billing" style="display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            🔥 Update Payment Now
          </a>
        </p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Having trouble? We're here to help: <a href="mailto:info@petport.app" style="color: #5691af;">info@petport.app</a>
          </p>
        </div>
      `
    },
    grace_period_expired: {
      subject: '🚫 PetPort Account Suspended - Reactivate Now',
      content: `
        <h2 style="color: #991b1b;">🚫 Account Suspended</h2>
        <p>${greeting}</p>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 10px;">⛔</div>
          <h3 style="margin: 10px 0; color: #991b1b; font-size: 24px;">Your Account Has Been Suspended</h3>
          <p style="color: #991b1b; margin: 10px 0;">The 14-day grace period has ended</p>
        </div>
        
        <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">❌ Current Account Status:</h3>
          <ul style="color: #991b1b; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>All pet profiles are currently inaccessible</li>
            <li>LiveLinks and shared profiles are disabled</li>
            <li>Pet records and documents are unavailable</li>
            <li>Lost pet recovery features are inactive</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #15803d;">✅ Good News - Easy to Reactivate!</h3>
          <p style="color: #166534; line-height: 1.7; margin: 0;">
            Your data is safe! Update your payment method now to immediately restore full access to all your pet profiles and features.
          </p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://petport.app/billing" style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ✨ Reactivate My Account
          </a>
        </p>
        
        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #475569; margin: 0; line-height: 1.7;">
            <strong>Need assistance?</strong><br>
            We're here to help get you back up and running.<br>
            Contact us at <a href="mailto:info@petport.app" style="color: #5691af;">info@petport.app</a>
          </p>
        </div>
      `
    },
    gift_notification: {
      subject: data.giftTheme === 'christmas' ? '🎁 You\'ve Been Gifted PetPort — A Christmas Surprise!' : 
               data.giftTheme === 'adoption' ? '🏡 You\'ve Been Gifted PetPort — An Adoption Celebration!' :
               data.giftTheme === 'birthday' ? '🎂 You\'ve Been Gifted PetPort — A Birthday Treat!' :
               data.giftTheme === 'holiday' ? '🎁 You\'ve Been Gifted PetPort — A Year of Pawsitivity!' :
               '🎁 You\'ve Received a PetPort Gift Membership!',
      content: `
        ${data.giftTheme === 'adoption' ? `
          <div style="background: #ec4899; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">💜 ADOPTION ANNIVERSARY 💜</span>
          </div>
          <h2 style="color: #ec4899; text-align: center; font-size: 28px; margin-bottom: 10px;">💜 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
          <p style="text-align: center; color: #831843; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
        ` : data.giftTheme === 'christmas' ? `
          <div style="background: #dc2626; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎄 MERRY CHRISTMAS 🎁</span>
          </div>
          <h2 style="color: #dc2626; text-align: center; font-size: 28px; margin-bottom: 10px;">🎁 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
          <p style="text-align: center; color: #991b1b; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
        ` : data.giftTheme === 'birthday' ? `
          <div style="background: #8b5cf6; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎂 HAPPY BIRTHDAY 🎉</span>
          </div>
          <h2 style="color: #8b5cf6; text-align: center; font-size: 28px; margin-bottom: 10px;">🎂 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
          <p style="text-align: center; color: #6b21a8; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
        ` : data.giftTheme === 'holiday' ? `
          <div style="background: #ea580c; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎊 HAPPY HOLIDAYS 🎁</span>
          </div>
          <h2 style="color: #ea580c; text-align: center; font-size: 28px; margin-bottom: 10px;">🎁 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
          <p style="text-align: center; color: #9a3412; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
        ` : `
          <h2 style="color: #5691af; text-align: center; font-size: 28px; margin-bottom: 10px;">🎁 You've Received a Gift!</h2>
        `}
        
        <p style="font-size: 16px; line-height: 1.6; color: #333333; text-align: center;">
          ${data.giftTheme === 'adoption' ? '🏡 Love multiplies when shared!' :
            data.giftTheme === 'christmas' ? '🎄 \'Tis the season of giving!' :
            data.giftTheme === 'birthday' ? '🎂 Make a wish!' :
            data.giftTheme === 'holiday' ? '🎊 Wishing you joy!' :
            '🎁 Something special awaits!'}
          <strong>${data.senderName || 'Someone special'}</strong> sent you ${data.giftTheme === 'adoption' ? 'a special adoption anniversary gift' : data.giftTheme === 'christmas' ? 'a Christmas gift' : data.giftTheme === 'birthday' ? 'a birthday gift' : data.giftTheme === 'holiday' ? 'a holiday gift' : 'a gift'} — a full year of PetPort to ${data.giftTheme === 'adoption' ? 'celebrate and preserve the beautiful journey with your furry family member' : 'keep your pet safe, organized, and connected'} 💕
        </p>
        
        ${data.giftMessage ? `
          <div style="background: #f8fafc; border-left: 4px solid ${data.giftTheme === 'adoption' ? '#ec4899' : data.giftTheme === 'christmas' ? '#dc2626' : data.giftTheme === 'birthday' ? '#8b5cf6' : data.giftTheme === 'holiday' ? '#ea580c' : '#5691af'}; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="font-style: italic; color: #475569; margin: 0; line-height: 1.6;">
              "${data.giftMessage}"
            </p>
            <p style="text-align: right; color: #64748b; margin: 10px 0 0 0; font-size: 14px;">
              — ${data.senderName || 'Your gift sender'}
            </p>
          </div>
        ` : ''}
        
        <div style="background: ${data.giftTheme === 'adoption' ? 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' : data.giftTheme === 'christmas' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : data.giftTheme === 'birthday' ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : data.giftTheme === 'holiday' ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'}; border: 2px solid ${data.giftTheme === 'adoption' ? '#ec4899' : data.giftTheme === 'christmas' ? '#dc2626' : data.giftTheme === 'birthday' ? '#8b5cf6' : data.giftTheme === 'holiday' ? '#ea580c' : '#5691af'}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: ${data.giftTheme === 'adoption' ? '#831843' : data.giftTheme === 'christmas' ? '#991b1b' : data.giftTheme === 'birthday' ? '#6b21a8' : data.giftTheme === 'holiday' ? '#9a3412' : '#0c4a6e'}; font-size: 20px;">This gift includes:</h3>
          <ul style="text-align: left; color: #475569; margin: 15px auto; padding-left: 20px; line-height: 1.8; max-width: 400px;">
            <li>~ Full year of premium membership</li>
            <li>~ 1 free pet profile</li>
            <li>~ Beautiful Photo Gallery up to 36 photo</li>
            <li>~ Medical, Vaccination and Doc record storage</li>
            <li>~ One-Tap Lost pet flyer generation</li>
            <li>~ Livelinks for Care Instructions for all caregivers</li>
            <li>~ Resume Builder for sitters, groomers, lodging and more</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 16px;">
            <strong>📋 Your Gift Code:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: 700;">${data.giftCode}</span><br>
            <strong>⏰ Valid Until:</strong> ${data.expiresAt}<br>
            <em style="font-size: 14px;">Redeem your gift now to activate your membership!</em>
          </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #64748b; font-size: 14px; margin: 5px 0;">
            ${data.giftTheme === 'adoption' ? '💜 Celebrating Love & Adoption from PetPort! 🏡' :
              data.giftTheme === 'christmas' ? '🎄 Merry Christmas from PetPort! 🎁' :
              data.giftTheme === 'birthday' ? '🎂 Happy Birthday from PetPort! 🎉' :
              data.giftTheme === 'holiday' ? '🎊 Happy Holidays from PetPort! 🎁' :
              '🎁 From PetPort with Love! 🐾'}
          </p>
        </div>
      `
    },
    gift_purchase_confirmation: {
      subject: data.giftTheme === 'christmas' ? '🎁 Your PetPort Christmas Gift Has Been Sent!' : 
               data.giftTheme === 'adoption' ? '🏡 Your PetPort Adoption Gift Has Been Sent!' :
               data.giftTheme === 'birthday' ? '🎂 Your PetPort Birthday Gift Has Been Sent!' :
               data.giftTheme === 'holiday' ? '🎁 Your PetPort Holiday Gift Has Been Sent!' :
               '✅ Gift Purchase Confirmed - PetPort',
      content: `
        ${data.giftTheme === 'adoption' ? `
          <div style="background: #ec4899; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🏡 ADOPTION ANNIVERSARY GIFT SENT 🐾</span>
          </div>
        ` : data.giftTheme === 'christmas' ? `
          <div style="background: #dc2626; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎄 CHRISTMAS GIFT SENT 🎁</span>
          </div>
        ` : data.giftTheme === 'birthday' ? `
          <div style="background: #8b5cf6; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎂 BIRTHDAY GIFT SENT 🎉</span>
          </div>
        ` : data.giftTheme === 'holiday' ? `
          <div style="background: #ea580c; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
            <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎊 HOLIDAY GIFT SENT 🎁</span>
          </div>
        ` : ''}
        
        <h2 style="color: ${data.giftTheme === 'adoption' ? '#ec4899' : data.giftTheme === 'christmas' ? '#dc2626' : data.giftTheme === 'birthday' ? '#8b5cf6' : data.giftTheme === 'holiday' ? '#ea580c' : '#5691af'}; text-align: center; font-size: 32px; margin-bottom: 10px;">💝 Gift Purchase Confirmed! 💝</h2>
        <p style="text-align: center; color: #475569; font-size: 18px; margin-bottom: 25px;">
          Your ${data.giftTheme === 'adoption' ? 'adoption celebration' : data.giftTheme || 'special'} gift is ready!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">
          Wonderful news! Your ${data.giftTheme === 'adoption' ? 'adoption anniversary' : data.giftTheme || ''} gift to <strong>${data.giftRecipientEmail}</strong> has been successfully purchased and will be delivered as scheduled! 🎁
        </p>
        
        <div style="background: ${data.giftTheme === 'adoption' ? '#faf5ff' : data.giftTheme === 'christmas' ? '#fef2f2' : data.giftTheme === 'birthday' ? '#faf5ff' : data.giftTheme === 'holiday' ? '#fff7ed' : '#f0f9ff'}; border: 2px solid ${data.giftTheme === 'adoption' ? '#d8b4fe' : data.giftTheme === 'christmas' ? '#fecaca' : data.giftTheme === 'birthday' ? '#d8b4fe' : data.giftTheme === 'holiday' ? '#fed7aa' : '#bae6fd'}; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: ${data.giftTheme === 'adoption' ? '#a855f7' : data.giftTheme === 'christmas' ? '#dc2626' : data.giftTheme === 'birthday' ? '#8b5cf6' : data.giftTheme === 'holiday' ? '#ea580c' : '#0284c7'}; font-size: 20px;">🐾 Gift Details</h3>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #475569; font-size: 15px; padding: 8px 0;"><strong>Recipient:</strong></td>
              <td style="color: #1f2937; font-size: 15px; padding: 8px 0;">${data.giftRecipientEmail}</td>
            </tr>
            <tr>
              <td style="color: #475569; font-size: 15px; padding: 8px 0;"><strong>Gift Code:</strong></td>
              <td style="color: #1f2937; font-size: 15px; font-family: monospace; padding: 8px 0;">${data.giftCode}</td>
            </tr>
            <tr>
              <td style="color: #475569; font-size: 15px; padding: 8px 0;"><strong>Valid Until:</strong></td>
              <td style="color: #1f2937; font-size: 15px; padding: 8px 0;">${data.expiresAt}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin: 20px 0;">
          The lucky recipient will receive an email with instructions on how to redeem their special ${data.giftTheme === 'adoption' ? 'adoption celebration' : data.giftTheme || ''} gift! ${data.giftTheme === 'adoption' ? '🏡' : '🎁'}
        </p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 12px 0; color: #5691af; font-size: 18px;">📋 Gift Code (Backup)</h3>
          <p style="font-family: monospace; font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 15px 0; text-align: center; background: white; padding: 12px; border-radius: 6px;">${data.giftCode}</p>
          <h3 style="margin: 15px 0 12px 0; color: #5691af; font-size: 18px;">🔗 Redemption Link (Backup)</h3>
          <p style="font-size: 14px; color: #475569; margin: 0; word-break: break-all; background: white; padding: 12px; border-radius: 6px;">${data.redemptionLink}</p>
          <p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            💡 Only share this if your recipient didn't receive the automatic email
          </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #64748b; font-size: 14px;">
            ${data.giftTheme === 'adoption' ? '💜 Thank you for celebrating adoption with PetPort! 🏡' :
              data.giftTheme === 'christmas' ? '🎄 Merry Christmas from PetPort! 🎁' :
              data.giftTheme === 'birthday' ? '🎂 Happy Birthday from PetPort! 🎉' :
              data.giftTheme === 'holiday' ? '🎊 Happy Holidays from PetPort! 🎁' :
              '🎁 Thank you for gifting PetPort! 🐾'}
          </p>
        </div>
      `
    },
    gift_activated: {
      subject: data.giftTheme === 'christmas' ? '🎉 Your PetPort Christmas Gift Is Now Active!' :
               data.giftTheme === 'adoption' ? '🎉 Your PetPort Adoption Gift Is Now Active!' :
               data.giftTheme === 'birthday' ? '🎉 Your PetPort Birthday Gift Is Now Active!' :
               data.giftTheme === 'holiday' ? '🎉 Your PetPort Holiday Gift Is Now Active!' :
               '✅ Welcome to PetPort - Your Gift Membership Is Active',
      content: `
        <h2 style="color: #22c55e; text-align: center; font-size: 32px; margin-bottom: 10px;">🎉 Your Gift Is Now Active! 🎉</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1f2937; text-align: center; margin-bottom: 25px;">
          Welcome to PetPort! Your ${data.giftTheme === 'adoption' ? 'adoption anniversary' : data.giftTheme || 'gift'} membership has been successfully activated.
        </p>
        
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 10px;">✓</div>
          <h3 style="margin: 10px 0; color: #15803d; font-size: 24px;">Membership Active</h3>
          <p style="color: #166534; margin: 10px 0; font-size: 16px;">Valid until: ${data.expiresAt}</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">🎁 Your Premium Features:</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Create unlimited pet profiles</li>
            <li>Store medical records and documents securely</li>
            <li>Generate missing pet flyers with QR codes</li>
            <li>Share LiveLinks with anyone, anywhere</li>
            <li>Set up emergency contacts and guardians</li>
            <li>Access from any device, anytime</li>
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #92400e; font-size: 18px; font-weight: 600;">
            🐾 Ready to get started? Add your first pet profile now!
          </p>
        </div>
        
        <p style="text-align: center; color: #64748b; font-size: 14px; margin: 25px 0;">
          Need help? Visit our <a href="https://petport.app/help" style="color: #5691af;">Help Center</a> or contact us at <a href="mailto:info@petport.app" style="color: #5691af;">info@petport.app</a>
        </p>
      `
    },
    gift_renewal_reminder: {
      subject: data.daysRemaining === 60 ? '🎁 Your PetPort Gift Expires in 60 Days' : 
               data.daysRemaining === 30 ? '⏰ Your PetPort Gift Expires in 30 Days' :
               '🚨 Your PetPort Gift Expires in 7 Days',
      content: `
        <h2 style="color: #f59e0b; text-align: center; font-size: 28px; margin-bottom: 10px;">⏰ Gift Membership Expiring Soon</h2>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 10px;">⚠️</div>
          <h3 style="margin: 10px 0; color: #92400e; font-size: 28px;">${data.daysRemaining} ${data.daysRemaining === 1 ? 'Day' : 'Days'} Remaining</h3>
          <p style="color: #78350f; margin: 10px 0; font-size: 16px;">Your gift membership expires on ${data.expiresAt}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1f2937; text-align: center;">
          Your gift membership will expire soon. Subscribe now to continue enjoying all PetPort premium features and keep your pets safe!
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #5691af; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5691af;">✨ Continue With Premium:</h3>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Keep all your pet profiles active</li>
            <li>Maintain access to emergency features</li>
            <li>Continue sharing LiveLinks</li>
            <li>Preserve your pet's complete history</li>
          </ul>
        </div>
      `
    },
    gift_expired: {
      subject: 'Your PetPort Gift Membership Has Expired',
      content: `
        <h2 style="color: #dc2626; text-align: center; font-size: 28px; margin-bottom: 10px;">⏰ Gift Membership Expired</h2>
        
        <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; line-height: 1.7; font-size: 16px;">
            Your PetPort gift membership has expired. Subscribe now to restore access to all your pet profiles and premium features.
          </p>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #15803d;">✅ Good News - Easy to Reactivate!</h3>
          <p style="color: #166534; line-height: 1.7; margin: 0;">
            Your data is safe! Subscribe now to immediately restore full access to all your pet profiles and features.
          </p>
        </div>
      `
    }
  };

  const templateContent = templates[type];

  if (!templateContent) {
    // Return a simple fallback for unknown types
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Hello,</p>
          <p>You've received a message from PetPort.</p>
          <p><a href="${shareUrl}">Click here to view</a></p>
        </body>
      </html>
    `;
  }

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
          
          ${type !== 'transfer_completed_sender' && type !== 'gift_purchase_confirmation' && type !== 'gift_renewal_reminder' && type !== 'gift_expired' ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${(() => {
              // Determine the correct button URL based on email type
              const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
              
              // For gift notification, go to claim page with gift code
              if (type === 'gift_notification') {
                return `${baseUrl}/claim-subscription?code=${data.giftCode}`;
              }
              
              // For gift activated, go to add pet page
              if (type === 'gift_activated') {
                return `${baseUrl}/add-pet`;
              }
              
              // For transfer emails, use transferUrl instead of shareUrl
              if (type === 'transfer_invite_new' || type === 'transfer_invite_existing' || type === 'transfer_limit_reached') {
                return data.transferUrl || `${baseUrl}/transfer/accept/${data.transferToken}`;
              } else if (type === 'transfer_success') {
                return `${baseUrl}/profile/${data.petId}`;
              } else if (type === 'transfer_sent_confirmation') {
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
                  type === 'gift_notification' ? '🎁 Claim Your Gift' :
                  type === 'gift_activated' ? '🐾 Add Your First Pet' :
                  type === 'review_request' ? `📝 Leave a Review for ${petName}` :
                  type === 'transfer_invite_new' ? 'Create Account & Start Free Trial' :
                  type === 'transfer_invite_existing' ? `Accept ${petName}'s Transfer` :
                  type === 'transfer_success' ? `View ${petName}'s Profile` :
                  type === 'transfer_limit_reached' ? 'Add Pet Slot & Claim Profile' :
                  type === 'transfer_sent_confirmation' ? `View ${petName}'s Profile` :
                  `View ${petName}'s ${type === 'profile' ? 'Profile' : type === 'missing_pet' ? 'Missing Pet Alert' : type === 'resume' ? 'Resume' : type.charAt(0).toUpperCase() + type.slice(1)}`}
            </a>
          </div>
          ` : ''}
          
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
        subject: `🐾 ${emailData.petName} is being transferred to you - Accept to claim`
      },
      transfer_success: {
        subject: `🎉 ${emailData.petName}'s profile transfer completed successfully`
      },
      transfer_limit_reached: {
        subject: `🐾 ${emailData.petName}'s profile is waiting - Add a pet slot to claim it`
      },
      gift_purchase_confirmation: {
        subject: emailData.giftTheme === 'christmas' ? '🎁 Your PetPort Christmas Gift Has Been Sent!' : 
                 emailData.giftTheme === 'adoption' ? '🏡 Your PetPort Adoption Gift Has Been Sent!' :
                 emailData.giftTheme === 'birthday' ? '🎂 Your PetPort Birthday Gift Has Been Sent!' :
                 emailData.giftTheme === 'holiday' ? '🎁 Your PetPort Holiday Gift Has Been Sent!' :
                 '✅ Gift Purchase Confirmed - PetPort'
      },
      gift_notification: {
        subject: emailData.giftTheme === 'christmas' ? '🎁 You\'ve Been Gifted PetPort — A Christmas Surprise!' : 
                 emailData.giftTheme === 'adoption' ? '🏡 You\'ve Been Gifted PetPort — An Adoption Celebration!' :
                 emailData.giftTheme === 'birthday' ? '🎂 You\'ve Been Gifted PetPort — A Birthday Treat!' :
                 emailData.giftTheme === 'holiday' ? '🎁 You\'ve Been Gifted PetPort — A Year of Pawsitivity!' :
                 '🎁 You\'ve Received a PetPort Gift Membership!'
      },
      gift_activated: {
        subject: emailData.giftTheme === 'christmas' ? '🎉 Your PetPort Christmas Gift Is Now Active!' :
                 emailData.giftTheme === 'adoption' ? '🎉 Your PetPort Adoption Gift Is Now Active!' :
                 emailData.giftTheme === 'birthday' ? '🎉 Your PetPort Birthday Gift Is Now Active!' :
                 emailData.giftTheme === 'holiday' ? '🎉 Your PetPort Holiday Gift Is Now Active!' :
                 '✅ Welcome to PetPort - Your Gift Membership Is Active'
      },
      gift_renewal_reminder: {
        subject: emailData.daysRemaining === 60 ? '🎁 Your PetPort Gift Expires in 60 Days' : 
                 emailData.daysRemaining === 30 ? '⏰ Your PetPort Gift Expires in 30 Days' :
                 '🚨 Your PetPort Gift Expires in 7 Days'
      },
      gift_expired: {
        subject: 'Your PetPort Gift Membership Has Expired'
      },
      pet_guardian: {
        subject: `🛡️ You've Been Designated as a Pet Guardian for ${emailData.petName}`
      },
      grace_period_started: {
        subject: '⚠️ Payment Failed - Your PetPort Account is in Grace Period'
      },
      grace_period_reminder: {
        subject: `⏰ ${emailData.daysRemaining} Days Left - PetPort Grace Period Ending Soon`
      },
      grace_period_expired: {
        subject: '🚫 PetPort Account Suspended - Reactivate Now'
      }
    };

    const emailTemplate = generateEmailTemplate(emailData);
    const textBody = generateTextBody(emailData);
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
        From: emailData.type === 'welcome_trial' || emailData.type === 'app_share' 
          ? "PetPort <campaign@petport.app>"
          : emailData.type.startsWith('gift_')
          ? "PetPort <gifts@petport.app>"
          : "PetPort <info@petport.app>",
        ReplyTo: "info@petport.app",
        To: emailData.recipientEmail,
        Subject: subject,
        HtmlBody: emailTemplate,
        TextBody: textBody,
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