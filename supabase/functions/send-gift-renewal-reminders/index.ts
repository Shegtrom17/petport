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

    console.log('Starting gift renewal reminder check...');

    const now = new Date();
    
    // Calculate target dates for reminders
    const in60Days = new Date(now);
    in60Days.setDate(in60Days.getDate() + 60);
    
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    let totalSent = 0;

    // 60-day reminders
    const { data: gifts60, error: error60 } = await supabase
      .from('gift_memberships')
      .select('*')
      .eq('status', 'active')
      .is('reminder_60_sent_at', null)
      .gte('expires_at', in60Days.toISOString().split('T')[0])
      .lte('expires_at', new Date(in60Days.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!error60 && gifts60 && gifts60.length > 0) {
      console.log(`Found ${gifts60.length} gifts expiring in ~60 days`);
      
      for (const gift of gifts60) {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: gift.recipient_email,
            type: 'gift_renewal_reminder',
            data: {
              recipientName: gift.recipient_email.split('@')[0],
              daysUntilExpiration: '60',
              expiresAt: gift.expires_at,
              giftCode: gift.gift_code
            }
          }
        });

        if (!emailError) {
          await supabase
            .from('gift_memberships')
            .update({ reminder_60_sent_at: now.toISOString() })
            .eq('id', gift.id);
          
          totalSent++;
          console.log(`Sent 60-day reminder for gift ${gift.gift_code}`);
        }
      }
    }

    // 30-day reminders
    const { data: gifts30, error: error30 } = await supabase
      .from('gift_memberships')
      .select('*')
      .eq('status', 'active')
      .is('reminder_30_sent_at', null)
      .gte('expires_at', in30Days.toISOString().split('T')[0])
      .lte('expires_at', new Date(in30Days.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!error30 && gifts30 && gifts30.length > 0) {
      console.log(`Found ${gifts30.length} gifts expiring in ~30 days`);
      
      for (const gift of gifts30) {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: gift.recipient_email,
            type: 'gift_renewal_reminder',
            data: {
              recipientName: gift.recipient_email.split('@')[0],
              daysUntilExpiration: '30',
              expiresAt: gift.expires_at,
              giftCode: gift.gift_code
            }
          }
        });

        if (!emailError) {
          await supabase
            .from('gift_memberships')
            .update({ reminder_30_sent_at: now.toISOString() })
            .eq('id', gift.id);
          
          totalSent++;
          console.log(`Sent 30-day reminder for gift ${gift.gift_code}`);
        }
      }
    }

    // 7-day reminders
    const { data: gifts7, error: error7 } = await supabase
      .from('gift_memberships')
      .select('*')
      .eq('status', 'active')
      .is('reminder_7_sent_at', null)
      .gte('expires_at', in7Days.toISOString().split('T')[0])
      .lte('expires_at', new Date(in7Days.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!error7 && gifts7 && gifts7.length > 0) {
      console.log(`Found ${gifts7.length} gifts expiring in ~7 days`);
      
      for (const gift of gifts7) {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: gift.recipient_email,
            type: 'gift_renewal_reminder',
            data: {
              recipientName: gift.recipient_email.split('@')[0],
              daysUntilExpiration: '7',
              expiresAt: gift.expires_at,
              giftCode: gift.gift_code
            }
          }
        });

        if (!emailError) {
          await supabase
            .from('gift_memberships')
            .update({ reminder_7_sent_at: now.toISOString() })
            .eq('id', gift.id);
          
          totalSent++;
          console.log(`Sent 7-day reminder for gift ${gift.gift_code}`);
        }
      }
    }

    // Check for expired gifts and send expiration emails
    const { data: expiredGifts, error: expiredError } = await supabase
      .from('gift_memberships')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', now.toISOString());

    if (!expiredError && expiredGifts && expiredGifts.length > 0) {
      console.log(`Found ${expiredGifts.length} expired gifts`);
      
      for (const gift of expiredGifts) {
        // Send expiration email
        await supabase.functions.invoke('send-email', {
          body: {
            to: gift.recipient_email,
            type: 'gift_expired',
            data: {
              recipientName: gift.recipient_email.split('@')[0],
              expiredAt: gift.expires_at
            }
          }
        });

        // Update gift status to expired
        await supabase
          .from('gift_memberships')
          .update({ status: 'expired' })
          .eq('id', gift.id);

        // Update subscriber status
        if (gift.recipient_user_id) {
          await supabase
            .from('subscribers')
            .update({ status: 'suspended', subscribed: false })
            .eq('user_id', gift.recipient_user_id);
        }

        console.log(`Expired gift ${gift.gift_code}`);
      }
    }

    console.log(`Gift renewal reminder check complete. Sent ${totalSent} reminders.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        remindersSent: totalSent,
        giftsExpired: expiredGifts?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-gift-renewal-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
