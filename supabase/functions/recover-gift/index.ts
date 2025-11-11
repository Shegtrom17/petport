import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutSessionId } = await req.json();

    console.log("=== GIFT RECOVERY ===");
    console.log("Checkout Session ID:", checkoutSessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Get checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    
    console.log("Retrieved session:", {
      id: session.id,
      metadata: session.metadata,
      customer_email: session.customer_email,
      payment_status: session.payment_status
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if gift already exists
    const { data: existingGift } = await supabaseClient
      .from('gift_memberships')
      .select('*')
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle();

    if (existingGift) {
      console.log("Gift already exists:", existingGift.gift_code);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Gift already exists",
          giftCode: existingGift.gift_code,
          existing: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract metadata
    const recipientEmail = session.metadata?.recipient_email;
    const senderName = session.metadata?.sender_name || "A PetPort supporter";
    const giftMessage = session.metadata?.gift_message || "";
    const purchaserEmail = session.metadata?.purchaser_email || session.customer_email;
    const scheduledSendDate = session.metadata?.scheduled_send_date || "";
    const additionalPets = parseInt(session.metadata?.additional_pets || "0", 10);
    const theme = session.metadata?.theme || 'default';

    if (!recipientEmail) {
      throw new Error("No recipient email in session metadata");
    }

    // Generate unique 8-character gift code
    const giftCode = crypto.randomUUID().split('-')[0].toUpperCase();
    
    // Calculate total amount paid (from session amount_total in cents)
    const amountPaid = session.amount_total || 1499;
    
    // If gift is scheduled for future delivery, store in scheduled_gifts table
    if (scheduledSendDate) {
      console.log(`Gift scheduled for ${scheduledSendDate} - storing in scheduled_gifts table`);
      
      const { error: scheduledError } = await supabaseClient
        .from('scheduled_gifts')
        .insert({
          gift_code: giftCode,
          recipient_email: recipientEmail,
          purchaser_email: purchaserEmail || '',
          sender_name: senderName,
          gift_message: giftMessage,
          scheduled_send_date: scheduledSendDate,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: amountPaid,
          additional_pets: additionalPets,
          status: 'scheduled',
          theme: theme
        });

      if (scheduledError) {
        console.error("Error creating scheduled gift:", scheduledError);
        throw scheduledError;
      }

      console.log("Scheduled gift created successfully:", giftCode);

      return new Response(
        JSON.stringify({ 
          success: true,
          giftCode,
          recipientEmail,
          scheduledFor: scheduledSendDate,
          message: `Gift scheduled to be sent on ${scheduledSendDate}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Otherwise, create immediate gift membership
    // Calculate expiry (1 year from purchase)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create gift membership
    const { data: giftData, error: giftError } = await supabaseClient
      .from('gift_memberships')
      .insert({
        gift_code: giftCode,
        purchaser_email: purchaserEmail,
        recipient_email: recipientEmail,
        sender_name: senderName,
        gift_message: giftMessage,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        amount_paid: amountPaid,
        additional_pets: additionalPets,
        status: 'pending',
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        theme: theme
      })
      .select()
      .single();

    if (giftError) {
      console.error("Error creating gift:", giftError);
      throw giftError;
    }

    console.log("Gift created successfully:", giftCode);

    // Send confirmation emails
    try {
      const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
      const redemptionLink = `${baseUrl}/redeem?code=${giftCode}`;
      const formattedExpiry = expiresAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Send to purchaser with selected theme
      await supabaseClient.functions.invoke('send-email', {
        body: {
          type: 'gift_purchase_confirmation',
          recipientEmail: purchaserEmail,
          recipientName: senderName,
          petName: 'Gift Membership',
          petId: giftCode,
          shareUrl: redemptionLink,
          senderName: senderName,
          giftMessage: giftMessage,
          giftCode: giftCode,
          redemptionLink: redemptionLink,
          expiresAt: formattedExpiry,
          giftRecipientEmail: recipientEmail,
          giftTheme: theme || 'standard'
        }
      });

      // Send to recipient with selected theme
      await supabaseClient.functions.invoke('send-email', {
        body: {
          type: 'gift_notification',
          recipientEmail: recipientEmail,
          recipientName: recipientEmail.split('@')[0],
          petName: 'Gift Membership',
          petId: giftCode,
          shareUrl: redemptionLink,
          senderName: senderName,
          giftMessage: giftMessage,
          giftCode: giftCode,
          redemptionLink: redemptionLink,
          expiresAt: formattedExpiry,
          giftTheme: theme || 'standard'
        }
      });

      console.log("Emails sent successfully");
    } catch (emailError) {
      console.error("Email error:", emailError.message);
      // Don't fail - gift is created
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        giftCode,
        recipientEmail,
        senderName,
        giftMessage,
        expiresAt: expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        redemptionLink: `${Deno.env.get("APP_ORIGIN") || "https://petport.app"}/redeem?code=${giftCode}`,
        message: "Gift membership recovered and created successfully"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Recovery error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
