import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledGift {
  id: string;
  gift_code: string;
  recipient_email: string;
  purchaser_email: string;
  sender_name: string | null;
  gift_message: string | null;
  scheduled_send_date: string;
  amount_paid: number;
  additional_pets: number;
  theme: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Starting scheduled gifts send process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Checking for gifts scheduled for: ${today}`);

    // Fetch all scheduled gifts for today
    const { data: scheduledGifts, error: fetchError } = await supabase
      .from('scheduled_gifts')
      .select('*')
      .eq('status', 'scheduled')
      .eq('scheduled_send_date', today);

    if (fetchError) {
      console.error('Error fetching scheduled gifts:', fetchError);
      throw fetchError;
    }

    if (!scheduledGifts || scheduledGifts.length === 0) {
      console.log('✅ No gifts scheduled for today');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No gifts scheduled for today',
          sent: 0 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📬 Found ${scheduledGifts.length} gift(s) to send today`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as { giftId: string; error: string }[]
    };

    // Process each scheduled gift
    for (const gift of scheduledGifts as ScheduledGift[]) {
      try {
        console.log(`Sending gift ${gift.gift_code} to ${gift.recipient_email}...`);

        // Calculate expiry date (1 year from today)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Create the gift membership record
        const { error: insertError } = await supabase
          .from('gift_memberships')
          .insert({
            gift_code: gift.gift_code,
            recipient_email: gift.recipient_email,
            purchaser_email: gift.purchaser_email,
            sender_name: gift.sender_name,
            gift_message: gift.gift_message,
            amount_paid: gift.amount_paid,
            additional_pets: gift.additional_pets,
            expires_at: expiryDate.toISOString(),
            purchased_at: new Date().toISOString(),
            status: 'pending',
            theme: gift.theme || 'default'
          });

        if (insertError) {
          throw new Error(`Failed to create gift membership: ${insertError.message}`);
        }

        // Send emails via send-email function
        const redemptionLink = `https://petport.app/claim-subscription?code=${gift.gift_code}`;
        
        // Format the expiry date
        const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send gift notification to recipient with theme
        const { error: recipientEmailError } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'gift_notification',
            recipientEmail: gift.recipient_email,
            recipientName: gift.recipient_email.split('@')[0],
            petName: 'Gift Membership',
            petId: gift.gift_code,
            shareUrl: redemptionLink,
            senderName: gift.sender_name || 'A friend',
            giftMessage: gift.gift_message || undefined,
            giftCode: gift.gift_code,
            redemptionLink: redemptionLink,
            expiresAt: formattedExpiry,
            giftTheme: gift.theme || 'standard'
          }
        });

        if (recipientEmailError) {
          console.error('Failed to send recipient email:', recipientEmailError);
          throw new Error(`Failed to send recipient email: ${recipientEmailError.message}`);
        }

        // Send confirmation to purchaser with theme
        const { error: purchaserEmailError } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'gift_purchase_confirmation',
            recipientEmail: gift.purchaser_email,
            recipientName: gift.sender_name || 'there',
            petName: 'Gift Membership',
            petId: gift.gift_code,
            shareUrl: redemptionLink,
            senderName: gift.sender_name || 'A friend',
            giftMessage: gift.gift_message || undefined,
            giftCode: gift.gift_code,
            redemptionLink: redemptionLink,
            expiresAt: formattedExpiry,
            giftRecipientEmail: gift.recipient_email,
            giftTheme: gift.theme || 'standard'
          }
        });

        if (purchaserEmailError) {
          console.error('Failed to send purchaser email:', purchaserEmailError);
          // Don't throw - purchaser email is not critical
        }

        // Update scheduled gift status to sent
        const { error: updateError } = await supabase
          .from('scheduled_gifts')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', gift.id);

        if (updateError) {
          console.error('Failed to update scheduled gift status:', updateError);
          // Don't throw - gift was sent successfully
        }

        console.log(`✅ Successfully sent gift ${gift.gift_code}`);
        results.sent++;

      } catch (error: any) {
        console.error(`❌ Failed to send gift ${gift.id}:`, error.message);
        
        // Update scheduled gift status to failed
        await supabase
          .from('scheduled_gifts')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', gift.id);

        results.failed++;
        results.errors.push({
          giftId: gift.id,
          error: error.message
        });
      }
    }

    console.log(`🎁 Scheduled gifts processing complete:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${scheduledGifts.length} scheduled gifts`,
        ...results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-scheduled-gifts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);