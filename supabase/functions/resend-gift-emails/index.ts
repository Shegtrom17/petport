import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendEmailsRequest {
  giftCode: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { giftCode }: ResendEmailsRequest = await req.json();

    console.log("=== RESEND GIFT EMAILS ===");
    console.log("Gift Code:", giftCode);

    if (!giftCode) {
      return new Response(
        JSON.stringify({ error: "Gift code is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch gift membership details
    const { data: gift, error: giftError } = await supabaseClient
      .from('gift_memberships')
      .select('*')
      .eq('gift_code', giftCode.toUpperCase())
      .single();

    if (giftError || !gift) {
      console.error("Gift not found:", giftError);
      return new Response(
        JSON.stringify({ error: "Gift membership not found with this code" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Found gift:", {
      code: gift.gift_code,
      purchaser: gift.purchaser_email,
      recipient: gift.recipient_email,
      status: gift.status
    });

    const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";
    const redemptionLink = `${baseUrl}/claim-subscription?code=${gift.gift_code}`;
    const formattedExpiry = new Date(gift.expires_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Send purchase confirmation to purchaser
    console.log("Sending purchase confirmation to:", gift.purchaser_email);
    const { error: purchaserEmailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        type: 'gift_purchase_confirmation',
        recipientEmail: gift.purchaser_email,
        recipientName: gift.sender_name || 'Friend',
        giftRecipientEmail: gift.recipient_email,
        petName: 'Gift Membership',
        petId: gift.gift_code,
        shareUrl: redemptionLink,
        senderName: gift.sender_name || 'A PetPort supporter',
        giftMessage: gift.gift_message || '',
        giftCode: gift.gift_code,
        redemptionLink: redemptionLink,
        expiresAt: formattedExpiry
      }
    });

    if (purchaserEmailError) {
      console.error("Error sending purchaser email:", purchaserEmailError);
    } else {
      console.log("✅ Purchaser email sent");
    }

    // Send gift notification to recipient
    console.log("Sending gift notification to:", gift.recipient_email);
    const { error: recipientEmailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        type: 'gift_notification',
        recipientEmail: gift.recipient_email,
        recipientName: gift.recipient_email.split('@')[0],
        petName: 'Gift Membership',
        petId: gift.gift_code,
        shareUrl: redemptionLink,
        senderName: gift.sender_name || 'Someone special',
        giftMessage: gift.gift_message || '',
        giftCode: gift.gift_code,
        redemptionLink: redemptionLink,
        expiresAt: formattedExpiry
      }
    });

    if (recipientEmailError) {
      console.error("Error sending recipient email:", recipientEmailError);
    } else {
      console.log("✅ Recipient email sent");
    }

    const response = {
      success: true,
      giftCode: gift.gift_code,
      purchaserEmail: gift.purchaser_email,
      recipientEmail: gift.recipient_email,
      redemptionLink: redemptionLink,
      emailsSent: {
        purchaser: !purchaserEmailError,
        recipient: !recipientEmailError
      },
      errors: {
        purchaser: purchaserEmailError?.message,
        recipient: recipientEmailError?.message
      }
    };

    console.log("=== RESEND COMPLETE ===");
    console.log("Results:", response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in resend-gift-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
