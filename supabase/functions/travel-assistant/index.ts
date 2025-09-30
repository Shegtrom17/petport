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
    const { location, petSpecies, query } = await req.json();

    if (!location) {
      throw new Error('Location is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context-aware prompt
    const petContext = petSpecies ? `for a ${petSpecies}` : 'for a pet';
    const userQuery = query || 'pet-friendly places, dog parks, groomers, pet stores, veterinary clinics, and pet-friendly accommodations';
    
    const systemPrompt = `You are a helpful pet travel assistant. Provide practical, useful suggestions for pet owners traveling with their pets. Focus on real types of places that commonly exist in most areas. Be concise and organized.`;

    const userPrompt = `I'm traveling to ${location} with my pet ${petContext}. Please suggest ${userQuery}.

Format your response as a well-organized list with:
- **Category headers** (e.g., Dog Parks, Pet-Friendly Hotels, Veterinary Services)
- Brief descriptions of what to look for
- Helpful tips for each category
- Any important local considerations

Keep it practical and actionable.`;

    console.log('[TRAVEL-ASSISTANT] Calling Lovable AI with location:', location);

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
      console.error('[TRAVEL-ASSISTANT] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.choices?.[0]?.message?.content;

    if (!suggestions) {
      throw new Error('No suggestions generated');
    }

    console.log('[TRAVEL-ASSISTANT] Successfully generated suggestions');

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[TRAVEL-ASSISTANT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
