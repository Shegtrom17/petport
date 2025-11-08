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
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('[SEARCH-HELP] Processing query:', query);

    // Knowledge base content
    const knowledgeBase = {
      faqs: [
        {
          id: "getting-started",
          category: "General",
          question: "How do I get started with PetPort?",
          answer: "Welcome to PetPort! Start by creating your first pet profile using the 'Add Pet' button. You can add photos, basic information, medical records, and care instructions. Each pet gets a unique QR code for easy sharing.",
          keywords: ["start", "begin", "first time", "new user", "setup"]
        },
        {
          id: "qr-codes",
          category: "Features",
          question: "How do QR codes work?",
          answer: "Each pet profile generates a unique QR code that links to their public profile. Anyone can scan this code to view your pet's information. Your pet's profile must be set to public (using the toggle at the top) for QR codes to work properly.",
          keywords: ["qr", "scan", "tag", "code", "public"]
        },
        {
          id: "lost-pet",
          category: "Emergency",
          question: "What should I do if my pet goes missing?",
          answer: "Immediately mark your pet as missing in the Lost Pet section. This generates a missing pet poster with QR codes that you can print and share. Make sure your pet's profile is set to public so people can access the information when they scan the QR code.",
          keywords: ["lost", "missing", "runaway", "poster", "flyer", "emergency"]
        },
        {
          id: "privacy",
          category: "Privacy",
          question: "How do I control what information is visible?",
          answer: "Your pet's profile has a single privacy toggle at the top that controls whether the entire profile is public or private. When set to public, all sections become viewable by anyone with the link. When private, only you can view the profile.",
          keywords: ["privacy", "visible", "public", "private", "hide", "show"]
        },
        {
          id: "gift-redemption",
          category: "Billing",
          question: "How do I redeem a gift subscription?",
          answer: "Click the activation link in your gift notification email. If you didn't receive the email, check spam/junk folders. Gift codes are case-sensitive. If expired, contact the sender or support@petport.app.",
          keywords: ["gift", "redeem", "claim", "code", "subscription", "activate"]
        },
        {
          id: "payment-failed",
          category: "Billing",
          question: "My payment failed, what should I do?",
          answer: "Go to Account Settings → Billing → Manage Subscription to update your payment method. Check that your card has sufficient funds and hasn't expired. If issues persist, contact billing@petport.app.",
          keywords: ["payment", "failed", "declined", "billing", "card", "subscription"]
        },
        {
          id: "pet-limit",
          category: "Subscription",
          question: "I can't add more pets",
          answer: "Free trial accounts are limited to 1 pet. Paid subscriptions start at 3 pets. Go to Account Settings → Billing to upgrade. You can purchase additional pet slots if needed.",
          keywords: ["limit", "maximum", "add pet", "upgrade", "more pets"]
        },
        {
          id: "cancel-subscription",
          category: "Billing",
          question: "How do I cancel my subscription?",
          answer: "Go to Account Settings → Billing → Manage Subscription → Cancel Subscription. You'll retain access until the end of your billing period. Your data is preserved for 30 days after cancellation.",
          keywords: ["cancel", "stop", "refund", "unsubscribe", "end subscription"]
        }
      ],
      troubleshooting: {
        gift: {
          title: "Gift Card Issues",
          keywords: ["gift", "code", "claim", "expired", "email"],
          common_issues: [
            "Gift code not working - check case sensitivity and spaces",
            "Didn't receive gift email - check spam, wait 10 minutes",
            "Gift expired - contact sender or support@petport.app",
            "Already claimed - may have been used on another account"
          ]
        },
        subscription: {
          title: "Subscription & Billing",
          keywords: ["payment", "billing", "subscription", "upgrade", "pet limit"],
          common_issues: [
            "Payment failed - update card in Manage Subscription",
            "Can't add pets - check pet limit, upgrade if needed",
            "Need invoice - download from Stripe portal",
            "Cancel subscription - use Manage Subscription button"
          ]
        },
        lostpet: {
          title: "Lost Pet Features",
          keywords: ["lost", "missing", "qr", "poster", "scan"],
          common_issues: [
            "Can't mark as lost - check subscription status",
            "QR code not scanning - print larger, avoid glossy surfaces",
            "Profile not showing - must be set to PUBLIC",
            "Poster missing info - complete pet profile first"
          ]
        }
      }
    };

    const systemPrompt = `You are a helpful PetPort support assistant. Analyze the user's search query and return the most relevant help articles.

Your task:
1. Understand the user's intent and problem
2. Match against FAQs and troubleshooting content
3. Return 1-5 most relevant results ranked by relevance
4. Include a brief explanation of why each result is relevant
5. Handle typos, synonyms, and natural language questions

Knowledge Base:
${JSON.stringify(knowledgeBase, null, 2)}

Return your response as a JSON object with this structure:
{
  "results": [
    {
      "id": "faq-id or troubleshooting-category",
      "type": "faq" or "troubleshooting",
      "title": "Question or Issue Title",
      "content": "Answer or solution",
      "relevance": 0-100 score,
      "reason": "Why this is relevant to the query (1 sentence)"
    }
  ],
  "interpreted_intent": "What you understood the user is asking about"
}`;

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
          { role: 'user', content: `Search query: "${query}"` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return relevant help articles for the user's query",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string", enum: ["faq", "troubleshooting"] },
                        title: { type: "string" },
                        content: { type: "string" },
                        relevance: { type: "number", minimum: 0, maximum: 100 },
                        reason: { type: "string" }
                      },
                      required: ["id", "type", "title", "content", "relevance", "reason"],
                      additionalProperties: false
                    }
                  },
                  interpreted_intent: { type: "string" }
                },
                required: ["results", "interpreted_intent"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_search_results" } }
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
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[SEARCH-HELP] AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[SEARCH-HELP] AI response:', JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const searchResults = JSON.parse(toolCall.function.arguments);
    console.log('[SEARCH-HELP] Search results:', JSON.stringify(searchResults));

    return new Response(
      JSON.stringify(searchResults),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[SEARCH-HELP] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
