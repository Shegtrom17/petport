
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }), 
        { 
          status: 500, 
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

    // Parse request body
    const { petId, type = 'emergency' } = await req.json()

    if (!petId) {
      return new Response(
        JSON.stringify({ error: 'Pet ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating PDF for pet:', petId, 'type:', type)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pet data - using correct field name 'user_id' not 'owner_id'
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

    if (fetchError || !petData) {
      console.error('Error fetching pet data:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Pet data fetched successfully:', petData.name)

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Standard letter size
    const { width, height } = page.getSize()
    
    // Get fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    const isEmergency = type === 'emergency'
    
    // Colors
    const titleColor = rgb(0.12, 0.23, 0.54) // Navy blue
    const goldColor = rgb(0.83, 0.69, 0.22) // Gold
    const redColor = rgb(0.86, 0.15, 0.15) // Red for emergencies
    const blackColor = rgb(0, 0, 0)
    
    let yPosition = height - 60
    
    // Header
    page.drawText(isEmergency ? 'EMERGENCY PET IDENTIFICATION' : 'OFFICIAL PET PASSPORT', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: titleColor,
    })
    
    yPosition -= 30
    
    // PetPort ID
    if (petData.petport_id) {
      page.drawText(`PetPort ID: ${petData.petport_id}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: goldColor,
      })
    }
    
    yPosition -= 50
    
    // Pet Information Section
    page.drawText('PET INFORMATION', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: titleColor,
    })
    
    yPosition -= 30
    
    // Pet details
    const petDetails = [
      { label: 'Name:', value: petData.name || '' },
      { label: 'Species:', value: petData.species || '' },
      { label: 'Breed:', value: petData.breed || '' },
      { label: 'Age:', value: petData.age || '' },
      { label: 'Weight:', value: petData.weight || '' },
    ]
    
    if (petData.professional_data?.support_animal_status) {
      petDetails.push({ label: 'Status:', value: petData.professional_data.support_animal_status })
    }
    
    for (const detail of petDetails) {
      if (detail.value) {
        page.drawText(detail.label, {
          x: 70,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        
        page.drawText(detail.value, {
          x: 150,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        
        yPosition -= 20
      }
    }
    
    yPosition -= 30
    
    // Medical Alert Section
    if (petData.medical?.medical_alert && petData.medical?.medical_conditions) {
      page.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: width - 100,
        height: 40,
        color: rgb(1, 0.95, 0.8), // Light yellow background
        borderColor: rgb(0.96, 0.62, 0.06), // Orange border
        borderWidth: 2,
      })
      
      page.drawText('MEDICAL ALERT', {
        x: 60,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 20
      
      page.drawText(petData.medical.medical_conditions, {
        x: 60,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: blackColor,
        maxWidth: width - 120,
      })
      
      yPosition -= 40
    }
    
    // Emergency Contacts Section
    page.drawRectangle({
      x: 50,
      y: yPosition - 15,
      width: width - 100,
      height: 120,
      color: rgb(0.99, 0.89, 0.89), // Light red background
      borderColor: redColor,
      borderWidth: 2,
    })
    
    page.drawText('EMERGENCY CONTACTS', {
      x: 60,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: redColor,
    })
    
    yPosition -= 25
    
    const contacts = [
      { label: 'Primary:', value: petData.contacts?.emergency_contact || '' },
      { label: 'Secondary:', value: petData.contacts?.second_emergency_contact || '' },
      { label: 'Veterinarian:', value: petData.contacts?.vet_contact || '' },
    ]
    
    for (const contact of contacts) {
      if (contact.value) {
        page.drawText(contact.label, {
          x: 70,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        
        page.drawText(contact.value, {
          x: 150,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        
        yPosition -= 20
      }
    }
    
    yPosition -= 40
    
    // Medications Section
    if (petData.medical?.medications && petData.medical.medications.length > 0) {
      page.drawText('MEDICATIONS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 25
      
      for (const medication of petData.medical.medications) {
        page.drawText(`• ${medication}`, {
          x: 70,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        yPosition -= 18
      }
      
      yPosition -= 20
    }
    
    // About Section (for full profile only)
    if (!isEmergency && petData.bio) {
      page.drawText('ABOUT', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 25
      
      page.drawText(petData.bio, {
        x: 70,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: blackColor,
        maxWidth: width - 140,
      })
      
      yPosition -= 40
    }
    
    // Footer
    const currentDate = new Date().toLocaleDateString()
    page.drawText(`Generated by PetPort - ${currentDate}`, {
      x: 50,
      y: 50,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    })
    
    page.drawText(`This document contains emergency contact information for ${petData.name}`, {
      x: 50,
      y: 35,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    })
    
    // Official stamp circle
    page.drawCircle({
      x: width - 100,
      y: height - 100,
      size: 50,
      borderColor: goldColor,
      borderWidth: 3,
    })
    
    page.drawText('OFFICIAL', {
      x: width - 125,
      y: height - 90,
      size: 10,
      font: boldFont,
      color: goldColor,
    })
    
    page.drawText('PETPORT', {
      x: width - 125,
      y: height - 105,
      size: 10,
      font: boldFont,
      color: goldColor,
    })
    
    page.drawText(new Date().getFullYear().toString(), {
      x: width - 115,
      y: height - 120,
      size: 10,
      font: boldFont,
      color: goldColor,
    })

    // Save the PDF as bytes
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully for:', petData.name, 'Size:', pdfBytes.length, 'bytes')

    // Ensure binary data is properly transmitted
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${petData.name}_${type}_passport.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache',
      }
    })

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
