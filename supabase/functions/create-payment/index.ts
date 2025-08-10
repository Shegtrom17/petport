import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('🔄 Create Payment function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ No authorization header provided");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      console.error("❌ User not authenticated or no email");
      return new Response(JSON.stringify({ error: "User authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log(`✅ User authenticated: ${user.email}`);

    // Parse request body
    const { product_type = 'pet_slot', quantity = 1 } = await req.json();
    console.log(`📦 Request: ${product_type} x ${quantity}`);

    // Calculate amount (199 cents = $1.99 per pet slot)
    const amount = 199 * quantity;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`📋 Existing customer: ${customerId}`);
    } else {
      console.log("➕ Creating new customer");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Extra Pet Slot${quantity > 1 ? 's' : ''}`,
              description: `Add ${quantity} extra pet${quantity > 1 ? 's' : ''} to your account`
            },
            unit_amount: 199, // $1.99 in cents
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/app?payment=success`,
      cancel_url: `${req.headers.get("origin")}/app?payment=cancelled`,
      metadata: {
        user_id: user.id,
        product_type: product_type,
        quantity: quantity.toString(),
      },
    });

    console.log(`🎫 Stripe session created: ${session.id}`);

    // Create order record in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: amount,
        currency: "usd",
        status: "pending",
        product_type: product_type,
        quantity: quantity,
      });

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      // Continue anyway - we can track this via Stripe
    } else {
      console.log("✅ Order created in database");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});