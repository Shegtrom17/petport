
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10 // Max 10 requests per minute

  const clientData = rateLimitMap.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (clientData.count >= maxRequests) {
    return false
  }
  
  clientData.count++
  return true
}

const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>]/g, '').substring(0, 1000) // Basic sanitization and length limit
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }), 
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse and validate request body
    let petData
    try {
      petData = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate required fields
    if (!petData || !petData.name) {
      return new Response(
        JSON.stringify({ error: 'Pet name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize all input data
    const sanitizedPetData = {
      name: sanitizeInput(petData.name),
      species: sanitizeInput(petData.species || ''),
      breed: sanitizeInput(petData.breed || ''),
      age: sanitizeInput(petData.age || ''),
      weight: sanitizeInput(petData.weight || ''),
      bio: sanitizeInput(petData.bio || ''),
      emergencyContact: sanitizeInput(petData.emergencyContact || ''),
      vetContact: sanitizeInput(petData.vetContact || ''),
      medicalConditions: sanitizeInput(petData.medicalConditions || ''),
      petPassId: sanitizeInput(petData.petPassId || '')
    }

    // Create the PDF content using OpenAI
    const prompt = `Create a professional pet passport document in PDF format for:
    
Pet Name: ${sanitizedPetData.name}
Species: ${sanitizedPetData.species}
Breed: ${sanitizedPetData.breed}
Age: ${sanitizedPetData.age}
Weight: ${sanitizedPetData.weight}
Bio: ${sanitizedPetData.bio}
Pet Pass ID: ${sanitizedPetData.petPassId}

Include emergency contact and veterinary information if provided.
Make it official and professional looking.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates professional pet passport documents.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate PDF content' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAIData = await response.json()
    
    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    const pdfContent = openAIData.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: pdfContent,
        petName: sanitizedPetData.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-pet-pdf function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
