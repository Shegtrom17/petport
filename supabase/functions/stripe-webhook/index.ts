import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const logChanges = (eventType: string, previousAttributes?: any) => {
  if (previousAttributes && Object.keys(previousAttributes).length > 0) {
    logStep(`Changes detected in ${eventType}`, { 
      changedFields: Object.keys(previousAttributes),
      previousValues: previousAttributes 
    });
  } else {
    logStep(`No previous attributes found - likely a creation event`, { eventType });
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      throw new Error("Missing stripe signature or webhook secret");
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Webhook verified", { eventType: event.type, eventId: event.id });

    // Check idempotency
    const { data: isNewEvent } = await supabaseClient
      .rpc("process_webhook_event", {
        _stripe_event_id: event.id,
        _event_type: event.type
      });

    if (!isNewEvent) {
      logStep("Event already processed, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Log changes for update events
    logChanges(event.type, event.data.previous_attributes);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event, supabaseClient, "active");
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event, supabaseClient);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event, supabaseClient);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event, supabaseClient, "canceled");
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event, supabaseClient, stripe);
        break;

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionEvent(
  event: any,
  supabaseClient: any,
  status: 'active' | 'canceled'
) {
  const subscription = event.data.object;
  const previousAttributes = event.data.previous_attributes;
  const customerId = subscription.customer;
  
  // For subscription updates, check if status actually changed
  if (event.type === "customer.subscription.updated" && previousAttributes) {
    const statusChanged = previousAttributes.hasOwnProperty('status');
    const relevantFieldsChanged = statusChanged || 
      previousAttributes.hasOwnProperty('current_period_end') ||
      previousAttributes.hasOwnProperty('cancel_at_period_end');
    
    if (!relevantFieldsChanged) {
      logStep("Subscription updated but no relevant fields changed, skipping", {
        customerId,
        changedFields: Object.keys(previousAttributes)
      });
      return;
    }
    
    logStep("Processing subscription update with relevant changes", {
      customerId,
      statusChanged,
      previousStatus: previousAttributes.status,
      currentStatus: subscription.status
    });
  }
  
  logStep("Handling subscription event", { 
    customerId, 
    status: subscription.status,
    targetStatus: status 
  });

  // Get customer email
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted || !('email' in customer) || !customer.email) {
    throw new Error("Customer not found or has no email");
  }

  // Determine plan interval from subscription
  const planInterval = subscription.items?.data?.[0]?.plan?.interval || 
                       subscription.items?.data?.[0]?.price?.recurring?.interval || 
                       'year';
  
  logStep("Detected plan interval", { planInterval });

  // Find user by email
  const { data: userData } = await supabaseClient.auth.admin.listUsers({
    email: customer.email
  });

  if (!userData.users.length) {
    logStep("No user found for email", { email: customer.email });
    return;
  }

  const user = userData.users[0];
  const reactivatedAt = status === 'active' ? new Date().toISOString() : null;
  const canceledAt = status === 'canceled' ? new Date().toISOString() : null;

  // Also update the legacy subscribed field for backwards compatibility
  await supabaseClient.rpc("update_subscriber_status", {
    _user_id: user.id,
    _status: status,
    _reactivated_at: reactivatedAt,
    _canceled_at: canceledAt
  });

  // Update legacy subscribed field AND plan_interval
  await supabaseClient
    .from("subscribers")
    .update({ 
      subscribed: status === 'active',
      plan_interval: planInterval
    })
    .eq("user_id", user.id);

  logStep("Updated subscriber status", { 
    userId: user.id, 
    status,
    planInterval,
    email: customer.email 
  });
  
  // Link referral if code exists in metadata AND plan is yearly
  const referralCode = subscription.metadata?.referral_code;
  if (referralCode && status === 'active' && planInterval === 'year') {
    logStep("Processing referral code for yearly subscription", { referralCode, planInterval });
    
    try {
      const { data: referralData, error: referralError } = await supabaseClient
        .from('referrals')
        .select('id, referrer_user_id')
        .eq('referral_code', referralCode)
        .is('referred_user_id', null)
        .single();
      
      if (!referralError && referralData) {
        const trialEnd = subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString()
          : new Date().toISOString();
        
        await supabaseClient
          .from('referrals')
          .update({
            referred_user_id: user.id,
            trial_completed_at: trialEnd,
            referred_plan_interval: planInterval,
            updated_at: new Date().toISOString()
          })
          .eq('id', referralData.id);
        
        logStep("Referral linked successfully", { 
          referralId: referralData.id,
          referredUserId: user.id,
          planInterval,
          trialEnd
        });
      } else {
        logStep("Referral code not found or already used", { referralCode });
      }
    } catch (error) {
      logStep("Error linking referral", { error: error.message, referralCode });
    }
  }
}

async function handlePaymentFailed(event: any, supabaseClient: any) {
  const invoice = event.data.object;
  const previousAttributes = event.data.previous_attributes;
  const customerId = invoice.customer;
  
  // Log what changed in the invoice if it's an update
  if (previousAttributes) {
    logStep("Invoice payment failed with previous changes", {
      customerId,
      changedFields: Object.keys(previousAttributes),
      attemptCount: invoice.attempt_count
    });
  }
  
  logStep("Handling payment failed", { customerId });

  // Get customer and find user
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted || !('email' in customer) || !customer.email) {
    throw new Error("Customer not found or has no email");
  }

  const { data: userData } = await supabaseClient.auth.admin.listUsers({
    email: customer.email
  });

  if (!userData.users.length) {
    logStep("No user found for email", { email: customer.email });
    return;
  }

  const user = userData.users[0];
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 14); // 14-day grace period

  await supabaseClient.rpc("update_subscriber_status", {
    _user_id: user.id,
    _status: 'grace',
    _payment_failed_at: new Date().toISOString(),
    _grace_period_end: gracePeriodEnd.toISOString()
  });

  logStep("Set user to grace period", { 
    userId: user.id, 
    gracePeriodEnd: gracePeriodEnd.toISOString() 
  });
}

