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
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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

  await supabaseClient.rpc("update_subscriber_status", {
    _user_id: user.id,
    _status: status,
    _reactivated_at: reactivatedAt,
    _canceled_at: canceledAt
  });

  logStep("Updated subscriber status", { 
    userId: user.id, 
    status,
    email: customer.email 
  });
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

    logStep("Reactivated user subscription", { 
      userId: user.id,
      previousStatus: currentStatus.status 
    });
  }
}