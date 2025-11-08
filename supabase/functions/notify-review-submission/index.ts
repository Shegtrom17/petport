import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyReviewRequest {
  petId: string;
  reviewerName: string;
  rating: number;
  reviewText?: string;
  reviewType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petId, reviewerName, rating, reviewText, reviewType }: NotifyReviewRequest = await req.json();

    console.log('Processing review notification:', { petId, reviewerName, rating });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pet details and owner email
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('name, user_id, profiles(email, full_name)')
      .eq('id', petId)
      .single();

    if (petError || !pet) {
      console.error('Error fetching pet:', petError);
      throw new Error('Pet not found');
    }

    const ownerEmail = pet.profiles?.email;
    const ownerName = pet.profiles?.full_name || 'Pet Owner';
    const petName = pet.name;

    if (!ownerEmail) {
      console.error('No owner email found for pet:', petId);
      throw new Error('Owner email not found');
    }

    // Send email using Postmark
    const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');
    if (!postmarkApiKey) {
      throw new Error('Postmark API key not configured');
    }

    const stars = '⭐'.repeat(rating);
    const emailBody = {
      From: 'notifications@petport.app',
      To: ownerEmail,
      Subject: `New ${rating}-Star Review for ${petName}! 🎉`,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5282;">New Review Submitted!</h2>
          <p>Hi ${ownerName},</p>
          <p>Great news! <strong>${reviewerName}</strong> just left a review for <strong>${petName}</strong>.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="margin-bottom: 10px;">
              <strong>Rating:</strong> ${stars} (${rating}/5)
            </div>
            ${reviewType ? `<div style="margin-bottom: 10px;"><strong>Type:</strong> ${reviewType}</div>` : ''}
            ${reviewText ? `
              <div style="margin-top: 15px;">
                <strong>Review:</strong>
                <p style="font-style: italic; color: #4a5568; margin-top: 5px;">"${reviewText}"</p>
              </div>
            ` : ''}
            <div style="margin-top: 10px;">
              <strong>Reviewer:</strong> ${reviewerName}
            </div>
          </div>

          <p>
            <a href="https://petport.app/reviews/${petId}" 
               style="display: inline-block; background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View All Reviews
            </a>
          </p>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            Keep up the great work! Reviews help build trust with potential pet sitters, walkers, and adopters.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #a0aec0; font-size: 12px;">
            This is an automated notification from PetPort. 
            <a href="https://petport.app/profile" style="color: #4299e1;">Manage your notification settings</a>
          </p>
        </div>
      `,
      MessageStream: 'outbound',
    };

    const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkApiKey,
      },
      body: JSON.stringify(emailBody),
    });

    if (!postmarkResponse.ok) {
      const errorText = await postmarkResponse.text();
      console.error('Postmark error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await postmarkResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.MessageId }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in notify-review-submission:', error);
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
