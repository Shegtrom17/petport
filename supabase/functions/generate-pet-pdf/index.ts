import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
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

    // Parse the request body to get petId and type (emergency or full)
    const { petId, type = 'emergency' } = await req.json()
    
    if (!petId) {
      return new Response(
        JSON.stringify({ 
          error: 'Pet ID is required',
          pdfBytes: null,
          filename: null 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (type && !['emergency', 'full', 'lost_pet'].includes(type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Type must be either "emergency", "full", or "lost_pet"',
          pdfBytes: null,
          filename: null 
        }),
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
        
        pet_photos (photo_url, full_body_photo_url),
        gallery_photos (url, caption)
      `)
      .eq('id', petId)
      .single()

    if (fetchError || !petData) {
      console.error('Error fetching pet data:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Pet not found',
          pdfBytes: null,
          filename: null 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Pet data fetched successfully:', petData.name)
    console.log('Care instructions data:', JSON.stringify(petData.care_instructions, null, 2))

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Standard letter size
    const { width, height } = page.getSize()
    
    // Get fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    const isEmergency = type === 'emergency'
    const isLostPetFlyer = type === 'lost_pet'
    
    // Colors
    const titleColor = rgb(0.12, 0.23, 0.54) // Navy blue
    const goldColor = rgb(0.83, 0.69, 0.22) // Gold
    const redColor = rgb(0.86, 0.15, 0.15) // Red for emergencies
    const blackColor = rgb(0, 0, 0)
    const whiteColor = rgb(1, 1, 1)
    
    let yPosition = height - 60
    
    // MISSING PET FLYER LAYOUT
    if (isLostPetFlyer) {
      // Large MISSING banner
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: redColor,
      })
      
      page.drawText('MISSING PET', {
        x: width / 2 - 120,
        y: height - 60,
        size: 36,
        font: boldFont,
        color: whiteColor,
      })
      
      yPosition = height - 120
      
      // Pet basic info in large text
      page.drawText(`${petData.name} - ${petData.breed} ${petData.species}`, {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: blackColor,
      })
      
      yPosition -= 40
      
      // Missing pet specific information
      if (petData.lost_pet_data && petData.lost_pet_data.length > 0) {
        const lostData = petData.lost_pet_data[0]
        
        if (lostData.last_seen_location) {
          page.drawText('LAST SEEN:', {
            x: 50,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          page.drawText(lostData.last_seen_location, {
            x: 150,
            y: yPosition,
            size: 14,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
        
        if (lostData.last_seen_date) {
          const date = new Date(lostData.last_seen_date).toLocaleDateString()
          page.drawText(`Date: ${date}`, {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: blackColor,
          })
          
          if (lostData.last_seen_time) {
            page.drawText(`Time: ${lostData.last_seen_time}`, {
              x: 250,
              y: yPosition,
              size: 14,
              font: boldFont,
              color: blackColor,
            })
          }
          
          yPosition -= 30
        }
        
        if (lostData.distinctive_features) {
          page.drawText('DISTINCTIVE FEATURES:', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: blackColor,
          })
          
          yPosition -= 20
          
          page.drawText(lostData.distinctive_features, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
        
        if (lostData.reward_amount) {
          page.drawText('REWARD:', {
            x: 50,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          page.drawText(lostData.reward_amount, {
            x: 130,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 40
        }
      }
      
      // PHOTOS SECTION - Critical for identification
      yPosition -= 30
      page.drawText('PHOTOS FOR IDENTIFICATION:', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 30
      
      // Display main pet photos if available
      if (petData.pet_photos && petData.pet_photos.length > 0) {
        const photos = petData.pet_photos[0]
        let photoX = 50
        
        if (photos.photo_url) {
          try {
            const photoResponse = await fetch(photos.photo_url)
            if (photoResponse.ok) {
              const photoBytes = await photoResponse.arrayBuffer()
              const photo = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
              
              page.drawImage(photo, {
                x: photoX,
                y: yPosition - 120,
                width: 120,
                height: 120,
              })
              
              page.drawText('Main Photo', {
                x: photoX,
                y: yPosition - 140,
                size: 10,
                font: boldFont,
                color: blackColor,
              })
              
              photoX += 140
            }
          } catch (error) {
            console.log('Could not load main photo:', error)
          }
        }
        
        if (photos.full_body_photo_url) {
          try {
            const photoResponse = await fetch(photos.full_body_photo_url)
            if (photoResponse.ok) {
              const photoBytes = await photoResponse.arrayBuffer()
              const photo = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
              
              page.drawImage(photo, {
                x: photoX,
                y: yPosition - 120,
                width: 120,
                height: 120,
              })
              
              page.drawText('Full Body Photo', {
                x: photoX,
                y: yPosition - 140,
                size: 10,
                font: boldFont,
                color: blackColor,
              })
            }
          } catch (error) {
            console.log('Could not load full body photo:', error)
          }
        }
        
        yPosition -= 160
      }
      
      // RECENT PHOTOS GALLERY
      if (petData.gallery_photos && petData.gallery_photos.length > 0) {
        yPosition -= 20
        page.drawText('RECENT PHOTOS:', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: blackColor,
        })
        
        yPosition -= 30
        let galleryX = 50
        let photoCount = 0
        
        for (const galleryPhoto of petData.gallery_photos.slice(0, 3)) { // Show up to 3 recent photos
          try {
            const photoResponse = await fetch(galleryPhoto.url)
            if (photoResponse.ok) {
              const photoBytes = await photoResponse.arrayBuffer()
              const photo = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
              
              page.drawImage(photo, {
                x: galleryX,
                y: yPosition - 80,
                width: 80,
                height: 80,
              })
              
              if (galleryPhoto.caption) {
                page.drawText(galleryPhoto.caption.substring(0, 12), {
                  x: galleryX,
                  y: yPosition - 95,
                  size: 8,
                  font: regularFont,
                  color: blackColor,
                })
              }
              
              galleryX += 90
              photoCount++
              
              if (photoCount >= 3) break
            }
          } catch (error) {
            console.log('Could not load gallery photo:', error)
          }
        }
        
        yPosition -= 110
      }
      
      // MISSING PET INFORMATION SECTION
      yPosition -= 20
      page.drawText('MISSING PET INFORMATION:', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 25
      
      // Add lost pet specific data
      if (petData.lost_pet_data && petData.lost_pet_data.length > 0) {
        const lostData = petData.lost_pet_data[0]
        
        // LAST SEEN INFORMATION - Most Critical
        if (lostData.last_seen_location) {
          page.drawText('LAST SEEN LOCATION:', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 20
          page.drawText(lostData.last_seen_location, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 25
        }
        
        // LAST SEEN DATE & TIME
        if (lostData.last_seen_date || lostData.last_seen_time) {
          page.drawText('LAST SEEN DATE & TIME:', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 20
          let dateTimeText = ''
          if (lostData.last_seen_date) {
            const date = new Date(lostData.last_seen_date).toLocaleDateString()
            dateTimeText += `Date: ${date}`
          }
          if (lostData.last_seen_time) {
            dateTimeText += `${dateTimeText ? ' | ' : ''}Time: ${lostData.last_seen_time}`
          }
          
          page.drawText(dateTimeText, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 25
        }
        
        // REWARD INFORMATION - Prominent Display
        if (lostData.reward_amount) {
          page.drawRectangle({
            x: 40,
            y: yPosition - 15,
            width: width - 80,
            height: 35,
            color: rgb(1, 0.9, 0.8), // Light orange background
          })
          
          page.drawText('💰 REWARD OFFERED:', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: redColor,
          })
          
          page.drawText(lostData.reward_amount, {
            x: 200,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 40
        }
        
        // DISTINCTIVE FEATURES
        if (lostData.distinctive_features) {
          page.drawText('DISTINCTIVE FEATURES:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          yPosition -= 20
          page.drawText(lostData.distinctive_features, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
        
        // CONTACT PRIORITY INSTRUCTIONS
        if (lostData.contact_priority) {
          page.drawText('CONTACT PRIORITY:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 20
          page.drawText(lostData.contact_priority, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
        
        // FINDER INSTRUCTIONS
        if (lostData.finder_instructions) {
          page.drawText('IF FOUND - IMPORTANT:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 20
          page.drawText(lostData.finder_instructions, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
        
        // EMERGENCY NOTES
        if (lostData.emergency_notes) {
          page.drawText('*** EMERGENCY NOTES ***', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 20
          page.drawText(lostData.emergency_notes, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
      }
      
      // Pet details for identification
      const petDetails = [
        { label: 'Species:', value: petData.species || '' },
        { label: 'Breed:', value: petData.breed || '' },
        { label: 'Age:', value: petData.age || '' },
        { label: 'Weight:', value: petData.weight || '' },
        { label: 'Microchip:', value: petData.microchip_id || '' },
      ]
      
      page.drawText('PET DETAILS:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: blackColor,
      })
      
      yPosition -= 25
      
      for (const detail of petDetails) {
        if (detail.value) {
          page.drawText(`${detail.label} ${detail.value}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 20
        }
      }
      
      yPosition -= 20
      
      // Emergency contacts in large bold text
      if (petData.contacts) {
        page.drawText('PLEASE CONTACT:', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: redColor,
        })
        
        yPosition -= 30
        
        const contactDetails = [
          { label: 'PRIMARY:', value: petData.contacts.emergency_contact },
          { label: 'SECONDARY:', value: petData.contacts.second_emergency_contact },
          { label: 'VET:', value: petData.contacts.vet_contact },
        ]
        
        for (const contact of contactDetails) {
          if (contact.value) {
            page.drawText(contact.label, {
              x: 50,
              y: yPosition,
              size: 14,
              font: boldFont,
              color: blackColor,
            })
            
            page.drawText(contact.value, {
              x: 150,
              y: yPosition,
              size: 14,
              font: boldFont,
              color: blackColor,
            })
            
            yPosition -= 25
          }
        }
      }
      
      // Medical alert if applicable
      if (petData.medical?.medical_alert) {
        yPosition -= 20
        
        page.drawRectangle({
          x: 40,
          y: yPosition - 10,
          width: width - 80,
          height: 40,
          color: redColor,
        })
        
        page.drawText('*** MEDICAL ALERT - NEEDS MEDICATION ***', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: whiteColor,
        })
        
        yPosition -= 50
        
        if (petData.medical.medical_conditions) {
          page.drawText(petData.medical.medical_conditions, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          yPosition -= 30
        }
      }
      
      // Footer for flyer
      yPosition = 80
      page.drawText('Do not chase - may run further. Please call immediately if seen.', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 30
      page.drawText(`Pet ID: ${petData.petport_id || 'N/A'} | Generated: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: blackColor,
      })
      
    } else {
    
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
        page.drawText('! MEDICAL ALERT', {
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

    // Bio section (for non-emergency PDFs)
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

    // Dynamically add new pages if content overflows (for full profiles)
    if (type === 'full' && yPosition < 150) {
      // Add a new page if we're running out of space
      const newPage = pdfDoc.addPage([612, 792])
      yPosition = height - 60 // Reset position for new page
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
          
          // Handle longer text with basic wrapping
          const maxChars = 70
          if (detail.value.length > maxChars) {
            const words = detail.value.split(' ')
            let line = ''
            let lineNumber = 0
            
            for (const word of words) {
              if ((line + word).length > maxChars) {
                page.drawText(line, {
                  x: 50,
                  y: yPosition - 15 - (lineNumber * 12),
                  size: 11,
                  font: regularFont,
                  color: blackColor,
                })
                line = word + ' '
                lineNumber++
              } else {
                line += word + ' '
              }
            }
            
            if (line.trim()) {
              page.drawText(line.trim(), {
                x: 50,
                y: yPosition - 15 - (lineNumber * 12),
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              lineNumber++
            }
            
            yPosition -= 15 + (lineNumber * 12) + 10
          } else {
            page.drawText(detail.value, {
              x: 50,
              y: yPosition - 15,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            yPosition -= 30
          }
        }
      }
    }

    // Training Records (for full profiles)
    if (type === 'full' && petData.training && petData.training.length > 0) {
      yPosition -= 20
      
      page.drawText('TRAINING RECORDS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.training.forEach((training: any) => {
        page.drawText(`Course: ${training.course}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        yPosition -= 15
        
        if (training.facility) {
          page.drawText(`Facility: ${training.facility}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        if (training.completed) {
          page.drawText(`Completed: ${training.completed}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        yPosition -= 10
      })
    }

    // Achievements (for full profiles)
    if (type === 'full' && petData.achievements && petData.achievements.length > 0) {
      yPosition -= 20
      
      page.drawText('ACHIEVEMENTS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.achievements.forEach((achievement: any) => {
        page.drawText(`🏆 ${achievement.title}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        yPosition -= 15
        
        if (achievement.description) {
          page.drawText(achievement.description, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        yPosition -= 10
      })
    }

    // Experiences (for full profiles)
    if (type === 'full' && petData.experiences && petData.experiences.length > 0) {
      yPosition -= 20
      
      page.drawText('EXPERIENCES', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.experiences.forEach((experience: any) => {
        page.drawText(`Activity: ${experience.activity}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        yPosition -= 15
        
        if (experience.description) {
          page.drawText(experience.description, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        if (experience.contact) {
          page.drawText(`Contact: ${experience.contact}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        yPosition -= 10
      })
    }

    // Reviews (for full profiles)
    if (type === 'full' && petData.reviews && petData.reviews.length > 0) {
      yPosition -= 20
      
      page.drawText('REVIEWS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.reviews.forEach((review: any) => {
        const stars = '⭐'.repeat(review.rating || 0)
        page.drawText(`${stars} - ${review.reviewer_name}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        yPosition -= 15
        
        if (review.text) {
          page.drawText(review.text, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        if (review.date) {
          page.drawText(`Date: ${review.date}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        yPosition -= 10
      })
    }

    // Travel History (for full profiles)
    if (type === 'full' && petData.travel_locations && petData.travel_locations.length > 0) {
      yPosition -= 20
      
      page.drawText('TRAVEL HISTORY', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.travel_locations.forEach((location: any) => {
        page.drawText(`📍 ${location.name} (${location.type})`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: blackColor,
        })
        yPosition -= 15
        
        if (location.date_visited) {
          page.drawText(`Visited: ${location.date_visited}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        if (location.notes) {
          page.drawText(location.notes, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          yPosition -= 15
        }
        
        yPosition -= 10
      })
    }

    // Medical History (for full profiles)
    if (type === 'full' && petData.medical && petData.medical.last_vaccination) {
      yPosition -= 20
      
      page.drawText('MEDICAL HISTORY', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      page.drawText(`Last Vaccination: ${petData.medical.last_vaccination}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: blackColor,
      })
      
      yPosition -= 30
    }

    // Documents (for full profiles)
    if (type === 'full' && petData.documents && petData.documents.length > 0) {
      yPosition -= 20
      
      page.drawText('DOCUMENTS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.documents.forEach((doc: any) => {
        page.drawText(`📄 ${doc.name} (${doc.type})`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        yPosition -= 20
      })
    }

    // Professional certifications (for full profiles)
    if (type === 'full' && petData.professional_data?.badges && petData.professional_data.badges.length > 0) {
      yPosition -= 20
      
      page.drawText('PROFESSIONAL CERTIFICATIONS', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: titleColor,
      })
      
      yPosition -= 30
      
      petData.professional_data.badges.forEach((badge: string) => {
        page.drawText(`🏅 ${badge}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        yPosition -= 20
      })
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

    } // Close the else block for non-lost-pet PDFs

    // Save the PDF as bytes
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully for:', petData.name, 'Size:', pdfBytes.length, 'bytes')
    
    // 🔍 INSPECTION: Check PDF bytes generation
    console.log('📊 PDF BYTES INSPECTION:')
    console.log('  - PDF byte array type:', typeof pdfBytes)
    console.log('  - PDF byte array length:', pdfBytes.length)
    console.log('  - PDF byte array constructor:', pdfBytes.constructor.name)
    console.log('  - First 10 bytes:', Array.from(pdfBytes.slice(0, 10)))
    console.log('  - PDF signature check (should start with %PDF):', 
      String.fromCharCode(...pdfBytes.slice(0, 4)))
    
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