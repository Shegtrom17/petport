import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { giftCode, userId } = await req.json();

    if (!giftCode || !userId) {
      return new Response(
        JSON.stringify({ error: 'Gift code and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Claiming gift with code:', giftCode, 'for user:', userId);

    // Find the gift membership
    const { data: gift, error: giftError } = await supabase
      .from('gift_memberships')
      .select('*')
      .eq('gift_code', giftCode)
      .single();

    if (giftError || !gift) {
      console.error('Gift not found:', giftError);
      return new Response(
        JSON.stringify({ error: 'Invalid gift code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify gift status
    if (gift.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Gift already ${gift.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from activation

    // Update gift membership with recipient info
    const { error: updateGiftError } = await supabase
      .from('gift_memberships')
      .update({
        recipient_user_id: userId,
        recipient_email: user.email,
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
        updated_at: now.toISOString()
      })
      .eq('id', gift.id);

    if (updateGiftError) {
      console.error('Failed to update gift:', updateGiftError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate gift' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gift activated successfully');

    // Create or update subscriber record with additional pets capacity
    const totalPetCapacity = 1 + (gift.additional_pets || 0);
    
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: user.email,
        status: 'active',
        subscribed: true,
        pet_limit: 1,
        additional_pets: gift.additional_pets || 0,
        additional_pets_purchased: gift.additional_pets || 0,
        stripe_customer_id: null,
        stripe_subscription_id: gift.stripe_subscription_id,
        plan_interval: 'yearly',
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscriberError) {
      console.error('Failed to create subscriber:', subscriberError);
      // Don't fail the entire operation if subscriber creation fails
    }

    console.log(`Subscriber record created/updated with ${totalPetCapacity} pet capacity`);

    // Send gift activated email with theme
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'gift_activated',
        recipientEmail: user.email,
        recipientName: user.user_metadata?.full_name || user.email?.split('@')[0],
        petName: 'Gift Membership',
        petId: gift.gift_code,
        shareUrl: `${Deno.env.get('APP_ORIGIN') || 'https://petport.app'}/add-pet`,
        senderName: gift.sender_name || 'A friend',
        expiresAt: expiresAt.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        giftTheme: gift.theme || 'standard'
      }
    });

    if (emailError) {
      console.error('Failed to send activation email:', emailError);
      // Don't fail the operation if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        expiresAt: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in claim-gift-membership:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