async function handlePaymentSucceeded(event: any, supabaseClient: any) {
  const invoice = event.data.object;
  const previousAttributes = event.data.previous_attributes;
  const customerId = invoice.customer;
  
  // Log what changed in the invoice payment
  if (previousAttributes) {
    logStep("Invoice payment succeeded with changes", {
      customerId,
      changedFields: Object.keys(previousAttributes),
      amountPaid: invoice.amount_paid
    });
  }
  
  logStep("Handling payment succeeded", { customerId });

  // Get customer and find user
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted || !('email' in customer) || !customer.email) {
    throw new Error("Customer not found or has no email");
  }

  const { data: userData } = await supabaseClient.auth.admin.listUsers({
    email: customer.email
  });

  if (!userData.users.length) {
    logStep("No user found for email", { email: customer.email });
    return;
  }

  const user = userData.users[0];

  // Check current status - only reactivate if in grace or suspended
  const { data: currentStatus } = await supabaseClient
    .from("subscribers")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentStatus && ['grace', 'suspended'].includes(currentStatus.status)) {
    await supabaseClient.rpc("update_subscriber_status", {
      _user_id: user.id,
      _status: 'active',
      _reactivated_at: new Date().toISOString()
    });

    // Update legacy subscribed field
    await supabaseClient
      .from("subscribers")
      .update({ subscribed: true })
      .eq("user_id", user.id);

    logStep("Reactivated user subscription", { 
      userId: user.id,
      previousStatus: currentStatus.status 
    });
  }
}

async function handleCheckoutCompleted(event: any, supabaseClient: any, stripe: any) {
  const session = event.data.object;
  
  logStep("Handling checkout.session.completed", { 
    sessionId: session.id,
    metadata: session.metadata 
  });

  // Check if this is a gift membership purchase
  if (session.metadata?.type === "gift_membership") {
    await handleGiftMembershipPurchase(session, supabaseClient);
  }
}

async function handleGiftMembershipPurchase(session: any, supabaseClient: any) {
  const recipientEmail = session.metadata.recipient_email;
  const senderName = session.metadata.sender_name || "A PetPort supporter";
  const giftMessage = session.metadata.gift_message || "";
  const purchaserEmail = session.metadata.purchaser_email || session.customer_email;
  const additionalPets = parseInt(session.metadata.additional_pets || "0", 10);
  const theme = session.metadata.theme || "default";
  const amountPaid = session.amount_total || 1499; // amount_total is in cents

  logStep("Processing gift membership", { 
    recipientEmail,
    senderName,
    purchaserEmail,
    additionalPets,
    theme,
    amountPaid 
  });

  // Generate unique 8-character gift code
  const giftCode = crypto.randomUUID().split('-')[0].toUpperCase();
  
  // Calculate expiry (1 year from purchase)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Insert gift membership record
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
      theme: theme,
      status: 'pending',
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (giftError) {
    logStep("Error creating gift membership", { error: giftError });
    throw giftError;
  }

  logStep("Gift membership created", { 
    giftCode,
    recipientEmail,
    expiresAt: expiresAt.toISOString() 
  });

  // Send confirmation emails
  try {
    const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
    const redemptionLink = `${baseUrl}/redeem?code=${giftCode}`;
    const formattedExpiry = expiresAt.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Select email template based on theme
    const purchaserTemplate = theme === 'christmas' ? 'gift-purchase-confirmation-christmas' :
                              theme === 'birthday' ? 'gift-purchase-confirmation-birthday' :
                              theme === 'adoption' ? 'gift-purchase-confirmation-adoption' :
                              'gift-purchase-confirmation';
    
    // Send to purchaser
    await supabaseClient.functions.invoke('send-email', {
      body: {
        type: purchaserTemplate,
        recipientEmail: purchaserEmail,
        recipientName: senderName,
        giftRecipientEmail: recipientEmail,
        petName: 'Gift Membership',
        petId: giftCode,
        shareUrl: redemptionLink,
        senderName: senderName,
        giftMessage: giftMessage,
        giftCode: giftCode,
        redemptionLink: redemptionLink,
        expiresAt: formattedExpiry
      }
    });

    // Select recipient email template based on theme
    const recipientTemplate = theme === 'christmas' ? 'gift-notification-christmas' :
                              theme === 'birthday' ? 'gift-notification-birthday' :
                              theme === 'adoption' ? 'gift-notification-adoption' :
                              'gift-notification';
    
    // Send to recipient
    await supabaseClient.functions.invoke('send-email', {
      body: {
        type: recipientTemplate,
        recipientEmail: recipientEmail,
        recipientName: recipientEmail.split('@')[0],
        petName: 'Gift Membership',
        petId: giftCode,
        shareUrl: redemptionLink,
        senderName: senderName,
        giftMessage: giftMessage,
        giftCode: giftCode,
        redemptionLink: redemptionLink,
        expiresAt: formattedExpiry
      }
    });

    logStep("Gift emails sent", { purchaserEmail, recipientEmail, theme });
  } catch (emailError) {
    logStep("Error sending gift emails", { error: emailError.message });
    // Don't throw - gift is still created even if emails fail
  }
}