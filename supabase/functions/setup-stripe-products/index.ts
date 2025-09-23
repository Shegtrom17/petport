import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductSetupRequest {
  setupToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { setupToken }: ProductSetupRequest = await req.json();

    // Verify setup token for security
    const expectedToken = Deno.env.get('SETUP_TOKEN');
    if (!expectedToken || setupToken !== expectedToken) {
      console.error('Invalid or missing setup token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Stripe client
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Starting Stripe products setup...');

    // Initialize Supabase client for storing secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Create Monthly Plan Product ($1.99/month, includes 1 pet)
    console.log('Creating PetPort Monthly Plan product...');
    const monthlyProduct = await stripe.products.create({
      name: 'PetPort Monthly Plan',
      description: 'Monthly subscription plan including 1 pet account',
      metadata: {
        pets_included: '1',
        plan_type: 'monthly'
      }
    });

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 199, // $1.99
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        pets_included: '1'
      }
    });

    console.log(`Monthly Plan created: ${monthlyProduct.id}, Price: ${monthlyPrice.id}`);

    // 2. Create Yearly Plan Product ($12.99/year, includes 1 pet)
    console.log('Creating PetPort Yearly Plan product...');
    const yearlyProduct = await stripe.products.create({
      name: 'PetPort Yearly Plan',
      description: 'Yearly subscription plan including 1 pet account',
      metadata: {
        pets_included: '1',
        plan_type: 'yearly'
      }
    });

    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 1299, // $12.99
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        pets_included: '1'
      }
    });

    console.log(`Yearly Plan created: ${yearlyProduct.id}, Price: ${yearlyPrice.id}`);

    // 3. Create Additional Pet Product ($3.99/year each)
    console.log('Creating Additional Pet Account product...');
    const additionalPetProduct = await stripe.products.create({
      name: 'Additional Pet Account',
      description: 'Additional pet account slot - $3.99/year per pet',
      metadata: {
        addon_type: 'additional_pet',
        per_unit_cost: '399'
      }
    });

    const additionalPetPrice = await stripe.prices.create({
      product: additionalPetProduct.id,
      unit_amount: 399, // $3.99
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        addon_type: 'additional_pet'
      }
    });

    console.log(`Additional Pet Account created: ${additionalPetProduct.id}, Price: ${additionalPetPrice.id}`);

    // Store Price IDs as Supabase secrets
    console.log('Storing price IDs as Supabase secrets...');
    
    const secrets = [
      { name: 'STRIPE_PRICE_MONTHLY', value: monthlyPrice.id },
      { name: 'STRIPE_PRICE_YEARLY', value: yearlyPrice.id },
      { name: 'STRIPE_PRICE_ADDITIONAL_PETS', value: additionalPetPrice.id }
    ];

    for (const secret of secrets) {
      const { error } = await supabase.functions.invoke('_internal/vault', {
        body: {
          action: 'upsert',
          name: secret.name,
          value: secret.value
        }
      });

      if (error) {
        console.error(`Failed to store secret ${secret.name}:`, error);
        throw new Error(`Failed to store secret ${secret.name}`);
      }
      
      console.log(`✅ Stored secret: ${secret.name} = ${secret.value}`);
    }

    const response = {
      success: true,
      message: 'Stripe products and prices created successfully',
      products: {
        monthly: {
          productId: monthlyProduct.id,
          priceId: monthlyPrice.id,
          amount: 199,
          interval: 'month'
        },
        yearly: {
          productId: yearlyProduct.id,
          priceId: yearlyPrice.id,
          amount: 1299,
          interval: 'year'
        },
        additionalPets: {
          productId: additionalPetProduct.id,
          priceId: additionalPetPrice.id,
          amount: 399,
          interval: 'year'
        }
      }
    };

    console.log('Stripe products setup completed successfully:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in setup-stripe-products function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to setup Stripe products'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);