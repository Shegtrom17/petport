import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting signup process...');
    
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    console.log('✅ Stripe initialized');

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { email, password, fullName, plan, additionalPets = 0 } = await req.json();
    console.log('📝 Parsed request:', { email, fullName, plan, additionalPets });

    // Validate input
    if (!email || !password || !fullName || !plan) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    console.log('🔍 Checking for existing user...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    console.log('👤 User exists check:', !!existingUser);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate pricing
    const planPrices = {
      monthly: 199, // $1.99 in cents
      yearly: 1299  // $12.99 in cents
    };
    const addonPricePerPet = additionalPets >= 5 ? 260 : 399; // Volume pricing
    const totalAmount = planPrices[plan as keyof typeof planPrices] + (additionalPets * addonPricePerPet);

    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const trialEndFormatted = trialEndDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Step 1: Create Stripe customer
    console.log('💳 Creating Stripe customer...');
    const customer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        plan,
        additionalPets: additionalPets.toString(),
        trial_end_date: trialEndFormatted,
        cancellation_terms: 'Cancel anytime before trial ends to avoid being charged',
        billing_amount: `$${(totalAmount / 100).toFixed(2)}/${plan}`,
      },
    });

    console.log('Created Stripe customer:', customer.id);

    // Step 2: Create payment method (this would normally be done with Stripe Elements on frontend)
    // For now, we'll create the subscription in trial mode and let the frontend handle card setup

    // Step 3: Create Stripe subscription with trial
    console.log('📅 Creating Stripe subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PetPort ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `7-day free trial ends ${trialEndFormatted}. Includes 1 pet account${additionalPets > 0 ? ` + ${additionalPets} additional pets` : ''}. Cancel before trial ends to avoid $${(totalAmount / 100).toFixed(2)}/${plan} charge.`,
            },
            unit_amount: totalAmount,
            recurring: {
              interval: plan === 'monthly' ? 'month' : 'year',
            },
          },
        },
      ],
      trial_period_days: 7,
      metadata: {
        plan,
        additionalPets: additionalPets.toString(),
        trial_end_date: trialEndFormatted,
        transparency_confirmed: 'User informed of trial terms and billing amount',
      },
    });

    console.log('Created Stripe subscription:', subscription.id);

    // Step 4: Create Supabase user
    console.log('👤 Creating Supabase user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
      },
      email_confirm: true, // Auto-confirm email for trial users
    });

    if (authError || !authData.user) {
      // Cleanup: cancel the subscription if user creation fails
      await stripe.subscriptions.cancel(subscription.id);
      await stripe.customers.del(customer.id);
      
      throw new Error(`Failed to create user: ${authError?.message}`);
    }

    console.log('Created Supabase user:', authData.user.id);

    // Step 5: Create subscriber record
    console.log('📝 Creating subscriber record...');
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .insert({
        user_id: authData.user.id,
        email: email,
        stripe_customer_id: customer.id,
        status: 'active',
        pet_limit: 1,
        additional_pets: additionalPets,
        subscribed: true,
        subscription_tier: plan,
      });

    if (subscriberError) {
      console.error('❌ Failed to create subscriber record:', subscriberError);
      // Continue anyway - this can be fixed later
    } else {
      console.log('✅ Subscriber record created');
    }

    // Step 5.5: Send welcome email with trial details
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome_trial',
          recipientEmail: email,
          recipientName: fullName,
          petName: 'your pets', // Generic since no specific pet yet
          petId: 'welcome',
          shareUrl: 'https://petport.app/app',
          trialEndDate: trialEndFormatted,
          billingAmount: `$${(totalAmount / 100).toFixed(2)}/${plan}`,
          customMessage: `Welcome to PetPort! Your 7-day free trial is now active.`
        }
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue - email failure shouldn't break signup
    }

    console.log('🎉 Signup completed successfully - preparing response...');

    // Step 6: Edge function is purely backend provisioning
    // Frontend will handle authentication separately via signInWithPassword
    const responseData = {
      success: true,
      userId: authData.user.id,
      customerId: customer.id,
      subscriptionId: subscription.id,
      email: email, // Include email for frontend sign-in
      sessionTokenPresent: false, // Explicit flag - no tokens generated
      refreshTokenPresent: false, // Explicit flag - no tokens generated
    };
    
    console.log('📤 Sending response (backend provisioning complete):', {
      success: responseData.success,
      userId: responseData.userId,
      customerId: responseData.customerId,
      subscriptionId: responseData.subscriptionId,
      email: '[HIDDEN]',
      sessionTokenPresent: responseData.sessionTokenPresent,
      refreshTokenPresent: responseData.refreshTokenPresent
    });

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Signup error:', error);
    
    // Ensure we return proper error status codes
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    const errorMessage = error.message || 'An unexpected error occurred during signup';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});