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

    console.log(`Generating PDF for pet ${petId}, type: ${type}`)

    if (!petId) {
      return new Response(
        JSON.stringify({ error: 'Pet ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (type && !['emergency', 'full', 'lost_pet'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Type must be emergency, full, or lost_pet' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating PDF for pet:', petId, 'type:', type)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pet data with all related tables for full profile
    const { data: petData, error: fetchError } = await supabase
      .from('pets')
      .select(`
        *,
        professional_data (support_animal_status, badges),
        medical (medical_alert, medical_conditions, medications, last_vaccination),
        contacts (emergency_contact, second_emergency_contact, vet_contact, pet_caretaker),
        care_instructions (feeding_schedule, morning_routine, evening_routine, allergies, behavioral_notes, favorite_activities),
        experiences (activity, contact, description),
        achievements (title, description),
        training (course, facility, phone, completed),
        reviews (reviewer_name, rating, text, date, location, type),
        travel_locations (name, type, code, date_visited, notes),
        documents (name, type, file_url, size),
        lost_pet_data (is_missing, last_seen_location, last_seen_date, last_seen_time, distinctive_features, reward_amount, finder_instructions, emergency_notes),
        pet_photos (photo_url, full_body_photo_url),
        gallery_photos (url, caption)
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
    const isLostPet = type === 'lost_pet'
    
    // Colors
    const titleColor = rgb(0.12, 0.23, 0.54) // Navy blue
    const goldColor = rgb(0.83, 0.69, 0.22) // Gold
    const redColor = rgb(0.86, 0.15, 0.15) // Red for emergencies
    const blackColor = rgb(0, 0, 0)
    
    let yPosition = height - 60
    
    // Header - Special handling for lost pet
    if (isLostPet) {
      // Red emergency banner for lost pets
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: rgb(0.9, 0, 0),
      })
      
      page.drawText('🚨 MISSING PET ALERT 🚨', {
        x: width / 2 - 120,
        y: height - 40,
        size: 24,
        font: boldFont,
        color: rgb(1, 1, 1),
      })
      
      page.drawText(`${petData.name} - ${petData.breed || 'Pet'}`, {
        x: width / 2 - 100,
        y: height - 70,
        size: 18,
        font: boldFont,
        color: rgb(1, 1, 1),
      })
      
      yPosition = height - 120
    } else {
      // Standard header
      page.drawText(isEmergency ? 'EMERGENCY PET IDENTIFICATION' : 'OFFICIAL PET PASSPORT', {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: titleColor,
      })
    }
    
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
    
    if (petData.microchip_id) {
      petDetails.push({ label: 'Microchip ID:', value: petData.microchip_id })
    }
    
    if (petData.professional_data?.support_animal_status) {
      petDetails.push({ label: 'Status:', value: petData.professional_data.support_animal_status })
    }
    
    for (const detail of petDetails) {
      if (detail.value) {
        page.drawText(`${detail.label}`, {
          x: 50,
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

    yPosition -= 20

    // Emergency Contacts Section
    if (petData.contacts) {
      page.drawText('EMERGENCY CONTACTS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      const contactDetails = [
        { label: 'Primary Emergency:', value: petData.contacts.emergency_contact },
        { label: 'Secondary Contact:', value: petData.contacts.second_emergency_contact },
        { label: 'Veterinarian:', value: petData.contacts.vet_contact },
        { label: 'Pet Caretaker:', value: petData.contacts.pet_caretaker },
      ]
      
      for (const contact of contactDetails) {
        if (contact.value) {
          page.drawText(`${contact.label}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          page.drawText(contact.value, {
            x: 180,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 20
        }
      }
    }

    yPosition -= 20

    // Medical Information
    if (petData.medical) {
      page.drawText('MEDICAL INFORMATION', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30

      if (petData.medical.medical_alert) {
        page.drawText('⚠️ MEDICAL ALERT', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: redColor,
        })
        yPosition -= 25
      }

      if (petData.medical.medical_conditions) {
        page.drawText('Medical Conditions:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        
        page.drawText(petData.medical.medical_conditions, {
          x: 50,
          y: yPosition - 15,
          size: 11,
          font: regularFont,
          color: blackColor,
        })
        
        yPosition -= 40
      }

      if (petData.medical.medications && petData.medical.medications.length > 0) {
        page.drawText('Medications:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        
        petData.medical.medications.forEach((med: string, index: number) => {
          page.drawText(`• ${med}`, {
            x: 50,
            y: yPosition - 15 - (index * 15),
            size: 11,
            font: regularFont,
            color: blackColor,
          })
        })
        
        yPosition -= 15 + (petData.medical.medications.length * 15) + 10
      }
    }

    // Lost Pet Specific Information
    if (isLostPet && petData.lost_pet_data) {
      yPosition -= 20
      
      page.drawText('MISSING PET DETAILS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 30

      const lostDetails = [
        { label: 'Last Seen Location:', value: petData.lost_pet_data.last_seen_location },
        { label: 'Last Seen Date:', value: petData.lost_pet_data.last_seen_date ? new Date(petData.lost_pet_data.last_seen_date).toLocaleDateString() : null },
        { label: 'Last Seen Time:', value: petData.lost_pet_data.last_seen_time },
        { label: 'Distinctive Features:', value: petData.lost_pet_data.distinctive_features },
        { label: 'Reward Offered:', value: petData.lost_pet_data.reward_amount },
      ]
      
      for (const detail of lostDetails) {
        if (detail.value) {
          page.drawText(`${detail.label}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          page.drawText(detail.value, {
            x: 200,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 20
        }
      }

      if (petData.lost_pet_data.finder_instructions) {
        yPosition -= 10
        page.drawText('If Found - Instructions:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: redColor,
        })
        
        page.drawText(petData.lost_pet_data.finder_instructions, {
          x: 50,
          y: yPosition - 15,
          size: 11,
          font: regularFont,
          color: blackColor,
        })
        
        yPosition -= 40
      }
    }

    // Bio section (for non-emergency PDFs or lost pet with space)
    if (!isEmergency && petData.bio) {
      yPosition -= 20
      
      page.drawText('BIO', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      page.drawText(petData.bio, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: blackColor,
      })
      
      yPosition -= 40
    }

    // Care Instructions (for full profiles)
    if (type === 'full' && petData.care_instructions) {
      yPosition -= 20
      
      page.drawText('CARE INSTRUCTIONS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30

      const careDetails = [
        { label: 'Feeding Schedule:', value: petData.care_instructions.feeding_schedule },
        { label: 'Morning Routine:', value: petData.care_instructions.morning_routine },
        { label: 'Evening Routine:', value: petData.care_instructions.evening_routine },
        { label: 'Allergies:', value: petData.care_instructions.allergies },
        { label: 'Behavioral Notes:', value: petData.care_instructions.behavioral_notes },
        { label: 'Favorite Activities:', value: petData.care_instructions.favorite_activities },
      ]
      
      for (const detail of careDetails) {
        if (detail.value) {
          page.drawText(`${detail.label}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          // Handle longer text with wrapping
          const maxWidth = 400
          const words = detail.value.split(' ')
          let line = ''
          let lineY = yPosition - 15
          
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word
            if (testLine.length * 6 > maxWidth && line) {
              page.drawText(line, {
                x: 50,
                y: lineY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              line = word
              lineY -= 15
            } else {
              line = testLine
            }
          }
          
          if (line) {
            page.drawText(line, {
              x: 50,
              y: lineY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
          }
          
          yPosition = lineY - 25
        }
      }
    }

    // Footer
    yPosition = 50
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: goldColor,
    })

    page.drawText('PetPort™ Official Document', {
      x: width - 200,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: goldColor,
    })

    // Save the PDF as bytes
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully for:', petData.name, 'Size:', pdfBytes.length, 'bytes')
    
    // Return JSON response with PDF data for client-side processing
    return new Response(JSON.stringify({
      success: true,
      pdfBytes: Array.from(pdfBytes), // Convert to array for JSON transport
      fileName: `${petData.name}_${type}_profile.pdf`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
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