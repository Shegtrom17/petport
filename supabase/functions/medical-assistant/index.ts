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
    const { question, petData } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build pet context
    const petContext = petData ? `
Pet Species: ${petData.species || 'Unknown'}
Breed: ${petData.breed || 'Unknown'}
Age: ${petData.age || 'Unknown'}
Weight: ${petData.weight || 'Unknown'}
` : '';

    const systemPrompt = `You are a veterinary health information assistant. Provide general educational information about pet health, vaccinations, common conditions, and preventive care.

CRITICAL DISCLAIMERS (always include):
- You are NOT a veterinarian and cannot diagnose or prescribe
- For any medical concerns, emergency symptoms, or specific health issues, users MUST consult a licensed veterinarian
- Your information is educational only and not a substitute for professional veterinary care

Provide:
- General health education
- Common vaccination schedules (general guidelines)
- Preventive care tips
- When to see a vet (red flags)
- General medication tracking tips

Keep responses:
- Clear and organized
- 2-4 paragraphs
- Always emphasize consulting a vet for medical decisions`;

    const userPrompt = `${question}

${petContext ? `Pet Information:\n${petContext}` : ''}

Please provide general health information and guidance. Remember to include appropriate disclaimers.`;

    console.log('[MEDICAL-ASSISTANT] Processing health question');

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
      console.error('[MEDICAL-ASSISTANT] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error('No answer generated');
    }

    console.log('[MEDICAL-ASSISTANT] Successfully generated health information');

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[MEDICAL-ASSISTANT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
