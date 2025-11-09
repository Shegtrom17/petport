import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseGiftRequest {
  recipientEmail: string;
  senderName?: string;
  giftMessage?: string;
  purchaserEmail?: string;
  scheduledSendDate?: string; // Optional: YYYY-MM-DD format for scheduled delivery
  additionalPets?: number; // Number of additional pets (0-19)
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, senderName, giftMessage, purchaserEmail, scheduledSendDate, additionalPets }: PurchaseGiftRequest = await req.json();

    const petCount = (additionalPets || 0) + 1; // 1 base + additional
    const basePriceCents = 1499; // $14.99
    const addonPriceCents = 399; // $3.99 per additional pet
    const totalPriceCents = basePriceCents + ((additionalPets || 0) * addonPriceCents);

    console.log("=== GIFT MEMBERSHIP PURCHASE ===");
    console.log("Recipient:", recipientEmail);
    console.log("Sender:", senderName || "Anonymous");
    console.log("Purchaser:", purchaserEmail || "Not logged in");
    console.log("Scheduled for:", scheduledSendDate || "Send immediately");
    console.log("Total pet accounts:", petCount);
    console.log("Total price:", `$${(totalPriceCents / 100).toFixed(2)}`);
    console.log("================================");

    // Validate recipient email
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid recipient email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const baseUrl = Deno.env.get("APP_ORIGIN") || "https://petport.app";

    // Build line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "PetPort Gift Membership - 12 Months",
            description: `Gift membership for ${recipientEmail} (${petCount} pet account${petCount > 1 ? 's' : ''})`,
            images: ["https://petport.app/lovable-uploads/og-social-preview.png"],
          },
          unit_amount: basePriceCents,
        },
        quantity: 1,
      },
    ];

    // Add additional pets as separate line item if > 0
    if (additionalPets && additionalPets > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Additional Pet Accounts",
            description: `${additionalPets} additional pet account${additionalPets > 1 ? 's' : ''} for 12-month gift period`,
          },
          unit_amount: addonPriceCents,
        },
        quantity: additionalPets,
      });
    }

    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        type: "gift_membership",
        recipient_email: recipientEmail,
        sender_name: senderName || "",
        gift_message: giftMessage || "",
        purchaser_email: purchaserEmail || "",
        scheduled_send_date: scheduledSendDate || "", // Store scheduled date in metadata
        additional_pets: (additionalPets || 0).toString(), // Store as string for Stripe metadata
      },
      success_url: `${baseUrl}/gift-sent?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/gift`,
      customer_email: purchaserEmail || undefined,
    });

    console.log("Stripe checkout session created:", session.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating gift checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
