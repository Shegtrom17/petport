import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProvisionRequest {
  email: string;
  password: string;
  fullName: string;
  plan: "monthly" | "yearly";
  additionalPets: number;
  paymentMethodId?: string;
  corrId?: string; // Correlation ID for debugging
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle warm-up requests
  const body = await req.text();
  if (body === '{"__warm":true}' || body.includes('"warmUp":true')) {
    console.log('⚡ Warm-up request received');
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { email, password, fullName, plan, additionalPets, paymentMethodId, corrId }: ProvisionRequest = JSON.parse(body);
    
    console.log(`🚀 [${corrId || 'no-id'}] Starting provisioning for ${email}, plan: ${plan}, additional pets: ${additionalPets}`);

    // Validate input
    if (!email || !password || !fullName || !plan) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Price IDs from Supabase secrets
    console.log(`⏱️ [${corrId || 'no-id'}] Retrieving Stripe price IDs...`);
    const monthlyPriceId = Deno.env.get('STRIPE_PRICE_MONTHLY');
    const yearlyPriceId = Deno.env.get('STRIPE_PRICE_YEARLY');
    const additionalPetsPriceId = Deno.env.get('STRIPE_PRICE_ADDITIONAL_PETS');

    if (!monthlyPriceId || !yearlyPriceId || !additionalPetsPriceId) {
      throw new Error('Missing Stripe price IDs. Please run setup-stripe-products function first.');
    }

    console.log(`📋 [${corrId || 'no-id'}] Using price IDs - Monthly: ${monthlyPriceId}, Yearly: ${yearlyPriceId}, Additional Pets: ${additionalPetsPriceId}`);

    // Calculate pricing and determine line items
    const basePriceId = plan === "monthly" ? monthlyPriceId : yearlyPriceId;
    const lineItems: any[] = [
      {
        price: basePriceId,
        quantity: 1,
      }
    ];

    // Add additional pets if any
    if (additionalPets > 0) {
      lineItems.push({
        price: additionalPetsPriceId,
        quantity: additionalPets,
      });
    }

    console.log(`💰 [${corrId || 'no-id'}] Line items configured:`, lineItems);

    // Create Stripe customer
    console.log(`👤 [${corrId || 'no-id'}] Creating Stripe customer for ${email}...`);
    const customerStartTime = Date.now();
    
    const customer = await stripe.customers.create({
      email: email,
      name: fullName,
      metadata: {
        plan: plan,
        additional_pets: additionalPets.toString(),
        trial_end: trialEndDate.toISOString(),
        created_via: 'petport_signup',
        correlation_id: corrId || 'no-id',
      },
    });

    console.log(`✅ [${corrId || 'no-id'}] Stripe customer created: ${customer.id} (${Date.now() - customerStartTime}ms)`);

    // Attach payment method to customer if provided
    if (paymentMethodId) {
      console.log(`💳 [${corrId || 'no-id'}] Attaching payment method ${paymentMethodId} to customer ${customer.id}...`);
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        });
        
        // Set as default payment method
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        console.log(`✅ [${corrId || 'no-id'}] Payment method attached and set as default`);
      } catch (pmError) {
        console.error(`❌ [${corrId || 'no-id'}] Failed to attach payment method:`, pmError);
        // Continue without failing - trial doesn't require payment method
      }
    }

    // Create Stripe subscription with trial
    console.log(`💳 [${corrId || 'no-id'}] Creating Stripe subscription for customer ${customer.id}...`);
    const subscriptionStartTime = Date.now();
    
    const subscriptionParams: any = {
      customer: customer.id,
      items: lineItems,
      trial_end: Math.floor(trialEndDate.getTime() / 1000),
      metadata: {
        plan: plan,
        additional_pets: additionalPets.toString(),
        pets_included: (1 + additionalPets).toString(),
        created_via: 'petport_signup',
        correlation_id: corrId || 'no-id',
      },
    };

    // Set default payment method if attached
    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    console.log(`✅ [${corrId || 'no-id'}] Stripe subscription created: ${subscription.id} (${Date.now() - subscriptionStartTime}ms)`);

    // Create Supabase user
    console.log(`👤 [${corrId || 'no-id'}] Creating Supabase user for ${email}...`);
    const userStartTime = Date.now();
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error(`❌ [${corrId || 'no-id'}] Failed to create Supabase user:`, authError);
      
      // Clean up Stripe resources
      try {
        console.log(`🧹 [${corrId || 'no-id'}] Cleaning up Stripe resources...`);
        await stripe.subscriptions.cancel(subscription.id);
        await stripe.customers.del(customer.id);
        console.log(`✅ [${corrId || 'no-id'}] Cleaned up Stripe resources due to user creation failure`);
      } catch (cleanupError) {
        console.error(`❌ [${corrId || 'no-id'}] Failed to cleanup Stripe resources:`, cleanupError);
      }
      
      if (authError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ 
            error: 'Email already registered',
            code: 'EMAIL_EXISTS'
          }),
          { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw authError;
    }

    const user = authData.user;
    console.log(`✅ [${corrId || 'no-id'}] Supabase user created: ${user.id} (${Date.now() - userStartTime}ms)`);

    // Create subscriber record
    console.log(`📊 [${corrId || 'no-id'}] Creating subscriber record for user ${user.id}...`);
    const subscriberStartTime = Date.now();
    
    const { data: subscriberData, error: subscriberError } = await supabase
      .from('subscribers')
      .insert({
        user_id: user.id,
        email: email,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        plan: plan,
        status: 'trialing' as any,
        subscribed: true,
        pet_limit: 1,
        additional_pets: additionalPets,
        trial_end: trialEndDate.toISOString(),
      })
      .select()
      .single();

    if (subscriberError) {
      console.error(`❌ [${corrId || 'no-id'}] Failed to create subscriber record:`, subscriberError);
      throw subscriberError;
    }

    console.log(`✅ [${corrId || 'no-id'}] Subscriber record created (${Date.now() - subscriberStartTime}ms):`, subscriberData);

    // Send welcome email asynchronously using the proper Postmark template
    console.log(`📧 [${corrId || 'no-id'}] Sending welcome email to ${email}...`);
    supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        recipientEmail: email,
        recipientName: fullName,
        petName: 'Your Pet',
        shareUrl: 'https://petport.app/app',
        customMessage: `Your ${plan} plan with ${1 + additionalPets} pet slot${1 + additionalPets > 1 ? 's' : ''} is now active. Your 7-day free trial runs until ${trialEndDate.toLocaleDateString()}. During your trial, you have full access to all PetPort features!`
      }
    }).then(result => {
      if (result.error) {
        console.error(`❌ [${corrId || 'no-id'}] Welcome email failed:`, result.error);
      } else {
        console.log(`✅ [${corrId || 'no-id'}] Welcome email sent successfully`);
      }
    }).catch(error => {
      console.error(`❌ [${corrId || 'no-id'}] Welcome email error:`, error);
    });

    // Return success response
    const totalTime = Date.now() - startTime;
    console.log(`🎉 [${corrId || 'no-id'}] Provisioning completed successfully in ${totalTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        userId: user.id,
        customerId: customer.id,
        subscriptionId: subscription.id,
        trialEnd: trialEndDate.toISOString(),
        processingTime: totalTime,
        correlationId: corrId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error(`❌ [no-id] Error in create-subscription-with-user function:`, error);
    
    // Parse Stripe errors for better user feedback
    let statusCode = 500;
    let errorMessage = error.message;
    let errorCode = 'PROVISIONING_FAILED';

    if (error.type === 'StripeCardError') {
      statusCode = 402;
      errorCode = 'PAYMENT_FAILED';
    } else if (error.type === 'StripeRateLimitError') {
      statusCode = 429;
      errorCode = 'RATE_LIMITED';
    } else if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorCode = 'INVALID_REQUEST';
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
         correlationId: 'no-id',
        statusCode
      }),
      {
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);