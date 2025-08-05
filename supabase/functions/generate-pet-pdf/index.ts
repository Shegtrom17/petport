import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PDF Generation Started v2 ===')
    const { pet_id, type } = await req.json()

    if (!pet_id || !type) {
      console.error('Missing pet_id or type')
      return new Response(JSON.stringify({ error: 'Missing pet_id or type', pdfBytes: null, filename: null }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    // Fetch pet data
    const { data: petData, error: petError } = await supabaseClient
      .from('pets')
      .select('*')
      .eq('id', pet_id)
      .single()

    if (petError) {
      console.error('Error fetching pet data:', petError)
      return new Response(JSON.stringify({ error: 'Failed to fetch pet data', pdfBytes: null, filename: null }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!petData) {
      console.error('Pet not found')
      return new Response(JSON.stringify({ error: 'Pet not found', pdfBytes: null, filename: null }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch medical records
    const { data: medicalRecords, error: medicalError } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('pet_id', pet_id)

    if (medicalError) {
      console.error('Error fetching medical records:', medicalError)
      return new Response(JSON.stringify({ error: 'Failed to fetch medical records', pdfBytes: null, filename: null }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch vaccine records
    const { data: vaccineRecords, error: vaccineError } = await supabaseClient
      .from('vaccine_records')
      .select('*')
      .eq('pet_id', pet_id)

    if (vaccineError) {
      console.error('Error fetching vaccine records:', vaccineError)
      return new Response(JSON.stringify({ error: 'Failed to fetch vaccine records', pdfBytes: null, filename: null }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Add a page to the PDF document
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()

    // Function to add text to the page
    let currentY = height - 50 // Starting Y position
    const lineHeight = 12
    const margin = 20

    const addTitle = (text: string) => {
      page.drawText(text, {
        x: margin,
        y: currentY,
        font: boldFont,
        size: 24,
        color: rgb(0, 0, 0),
      })
      currentY -= 36 // Adjust for title spacing
    }

    const addSectionTitle = (text: string) => {
      page.drawText(text, {
        x: margin,
        y: currentY,
        font: boldFont,
        size: 16,
        color: rgb(0.2, 0.2, 0.2),
      })
      currentY -= 24 // Adjust for section title spacing
    }

    const addText = (text: string) => {
      page.drawText(text, {
        x: margin,
        y: currentY,
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      })
      currentY -= lineHeight
    }

    const addKeyValuePair = (key: string, value: string) => {
      page.drawText(`${key}: ${value}`, {
        x: margin,
        y: currentY,
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      })
      currentY -= lineHeight
    }

    // Add header and footer
    const addHeader = (text: string) => {
      page.drawText(text, {
        x: margin,
        y: height - 20,
        font: boldFont,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    const addFooter = (pageNumber: number, totalPages: number) => {
      page.drawText(`Page ${pageNumber} of ${totalPages}`, {
        x: width - 80,
        y: 20,
        font: boldFont,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    // Add Pet Profile Information based on the 'type'
    if (type === 'profile') {
      addTitle('Pet Profile')
      addSectionTitle('Pet Information')
      addKeyValuePair('Name', petData.name || 'N/A')
      addKeyValuePair('Species', petData.species || 'N/A')
      addKeyValuePair('Breed', petData.breed || 'N/A')
      addKeyValuePair('Date of Birth', petData.date_of_birth ? new Date(petData.date_of_birth).toLocaleDateString() : 'N/A')
      addKeyValuePair('Sex', petData.sex || 'N/A')
      addKeyValuePair('Color', petData.color || 'N/A')
      addKeyValuePair('Weight', petData.weight ? `${petData.weight} kg` : 'N/A')

      addSectionTitle('Owner Information')
      addKeyValuePair('Owner Name', petData.owner_name || 'N/A')
      addKeyValuePair('Contact Number', petData.contact_number || 'N/A')
      addKeyValuePair('Address', petData.address || 'N/A')

      addSectionTitle('Additional Notes')
      addText(petData.notes || 'N/A')
    }

    // Add Medical Records Information based on the 'type'
    if (type === 'medical') {
      addTitle('Medical Records')
      medicalRecords.forEach((record) => {
        addSectionTitle(`Record Date: ${new Date(record.record_date).toLocaleDateString()}`)
        addKeyValuePair('Veterinarian', record.veterinarian || 'N/A')
        addKeyValuePair('Diagnosis', record.diagnosis || 'N/A')
        addText(`Treatment: ${record.treatment || 'N/A'}`)
        currentY -= 12
      })
    }

    // Add Vaccine Records Information based on the 'type'
    if (type === 'vaccine') {
      addTitle('Vaccine Records')
      vaccineRecords.forEach((record) => {
        addSectionTitle(`Vaccine Date: ${new Date(record.vaccine_date).toLocaleDateString()}`)
        addKeyValuePair('Vaccine Name', record.vaccine_name || 'N/A')
        addKeyValuePair('Administered By', record.administered_by || 'N/A')
        currentY -= 12
      })
    }

    // Generate the PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Return JSON response with PDF data for client-side processing
    return new Response(JSON.stringify({
      success: true,
      pdfBytes: Array.from(pdfBytes), // Convert to array for JSON transport
      fileName: petData.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + type + '_profile.pdf'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error in generate-pet-pdf function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error: ' + error.message,
        pdfBytes: null,
        filename: null 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
