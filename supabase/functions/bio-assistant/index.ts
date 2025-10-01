import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, petData, customPrompt } = await req.json();

    if (!task) {
      throw new Error('Task type is required (bio, experience, achievement)');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from pet data
    const petContext = petData ? `
Pet Name: ${petData.name || 'Unknown'}
Species: ${petData.species || 'Unknown'}
Breed: ${petData.breed || 'Unknown'}
Age: ${petData.age || 'Unknown'}
` : '';

    let systemPrompt = '';
    let userPrompt = '';

    switch (task) {
      case 'bio':
        systemPrompt = `You are a professional pet profile writer. Create engaging, warm, and authentic pet bios that highlight personality, traits, and unique qualities. Keep it concise (2-3 paragraphs max) and heartfelt.`;
        userPrompt = customPrompt || `Write a compelling bio for this pet:
${petContext}

Create a warm, engaging bio that captures their personality and makes them memorable. Focus on their unique traits and what makes them special.`;
        break;

      case 'experience':
        systemPrompt = `You are a pet resume expert. Help describe pet experiences and activities in professional yet warm language. Focus on skills developed, impact, and memorable moments.`;
        userPrompt = customPrompt || `Suggest 3-5 experience descriptions for this pet's resume:
${petContext}

Provide professional but warm descriptions of typical pet activities, training, or work experiences. Make each 1-2 sentences.`;
        break;

      case 'achievement':
        systemPrompt = `You are a pet achievement writer. Help articulate notable accomplishments, milestones, and special moments in an impressive yet authentic way.`;
        userPrompt = customPrompt || `Suggest 3-5 notable achievements for this pet:
${petContext}

Focus on realistic accomplishments like training milestones, behavioral improvements, certifications, or special moments. Keep each to 1 sentence.`;
        break;

      case 'polish':
        systemPrompt = `You are a professional editor specializing in pet profiles. Improve clarity, tone, and impact while maintaining authenticity and warmth.`;
        userPrompt = customPrompt || `Please improve and polish this text for a pet profile, making it more engaging and professional while keeping it authentic.`;
        break;

      default:
        throw new Error('Invalid task type');
    }

    console.log('[BIO-ASSISTANT] Processing task:', task);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('[BIO-ASSISTANT] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error('No result generated');
    }

    console.log('[BIO-ASSISTANT] Successfully generated content');

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BIO-ASSISTANT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
