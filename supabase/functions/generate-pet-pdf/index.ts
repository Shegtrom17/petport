
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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

// Safe base64 encoding that handles UTF-8 characters
const safeBase64Encode = (str: string): string => {
  try {
    // Use TextEncoder to properly handle UTF-8 characters
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return btoa(String.fromCharCode(...data))
  } catch (error) {
    console.error('Base64 encoding error:', error)
    // Fallback: remove problematic characters and try again
    const cleanStr = str.replace(/[^\x00-\x7F]/g, "")
    return btoa(cleanStr)
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', { 
        hasUrl: !!SUPABASE_URL, 
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY 
      })
      return new Response(
        JSON.stringify({ error: 'Service configuration error - missing environment variables' }), 
        { 
          status: 500, 
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
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('JSON parsing error:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { petId, type = 'emergency' } = requestData

    // Validate required fields
    if (!petId) {
      return new Response(
        JSON.stringify({ error: 'Pet ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Fetching pet data for ID:', petId, 'type:', type)

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pet data from database using .single() for proper error handling
    const { data: petData, error: fetchError } = await supabase
      .from('pets')
      .select(`
        *,
        pet_photos (photo_url, full_body_photo_url),
        professional_data (support_animal_status, badges),
        medical (medical_alert, medical_conditions, medications),
        contacts (emergency_contact, second_emergency_contact, vet_contact)
      `)
      .eq('id', petId)
      .single()

    if (fetchError) {
      console.error('Error fetching pet data:', fetchError)
      
      // Handle specific error cases
      if (fetchError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Pet not found or access denied' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Database error: ' + fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!petData) {
      console.error('No pet data returned for ID:', petId)
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Pet data fetched successfully:', petData.name)

    // Sanitize pet data
    const sanitizedPetData = {
      name: sanitizeInput(petData.name),
      species: sanitizeInput(petData.species || ''),
      breed: sanitizeInput(petData.breed || ''),
      age: sanitizeInput(petData.age || ''),
      weight: sanitizeInput(petData.weight || ''),
      bio: sanitizeInput(petData.bio || ''),
      petport_id: sanitizeInput(petData.petport_id || ''),
      emergency_contact: sanitizeInput(petData.contacts?.emergency_contact || ''),
      second_emergency_contact: sanitizeInput(petData.contacts?.second_emergency_contact || ''),
      vet_contact: sanitizeInput(petData.contacts?.vet_contact || ''),
      medical_conditions: sanitizeInput(petData.medical?.medical_conditions || ''),
      support_animal_status: sanitizeInput(petData.professional_data?.support_animal_status || ''),
      medical_alert: petData.medical?.medical_alert || false,
      medications: petData.medical?.medications || []
    }

    // Generate HTML content for PDF
    const htmlContent = generatePetPassportHTML(sanitizedPetData, type)

    // For now, return the HTML content - in production you'd convert this to PDF
    const fileName = `${sanitizedPetData.name}_${type}_passport.pdf`
    
    // Create a safe data URL for the PDF content using proper encoding
    const pdfDataUrl = `data:text/html;base64,${safeBase64Encode(htmlContent)}`

    console.log('PDF generated successfully for:', sanitizedPetData.name)

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl: pdfDataUrl,
        fileName: fileName,
        type: type,
        petName: sanitizedPetData.name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-pet-pdf function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generatePetPassportHTML(petData: any, type: string): string {
  const isEmergency = type === 'emergency'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${petData.name} - Pet Passport</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background: #f8f8f8;
          color: #1a1a1a;
        }
        .passport-header { 
          text-align: center; 
          border-bottom: 3px solid #d4af37; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .passport-title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1e3a8a;
          margin-bottom: 10px;
        }
        .pet-id { 
          font-size: 14px; 
          color: #666; 
          font-weight: bold;
        }
        .pet-info { 
          display: flex; 
          margin-bottom: 30px;
        }
        .pet-photo { 
          width: 150px; 
          height: 150px; 
          border: 3px solid #d4af37; 
          margin-right: 30px;
          background: #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #666;
        }
        .pet-details { 
          flex: 1;
        }
        .detail-row { 
          margin-bottom: 10px;
          display: flex;
        }
        .detail-label { 
          font-weight: bold; 
          width: 120px;
          color: #1e3a8a;
        }
        .detail-value { 
          flex: 1;
        }
        .emergency-section { 
          background: #fee2e2; 
          border: 2px solid #dc2626; 
          padding: 20px; 
          margin: 20px 0;
          border-radius: 8px;
        }
        .emergency-title { 
          color: #dc2626; 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 15px;
        }
        .medical-alert { 
          background: #fef3c7; 
          border: 2px solid #f59e0b; 
          padding: 15px; 
          margin: 15px 0;
          border-radius: 8px;
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #1e3a8a; 
          margin: 20px 0 10px 0;
          border-bottom: 1px solid #d4af37;
          padding-bottom: 5px;
        }
        .stamp { 
          position: absolute; 
          top: 50px; 
          right: 50px; 
          border: 2px solid #d4af37; 
          border-radius: 50%; 
          width: 100px; 
          height: 100px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 12px; 
          font-weight: bold; 
          color: #d4af37;
          text-align: center;
          line-height: 1.2;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #d4af37; 
          font-size: 12px; 
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="stamp">
        OFFICIAL<br>
        PETPORT<br>
        ${new Date().getFullYear()}
      </div>
      
      <div class="passport-header">
        <div class="passport-title">
          ${isEmergency ? 'EMERGENCY PET IDENTIFICATION' : 'OFFICIAL PET PASSPORT'}
        </div>
        <div class="pet-id">PetPort ID: ${petData.petport_id}</div>
      </div>

      <div class="pet-info">
        <div class="pet-photo">
          [Pet Photo]
        </div>
        <div class="pet-details">
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${petData.name}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Species:</div>
            <div class="detail-value">${petData.species}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Breed:</div>
            <div class="detail-value">${petData.breed}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Age:</div>
            <div class="detail-value">${petData.age}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Weight:</div>
            <div class="detail-value">${petData.weight}</div>
          </div>
          ${petData.support_animal_status ? `
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">${petData.support_animal_status}</div>
          </div>
          ` : ''}
        </div>
      </div>

      ${petData.medical_alert && petData.medical_conditions ? `
      <div class="medical-alert">
        <strong>MEDICAL ALERT:</strong> ${petData.medical_conditions}
      </div>
      ` : ''}

      <div class="emergency-section">
        <div class="emergency-title">EMERGENCY CONTACTS</div>
        <div class="detail-row">
          <div class="detail-label">Primary:</div>
          <div class="detail-value">${petData.emergency_contact}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Secondary:</div>
          <div class="detail-value">${petData.second_emergency_contact}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Veterinarian:</div>
          <div class="detail-value">${petData.vet_contact}</div>
        </div>
      </div>

      ${petData.medications && petData.medications.length > 0 ? `
      <div class="section-title">MEDICATIONS</div>
      <ul>
        ${petData.medications.map((med: string) => `<li>${med}</li>`).join('')}
      </ul>
      ` : ''}

      ${!isEmergency && petData.bio ? `
      <div class="section-title">ABOUT</div>
      <p>${petData.bio}</p>
      ` : ''}

      <div class="footer">
        Generated by PetPort - ${new Date().toLocaleDateString()}<br>
        This document contains emergency contact information for ${petData.name}
      </div>
    </body>
    </html>
  `
}
