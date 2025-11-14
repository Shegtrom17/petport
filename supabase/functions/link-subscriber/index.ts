import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[LINK-SUBSCRIBER] Starting subscriber linking process');

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[LINK-SUBSCRIBER] No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('[LINK-SUBSCRIBER] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[LINK-SUBSCRIBER] User authenticated:', user.email);

    // Check if user already has linked subscription
    const { data: existingSubscriber, error: existingError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('[LINK-SUBSCRIBER] Error checking existing subscriber:', existingError);
      return new Response(
        JSON.stringify({ error: 'Database error checking subscription' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingSubscriber) {
      console.log('[LINK-SUBSCRIBER] User already has linked subscription:', existingSubscriber.status);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription already linked',
          subscription: existingSubscriber 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Look for orphaned subscription by email
    const { data: orphanedSubscription, error: orphanError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', user.email)
      .is('user_id', null)
      .maybeSingle();

    if (orphanError) {
      console.error('[LINK-SUBSCRIBER] Error checking orphaned subscription:', orphanError);
      return new Response(
        JSON.stringify({ error: 'Database error checking orphaned subscription' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (orphanedSubscription) {
      console.log('[LINK-SUBSCRIBER] Found orphaned subscription, linking to user:', user.id);
      
      // Link the orphaned subscription to the user
      const { data: linkedSubscription, error: linkError } = await supabase
        .from('subscribers')
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq('id', orphanedSubscription.id)
        .select()
        .single();

      if (linkError) {
        console.error('[LINK-SUBSCRIBER] Error linking subscription:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to link subscription' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('[LINK-SUBSCRIBER] Successfully linked subscription:', linkedSubscription.status);
      
      // Now link any referrals for this user (if they signed up via a referral link)
      if (linkedSubscription.plan_interval === 'year') {
        console.log('[LINK-SUBSCRIBER] Checking for referrals to link for yearly subscriber');
        
        try {
          // Find any referral visits for this email
          const { data: visitData } = await supabase
            .from('referral_visits')
            .select('referral_code')
            .eq('converted_user_id', null)
            .order('visited_at', { ascending: false })
            .limit(1);
          
          if (visitData && visitData.length > 0) {
            const referralCode = visitData[0].referral_code;
            console.log('[LINK-SUBSCRIBER] Found referral visit with code:', referralCode);
            
            // Find the referral record
            const { data: referralData } = await supabase
              .from('referrals')
              .select('id')
              .eq('referral_code', referralCode)
              .is('referred_user_id', null)
              .single();
            
            if (referralData) {
              // Get trial end from Stripe subscription or use now
              const trialEnd = new Date();
              trialEnd.setDate(trialEnd.getDate() + 7);
              
              // Update referrals table
              await supabase
                .from('referrals')
                .update({
                  referred_user_id: user.id,
                  trial_completed_at: trialEnd.toISOString(),
                  referred_plan_interval: 'year',
                  updated_at: new Date().toISOString()
                })
                .eq('id', referralData.id);
              
              // Update referral_visits to mark conversion
              await supabase
                .from('referral_visits')
                .update({
                  converted_user_id: user.id,
                  converted_at: new Date().toISOString(),
                  plan_type: 'yearly'
                })
                .eq('referral_code', referralCode)
                .is('converted_user_id', null)
                .order('visited_at', { ascending: false })
                .limit(1);
              
              console.log('[LINK-SUBSCRIBER] Referral linked successfully');
            }
          }
        } catch (refError) {
          console.error('[LINK-SUBSCRIBER] Error linking referral (non-fatal):', refError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription successfully linked',
          subscription: linkedSubscription 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // No existing or orphaned subscription found
    console.log('[LINK-SUBSCRIBER] No subscription found for user:', user.email);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No subscription found to link',
        subscription: null 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[LINK-SUBSCRIBER] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});