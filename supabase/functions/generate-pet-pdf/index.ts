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
    console.log('=== PDF Generation Started ===')
    
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

    // Parse the request body to get petId and type
    const requestBody = await req.json()
    console.log('Raw request body received:', requestBody)
    const { petId, type } = requestBody
    console.log('Extracted petId:', petId, 'type:', type, 'original type value:', requestBody.type)
    
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

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Fetch pet data - separate queries to avoid join issues
    console.log('Fetching pet data for:', petId)
    
    const { data: petData, error: fetchError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single()

    if (fetchError) {
      console.error('Error fetching pet data:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch pet data: ' + fetchError.message,
          pdfBytes: null,
          filename: null 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!petData) {
      console.error('Pet not found:', petId)
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

    // Fetch additional data separately to avoid join issues
    const [
      { data: contactsData },
      { data: medicalData },
      { data: lostPetData },
      { data: careData },
      { data: photosData },
      { data: achievementsData },
      { data: trainingData },
      { data: reviewsData },
      { data: experiencesData },
      { data: travelData },
      { data: galleryData },
      { data: certificationsData },
      { data: professionalData }
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('medical').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('lost_pet_data').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('care_instructions').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('pet_photos').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('achievements').select('*').eq('pet_id', petId),
      supabase.from('training').select('*').eq('pet_id', petId),
      supabase.from('reviews').select('*').eq('pet_id', petId),
      supabase.from('experiences').select('*').eq('pet_id', petId),
      supabase.from('travel_locations').select('*').eq('pet_id', petId),
      supabase.from('gallery_photos').select('*').eq('pet_id', petId),
      supabase.from('certifications').select('*').eq('pet_id', petId),
      supabase.from('professional_data').select('*').eq('pet_id', petId).maybeSingle()
    ])

    console.log('Additional data fetched:', {
      hasContacts: !!contactsData,
      hasMedical: !!medicalData,
      hasLostData: !!lostPetData,
      hasCare: !!careData,
      hasPhotos: !!photosData,
      hasAchievements: !!achievementsData?.length,
      hasTraining: !!trainingData?.length,
      hasReviews: !!reviewsData?.length,
      hasExperiences: !!experiencesData?.length,
      hasTravel: !!travelData?.length,
      hasGallery: !!galleryData?.length,
      hasCertifications: !!certificationsData?.length,
      hasProfessional: !!professionalData
    })

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Standard letter size
    const { width, height } = page.getSize()
    
    // Get fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    const isLostPetFlyer = type === 'lost_pet'
    
    // Colors
    const titleColor = rgb(0.12, 0.23, 0.54) // Navy blue
    const redColor = rgb(0.86, 0.15, 0.15) // Red for emergencies
    const blackColor = rgb(0, 0, 0)
    const whiteColor = rgb(1, 1, 1)
    
    // Helper function to sanitize text for PDF generation
    const sanitizeTextForPDF = (text: string): string => {
      if (!text) return '';
      // Replace problematic unicode characters with safe alternatives
      return text
        .replace(/✈/g, 'TRAVEL:')
        .replace(/🏆/g, 'AWARD:')
        .replace(/🎓/g, 'TRAINING:')
        .replace(/⭐/g, 'STAR:')
        .replace(/🐾/g, 'PAW:')
        .replace(/❤️/g, 'HEART:')
        .replace(/🏠/g, 'HOME:')
        .replace(/📍/g, 'LOCATION:')
        .replace(/📞/g, 'PHONE:')
        .replace(/💊/g, 'MEDICINE:')
        .replace(/🚨/g, 'ALERT:')
        // Remove any other problematic unicode characters
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
    }
    
    // Helper function to draw multi-line text with proper spacing
    const drawMultiLineText = (page: any, text: string, x: number, y: number, maxWidth: number, fontSize: number, font: any, color: any, lineSpacing: number = 5): number => {
      if (!text) return y;
      
      const sanitizedText = sanitizeTextForPDF(text);
      const words = sanitizedText.split(' ');
      let currentLine = '';
      let currentY = y;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          // Draw the current line
          page.drawText(currentLine, {
            x: x,
            y: currentY,
            size: fontSize,
            font: font,
            color: color,
          });
          currentY -= fontSize + lineSpacing;
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      
      // Draw the last line
      if (currentLine) {
        page.drawText(currentLine, {
          x: x,
          y: currentY,
          size: fontSize,
          font: font,
          color: color,
        });
        currentY -= fontSize + lineSpacing;
      }
      
      return currentY;
    }
    
    let yPosition = height - 60
    
    // MISSING PET FLYER LAYOUT
    if (isLostPetFlyer) {
      console.log('Generating Missing Pet Flyer...')
      
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
      
      // Add optimized photos section
      if (photosData) {
        console.log('Adding photos to Missing Pet Flyer...')
        try {
          const photoHeight = 108 // 1.5 inches at 72 DPI
          const photoWidth = 144 // 2 inches at 72 DPI
          const photoSpacing = 20
          const leftPhotoX = 50
          const rightPhotoX = leftPhotoX + photoWidth + photoSpacing
          
          let photosAdded = 0
          
          // Try to add first photo (main photo)
          if (photosData.photo_url && photosAdded < 2) {
            try {
              console.log('Loading main photo:', photosData.photo_url)
              const photoResponse = await fetch(photosData.photo_url)
              if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer()
                const photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
                
                // Calculate dimensions to maintain aspect ratio
                const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                
                page.drawImage(photoImage, {
                  x: leftPhotoX + (photoWidth - scaledWidth) / 2,
                  y: yPosition - photoHeight + (photoHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                })
                photosAdded++
                console.log('Main photo added successfully')
              }
            } catch (photoError) {
              console.log('Failed to load main photo:', photoError.message)
            }
          }
          
          // Try to add second photo (full body photo)
          if (photosData.full_body_photo_url && photosAdded < 2) {
            try {
              console.log('Loading full body photo:', photosData.full_body_photo_url)
              const photoResponse = await fetch(photosData.full_body_photo_url)
              if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer()
                const photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
                
                // Calculate dimensions to maintain aspect ratio
                const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                
                const xPosition = photosAdded === 0 ? leftPhotoX : rightPhotoX
                
                page.drawImage(photoImage, {
                  x: xPosition + (photoWidth - scaledWidth) / 2,
                  y: yPosition - photoHeight + (photoHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                })
                photosAdded++
                console.log('Full body photo added successfully')
              }
            } catch (photoError) {
              console.log('Failed to load full body photo:', photoError.message)
            }
          }
          
          // Add photo placeholders if no photos could be loaded
          if (photosAdded === 0) {
            console.log('No photos loaded, adding placeholders')
            // Draw placeholder rectangles
            page.drawRectangle({
              x: leftPhotoX,
              y: yPosition - photoHeight,
              width: photoWidth,
              height: photoHeight,
              borderColor: blackColor,
              borderWidth: 2,
            })
            
            page.drawRectangle({
              x: rightPhotoX,
              y: yPosition - photoHeight,
              width: photoWidth,
              height: photoHeight,
              borderColor: blackColor,
              borderWidth: 2,
            })
            
            // Add placeholder text
            page.drawText('PHOTO', {
              x: leftPhotoX + photoWidth/2 - 30,
              y: yPosition - photoHeight/2,
              size: 16,
              font: boldFont,
              color: blackColor,
            })
            
            page.drawText('PHOTO', {
              x: rightPhotoX + photoWidth/2 - 30,
              y: yPosition - photoHeight/2,
              size: 16,
              font: boldFont,
              color: blackColor,
            })
          }
          
          // Adjust yPosition to account for photos
          yPosition -= (photoHeight + 30)
          
        } catch (photoSectionError) {
          console.error('Error in photo section:', photoSectionError)
          // Continue without photos if there's an error
          yPosition -= 20
        }
      } else {
        console.log('No photo data available')
        // Add smaller spacing if no photos
        yPosition -= 20
      }
      
      // Pet basic info in slightly smaller text to accommodate photos
      page.drawText(`${petData.name} - ${petData.breed || 'Unknown Breed'} ${petData.species || 'Pet'}`, {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: blackColor,
      })
      
      yPosition -= 35
      
      // Missing pet specific information
      if (lostPetData) {
        console.log('Adding lost pet data:', lostPetData)
        
        if (lostPetData.last_seen_location) {
          page.drawText('LAST SEEN:', {
            x: 50,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          page.drawText(lostPetData.last_seen_location, {
            x: 150,
            y: yPosition,
            size: 14,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 25
        }
        
        if (lostPetData.last_seen_date) {
          const date = new Date(lostPetData.last_seen_date).toLocaleDateString()
          page.drawText(`Date: ${date}`, {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: blackColor,
          })
          
          if (lostPetData.last_seen_time) {
            page.drawText(`Time: ${lostPetData.last_seen_time}`, {
              x: 250,
              y: yPosition,
              size: 14,
              font: boldFont,
              color: blackColor,
            })
          }
          
          yPosition -= 25
        }
        
        if (lostPetData.distinctive_features) {
          page.drawText('DISTINCTIVE FEATURES:', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: blackColor,
          })
          
          yPosition -= 18
          
          page.drawText(lostPetData.distinctive_features, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 25
        }
        
        if (lostPetData.reward_amount) {
          page.drawText('REWARD:', {
            x: 50,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          page.drawText(lostPetData.reward_amount, {
            x: 130,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: redColor,
          })
          
          yPosition -= 40
        }
      }
      
      // Pet details for identification
      yPosition -= 20
      page.drawText('PET DETAILS:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: blackColor,
      })
      
      yPosition -= 25
      
      const petDetails = [
        { label: 'Species:', value: petData.species || 'Unknown' },
        { label: 'Breed:', value: petData.breed || 'Unknown' },
        { label: 'Age:', value: petData.age || 'Unknown' },
        { label: 'Weight:', value: petData.weight || 'Unknown' },
        { label: 'Microchip:', value: petData.microchip_id || 'None' },
      ]
      
      for (const detail of petDetails) {
        page.drawText(`${detail.label} ${detail.value}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        
        yPosition -= 20
      }
      
      yPosition -= 20
      
      // Emergency contacts in large bold text
      if (contactsData) {
        page.drawText('PLEASE CONTACT:', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: redColor,
        })
        
        yPosition -= 30
        
        const contactDetails = [
          { label: 'PRIMARY:', value: contactsData.emergency_contact },
          { label: 'SECONDARY:', value: contactsData.second_emergency_contact },
          { label: 'VET:', value: contactsData.vet_contact },
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
      if (medicalData?.medical_alert) {
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
        
        if (medicalData.medical_conditions) {
          page.drawText(medicalData.medical_conditions, {
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
      // REGULAR PET PASSPORT LAYOUT
      console.log('Generating regular pet passport...')
      
      // Header
      page.drawText(type === 'emergency' ? 'EMERGENCY PET IDENTIFICATION' : 'OFFICIAL PET PASSPORT', {
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
          color: rgb(0.83, 0.69, 0.22), // Gold
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
      if (contactsData) {
        page.drawText('EMERGENCY CONTACTS', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        yPosition -= 30
        
        const contactDetails = [
          { label: 'Primary Emergency:', value: contactsData.emergency_contact },
          { label: 'Secondary Contact:', value: contactsData.second_emergency_contact },
          { label: 'Veterinarian:', value: contactsData.vet_contact },
          { label: 'Pet Caretaker:', value: contactsData.pet_caretaker },
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
      if (medicalData) {
        page.drawText('MEDICAL INFORMATION', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        yPosition -= 30

        if (medicalData.medical_alert) {
          page.drawText('! MEDICAL ALERT', {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: redColor,
          })
          yPosition -= 25
        }

        if (medicalData.medical_conditions) {
          page.drawText('Medical Conditions:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          page.drawText(medicalData.medical_conditions, {
            x: 50,
            y: yPosition - 15,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          
          yPosition -= 40
        }

        if (medicalData.medications && medicalData.medications.length > 0) {
          page.drawText('Medications:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          
          medicalData.medications.forEach((med: string, index: number) => {
            page.drawText(`• ${med}`, {
              x: 50,
              y: yPosition - 15 - (index * 15),
              size: 11,
              font: regularFont,
              color: blackColor,
            })
          })
          
          yPosition -= 15 + (medicalData.medications.length * 15) + 10
        }
      }

      // Add new pages for "full" type PDF with all additional sections
      if (type === 'full') {
        console.log('Adding additional pages for complete profile...')
        
        // Add second page for complete profile
        const page2 = pdfDoc.addPage([612, 792])
        let yPos2 = height - 60
        
        // Page 2 Header
        page2.drawText('COMPLETE PET PROFILE - PAGE 2', {
          x: 50,
          y: yPos2,
          size: 18,
          font: boldFont,
          color: titleColor,
        })
        yPos2 -= 40

        // Care Instructions
        if (careData) {
          page2.drawText('CARE INSTRUCTIONS', {
            x: 50,
            y: yPos2,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          yPos2 -= 25

          if (careData.feeding_schedule) {
            page2.drawText('Feeding Schedule:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 18 // Extra spacing after label
            yPos2 = drawMultiLineText(page2, careData.feeding_schedule, 50, yPos2, 500, 11, regularFont, blackColor, 7)
            yPos2 -= 15 // Extra spacing after content
          }

          if (careData.morning_routine) {
            page2.drawText('Morning Routine:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 18 // Extra spacing after label
            yPos2 = drawMultiLineText(page2, careData.morning_routine, 50, yPos2, 500, 11, regularFont, blackColor, 7)
            yPos2 -= 15 // Extra spacing after content
          }

          if (careData.evening_routine) {
            page2.drawText('Evening Routine:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 18 // Extra spacing after label
            yPos2 = drawMultiLineText(page2, careData.evening_routine, 50, yPos2, 500, 11, regularFont, blackColor, 7)
            yPos2 -= 15 // Extra spacing after content
          }
        }

        // Professional Data & Certifications
        if (professionalData || (certificationsData && certificationsData.length > 0)) {
          page2.drawText('PROFESSIONAL CREDENTIALS', {
            x: 50,
            y: yPos2,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          yPos2 -= 25

          if (professionalData?.support_animal_status) {
            page2.drawText(`Support Animal Status: ${professionalData.support_animal_status}`, {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 20
          }

          if (certificationsData && certificationsData.length > 0) {
            page2.drawText('Certifications:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 15

            certificationsData.forEach((cert: any) => {
              page2.drawText(`• ${cert.type} - ${cert.status} (${cert.issuer || 'N/A'})`, {
                x: 50,
                y: yPos2,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              yPos2 -= 15
            })
            yPos2 -= 10
          }
        }

        // Training & Achievements
        if ((trainingData && trainingData.length > 0) || (achievementsData && achievementsData.length > 0)) {
          page2.drawText('TRAINING & ACHIEVEMENTS', {
            x: 50,
            y: yPos2,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          yPos2 -= 25

          if (trainingData && trainingData.length > 0) {
            page2.drawText('Training:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 15

            trainingData.forEach((training: any) => {
              page2.drawText(`• ${training.course} at ${training.facility || 'N/A'} - ${training.completed || 'In Progress'}`, {
                x: 50,
                y: yPos2,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              yPos2 -= 15
            })
            yPos2 -= 10
          }

          if (achievementsData && achievementsData.length > 0) {
            page2.drawText('Achievements:', {
              x: 50,
              y: yPos2,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            yPos2 -= 15

            achievementsData.forEach((achievement: any) => {
              page2.drawText(`• ${achievement.title} - ${achievement.description || 'N/A'}`, {
                x: 50,
                y: yPos2,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              yPos2 -= 15
            })
            yPos2 -= 10
          }
        }

        // Add third page for reviews and travel
        if (yPos2 < 200 || (reviewsData && reviewsData.length > 0) || (travelData && travelData.length > 0)) {
          const page3 = pdfDoc.addPage([612, 792])
          let yPos3 = height - 60
          
          page3.drawText('COMPLETE PET PROFILE - PAGE 3', {
            x: 50,
            y: yPos3,
            size: 18,
            font: boldFont,
            color: titleColor,
          })
          yPos3 -= 40

          // Reviews Section
          if (reviewsData && reviewsData.length > 0) {
            page3.drawText('REVIEWS & TESTIMONIALS', {
              x: 50,
              y: yPos3,
              size: 16,
              font: boldFont,
              color: titleColor,
            })
            yPos3 -= 25

            reviewsData.forEach((review: any, index: number) => {
              if (index < 3) { // Limit to 3 reviews per page
                page3.drawText(`* ${review.rating}/5 - ${review.reviewer_name}`, {
                  x: 50,
                  y: yPos3,
                  size: 12,
                  font: boldFont,
                  color: blackColor,
                })
                yPos3 -= 15

                if (review.text) {
                  page3.drawText(`"${review.text}"`, {
                    x: 50,
                    y: yPos3,
                    size: 11,
                    font: regularFont,
                    color: blackColor,
                  })
                  yPos3 -= 15
                }

                page3.drawText(`${review.type || 'General'} | ${review.location || 'N/A'} | ${review.date || 'N/A'}`, {
                  x: 50,
                  y: yPos3,
                  size: 10,
                  font: regularFont,
                  color: rgb(0.5, 0.5, 0.5),
                })
                yPos3 -= 25
              }
            })
          }

          // Travel History
          if (travelData && travelData.length > 0) {
            page3.drawText('TRAVEL HISTORY', {
              x: 50,
              y: yPos3,
              size: 16,
              font: boldFont,
              color: titleColor,
            })
            yPos3 -= 25

            travelData.forEach((location: any) => {
              page3.drawText(sanitizeTextForPDF(`✈ ${location.name} (${location.type})`), {
                x: 50,
                y: yPos3,
                size: 12,
                font: boldFont,
                color: blackColor,
              })
              yPos3 -= 15

              if (location.date_visited) {
                page3.drawText(`Visited: ${location.date_visited}`, {
                  x: 50,
                  y: yPos3,
                  size: 11,
                  font: regularFont,
                  color: blackColor,
                })
                yPos3 -= 15
              }

              if (location.notes) {
                page3.drawText(location.notes, {
                  x: 50,
                  y: yPos3,
                  size: 10,
                  font: regularFont,
                  color: rgb(0.5, 0.5, 0.5),
                })
                yPos3 -= 20
              }
            })
          }

          // Experience Section
          if (experiencesData && experiencesData.length > 0) {
            page3.drawText('EXPERIENCE', {
              x: 50,
              y: yPos3,
              size: 16,
              font: boldFont,
              color: titleColor,
            })
            yPos3 -= 25

            experiencesData.forEach((exp: any) => {
              page3.drawText(`• ${exp.activity}`, {
                x: 50,
                y: yPos3,
                size: 12,
                font: boldFont,
                color: blackColor,
              })
              yPos3 -= 15

              if (exp.description) {
                page3.drawText(exp.description, {
                  x: 50,
                  y: yPos3,
                  size: 11,
                  font: regularFont,
                  color: blackColor,
                })
                yPos3 -= 15
              }

              if (exp.contact) {
                page3.drawText(`Contact: ${exp.contact}`, {
                  x: 50,
                  y: yPos3,
                  size: 10,
                  font: regularFont,
                  color: rgb(0.5, 0.5, 0.5),
                })
                yPos3 -= 20
              }
            })
          }
        }
      }

      
      // QR Code for Missing Pet Flyers - DRAW FIRST to avoid being covered
      if (type === 'lost_pet') {
        console.log('Generating QR code for missing pet...')
        const siteUrl = Deno.env.get('SITE_URL') || 'https://c2db7d2d-7448-4eaf-945e-d804d3aeaccc.lovableproject.com'
        const missingPetUrl = `${siteUrl}/missing-pet/${petId}`
        console.log('QR code target URL:', missingPetUrl)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(missingPetUrl)}`
        console.log('QR service URL:', qrCodeUrl)
        
        try {
          console.log('Fetching QR image from service...')
          const qrResponse = await fetch(qrCodeUrl)
          console.log('QR service response status:', qrResponse.status)
          
          if (qrResponse.ok) {
            const qrImageBytes = await qrResponse.arrayBuffer()
            console.log('QR image bytes received:', qrImageBytes.byteLength)
            const qrImage = await pdfDoc.embedPng(new Uint8Array(qrImageBytes))
            console.log('QR image embedded successfully')
            
            // Position QR code in bottom-right corner with GUARANTEED visibility
            const qrSize = 100
            const qrX = width - qrSize - 30
            const qrY = 120  // Well above footer
            
            // Draw bright background for maximum visibility  
            page.drawRectangle({
              x: qrX - 15,
              y: qrY - 45,
              width: qrSize + 30,
              height: qrSize + 60,
              color: rgb(1, 1, 1), // White background
              borderColor: rgb(1, 0, 0), // RED border for visibility
              borderWidth: 2,
            })
            
            // Draw QR code
            page.drawImage(qrImage, {
              x: qrX,
              y: qrY,
              width: qrSize,
              height: qrSize,
            })
            
            // Add large, visible text
            page.drawText('SCAN ME!', {
              x: qrX + 15,
              y: qrY + qrSize + 10,
              size: 14,
              font: boldFont,
              color: rgb(1, 0, 0), // RED text
            })
            
            page.drawText('For latest info', {
              x: qrX + 5,
              y: qrY - 15,
              size: 12,
              font: regularFont,
              color: blackColor,
            })
            
            page.drawText('& sharing', {
              x: qrX + 15,
              y: qrY - 30,
              size: 12,
              font: regularFont,
              color: blackColor,
            })
            
            console.log('QR code added to PDF successfully at position:', qrX, qrY)
          } else {
            console.error('QR service returned error:', qrResponse.status, await qrResponse.text())
          }
        } catch (qrError) {
          console.error('Failed to add QR code:', qrError.message, qrError.stack)
        }
      }

        // Footer
        yPosition = 50
        page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.83, 0.69, 0.22), // Gold
        })

        page.drawText('PetPort™ Official Document', {
          x: width - 200,
          y: yPosition,
          size: 10,
          font: boldFont,
          color: rgb(0.83, 0.69, 0.22), // Gold
        })
    }

    // Save the PDF as bytes
    console.log('Generating PDF bytes...')
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully for:', petData.name, 'Size:', pdfBytes.length, 'bytes')
    
    // Return JSON response with PDF data for client-side processing
    return new Response(JSON.stringify({
      success: true,
      pdfBytes: Array.from(pdfBytes), // Convert to array for JSON transport
      fileName: `${petData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${type}_profile.pdf`
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