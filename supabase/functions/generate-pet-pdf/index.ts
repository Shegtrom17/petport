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

    if (type && !['emergency', 'full', 'lost_pet', 'care', 'gallery'].includes(type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Type must be either "emergency", "full", "lost_pet", "care", or "gallery"',
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
      
      console.log('Sanitizing text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      
      try {
        // Remove all emojis and non-ASCII characters completely
        let sanitized = text
          // Fix newline characters
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
          // Remove ALL non-ASCII characters (anything above code point 127)
          .replace(/[^\x00-\x7F]/g, '')
          // Clean up whitespace
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('Text sanitized successfully, length:', sanitized.length);
        return sanitized;
        
      } catch (error) {
        console.error('Error sanitizing text:', error);
        // Fallback: return only ASCII alphanumeric characters and basic punctuation
        return text.replace(/[^a-zA-Z0-9\s\.\,\!\?\-\(\)]/g, '').replace(/\s+/g, ' ').trim();
      }
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
          // Single row 3-photo layout for cleaner missing pet flyer
          const photoHeight = 100
          const photoWidth = 133
          const photoSpacing = 15
          const leftPhotoX = 50
          const rightPhotoX = leftPhotoX + photoWidth + photoSpacing // 198
          const centerPhotoX = rightPhotoX + photoWidth + photoSpacing // 346
          const topRowY = yPosition
          
          let photosAdded = 0
          const maxPhotos = 3 // Allow up to 3 photos in single row
          
          // Try to add first photo (main photo) - top-left
          if (photosData.photo_url && photosAdded < maxPhotos) {
            try {
              console.log('Loading main photo:', photosData.photo_url)
              const photoResponse = await fetch(photosData.photo_url)
              if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer()
                let photoImage
                try {
                  photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
                } catch (jpgError) {
                  console.log('JPG failed, trying PNG for main photo')
                  photoImage = await pdfDoc.embedPng(new Uint8Array(photoBytes))
                }
                
                // Calculate dimensions to maintain aspect ratio
                const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                
                page.drawImage(photoImage, {
                  x: leftPhotoX + (photoWidth - scaledWidth) / 2,
                  y: topRowY - photoHeight + (photoHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                })
                photosAdded++
                console.log('Main photo added successfully (top-left)')
              }
            } catch (photoError) {
              console.log('Failed to load main photo:', photoError.message)
            }
          }
          
          // Try to add second photo (full body photo) - center
          if (photosData.full_body_photo_url && photosAdded < maxPhotos) {
            try {
              console.log('Loading full body photo:', photosData.full_body_photo_url)
              const photoResponse = await fetch(photosData.full_body_photo_url)
              if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer()
                let photoImage
                try {
                  photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
                } catch (jpgError) {
                  console.log('JPG failed, trying PNG for full body photo')
                  photoImage = await pdfDoc.embedPng(new Uint8Array(photoBytes))
                }
                
                // Calculate dimensions to maintain aspect ratio
                const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                
                page.drawImage(photoImage, {
                  x: rightPhotoX + (photoWidth - scaledWidth) / 2,
                  y: topRowY - photoHeight + (photoHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                })
                photosAdded++
                console.log('Full body photo added successfully (center)')
              }
            } catch (photoError) {
              console.log('Failed to load full body photo:', photoError.message)
            }
          }
          
          // Try to add third photo (first gallery photo) - right
          if (galleryData && galleryData.length > 0 && photosAdded < maxPhotos) {
            try {
              const firstGalleryPhoto = galleryData[0]
              console.log('Loading first gallery photo:', firstGalleryPhoto.url)
              const photoResponse = await fetch(firstGalleryPhoto.url)
              if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer()
                let photoImage
                try {
                  photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
                } catch (jpgError) {
                  console.log('JPG failed, trying PNG for gallery photo')
                  photoImage = await pdfDoc.embedPng(new Uint8Array(photoBytes))
                }
                
                // Calculate dimensions to maintain aspect ratio
                const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                
                page.drawImage(photoImage, {
                  x: centerPhotoX + (photoWidth - scaledWidth) / 2,
                  y: topRowY - photoHeight + (photoHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                })
                photosAdded++
                console.log('Gallery photo added successfully (right)')
              }
            } catch (photoError) {
              console.log('Failed to load gallery photo:', photoError.message)
            }
          }
          
          // Add photo placeholders for missing photos
          const positions = [
            { x: leftPhotoX, y: topRowY, label: 'MAIN PHOTO' },
            { x: rightPhotoX, y: topRowY, label: 'FULL BODY' },
            { x: centerPhotoX, y: topRowY, label: 'GALLERY' }
          ]
          
          for (let i = photosAdded; i < 3; i++) {
            const pos = positions[i]
            // Draw placeholder rectangle
            page.drawRectangle({
              x: pos.x,
              y: pos.y - photoHeight,
              width: photoWidth,
              height: photoHeight,
              borderColor: blackColor,
              borderWidth: 2,
            })
            
            // Add placeholder text
            page.drawText(pos.label, {
              x: pos.x + photoWidth/2 - (pos.label.length * 4),
              y: pos.y - photoHeight/2,
              size: 10,
              font: boldFont,
              color: blackColor,
            })
          }
          
          // Adjust yPosition to account for single-row photo layout
          yPosition -= (photoHeight + 30)
          
        } catch (photoSectionError) {
          console.error('Error in photo section:', photoSectionError)
          // Continue without photos if there's an error
          yPosition -= 30
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
          
          yPosition = drawMultiLineText(page, lostPetData.last_seen_location, 150, yPosition, 400, 14, regularFont, blackColor, 6)
          yPosition -= 15
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
        yPosition -= 10
        
        page.drawText('MEDICAL ALERT - NEEDS MEDICATION', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: redColor,
        })
        
        yPosition -= 25
        
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
      page.drawText(`Pet ID: ${petData.petport_id || 'N/A'} | Generated: ${new Date().toLocaleDateString()} | Generated by Petport.app`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: blackColor,
      })
      
    } else if (type === 'gallery') {
      // CLEAN PHOTO-ONLY GALLERY LAYOUT
      console.log('Generating photo gallery PDF...')
      
      if (!galleryData || galleryData.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'No gallery photos found for this pet',
            pdfBytes: null,
            filename: null 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Gallery layout configuration - 4 photos per page (2x2 grid)
      const photosPerPage = 4
      const photoWidth = 250
      const photoHeight = 200
      const spacing = 40
      const margin = 50
      
      // Calculate grid positions - 2x2 layout with proper spacing from top
      const leftX = margin
      const rightX = leftX + photoWidth + spacing
      const startY = height - 120 // Same spacing as missing pet PDF
      const topY = startY - photoHeight
      const bottomY = startY - (2 * photoHeight) - spacing
      
      console.log(`Gallery layout: startY=${startY}, topY=${topY}, bottomY=${bottomY}, leftX=${leftX}, rightX=${rightX}`)
      
      let currentPage = page
      let photosProcessed = 0
      let pageNumber = 1
      
      console.log(`Processing ${galleryData.length} gallery photos...`)
      
      for (let i = 0; i < galleryData.length; i += photosPerPage) {
        // Add new page if needed (except for first page)
        if (i > 0) {
          currentPage = pdfDoc.addPage([612, 792])
          pageNumber++
        }
        
        // Process up to 4 photos on this page in 2x2 grid
        const pagePhotos = galleryData.slice(i, i + photosPerPage)
        
        for (let j = 0; j < pagePhotos.length; j++) {
          const photo = pagePhotos[j]
          
          try {
            console.log(`Processing photo ${i + j + 1}/${galleryData.length}: ${photo.url}`)
            
            const response = await fetch(photo.url)
            if (!response.ok) {
              console.log(`Failed to fetch photo ${i + j + 1}, skipping...`)
              continue
            }
            
            const imageBytes = await response.arrayBuffer()
            let image
            
            try {
              image = await pdfDoc.embedJpg(new Uint8Array(imageBytes))
            } catch (jpgError) {
              try {
                image = await pdfDoc.embedPng(new Uint8Array(imageBytes))
              } catch (pngError) {
                console.log(`Failed to embed photo ${i + j + 1}, skipping...`)
                continue
              }
            }
            
            // Calculate position in 2x2 grid
            const isLeft = j % 2 === 0
            const isTop = j < 2
            
            const photoX = isLeft ? leftX : rightX
            const photoY = isTop ? topY : bottomY
            
            // Scale image to fit while maintaining aspect ratio
            const { width: imgWidth, height: imgHeight } = image.scale(1)
            const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
            const scaledWidth = imgWidth * scale
            const scaledHeight = imgHeight * scale
            
            // Center the image in its allocated space
            const centeredX = photoX + (photoWidth - scaledWidth) / 2
            const centeredY = photoY + (photoHeight - scaledHeight) / 2
            
            currentPage.drawImage(image, {
              x: centeredX,
              y: centeredY,
              width: scaledWidth,
              height: scaledHeight,
            })
            
            photosProcessed++
            console.log(`Successfully processed photo ${photosProcessed}`)
            
          } catch (error) {
            console.log(`Error processing photo ${i + j + 1}: ${error.message}`)
          }
        }
        
        // Add minimal footer with page number
        currentPage.drawText(`Page ${pageNumber} | Generated: ${new Date().toLocaleDateString()} | Generated by Petport.app`, {
          x: 50,
          y: 20,
          size: 10,
          font: regularFont,
          color: blackColor,
        })
      }
      
      console.log(`Gallery PDF generation complete. Processed ${photosProcessed} photos across ${pageNumber} pages.`)
      
    } else {
      // REGULAR PET PASSPORT LAYOUT
      console.log('Generating regular pet passport...')
      
      // Header
      let headerText = 'OFFICIAL PET PASSPORT'
      if (type === 'emergency') headerText = 'EMERGENCY PET IDENTIFICATION'
      if (type === 'care') headerText = 'COMPLETE CARE INSTRUCTIONS'
      
      page.drawText(headerText, {
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

      // Add care instructions section for "care" type PDF with auto page break
      if (type === 'care') {
        console.log('Adding care instructions with improved spacing and page break support...')
        
        let currentPage = page
        let currentYPosition = yPosition
        
        // Function to check if we need a new page
        const checkNewPage = (neededSpace: number) => {
          if (currentYPosition - neededSpace < 80) { // Bottom margin
            console.log('Adding new page for care instructions...')
            currentPage = pdfDoc.addPage([612, 792])
            currentYPosition = height - 60
            
            // Add page header
            currentPage.drawText(`${petData.name} - Care Instructions (Page 2)`, {
              x: 50,
              y: currentYPosition,
              size: 16,
              font: boldFont,
              color: titleColor,
            })
            currentYPosition -= 40
          }
        }
        
        if (careData) {
          console.log('Care data fields:', Object.keys(careData))
          
          // Add more spacing before care section
          currentYPosition -= 40
          
          // Care Instructions Header
          checkNewPage(50)
          currentPage.drawText('DAILY CARE SCHEDULE', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 30
          
          // Feeding Schedule
          if (careData.feeding_schedule) {
            const feedingLines = careData.feeding_schedule.split('\n').filter(line => line.trim())
            checkNewPage(50 + (feedingLines.length * 15))
            
            currentPage.drawText('Feeding Schedule:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            feedingLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
          
          // Morning Routine
          if (careData.morning_routine) {
            const morningLines = careData.morning_routine.split('\n').filter(line => line.trim())
            checkNewPage(50 + (morningLines.length * 15))
            
            currentPage.drawText('Morning Routine:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            morningLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
          
          // Evening Routine
          if (careData.evening_routine) {
            const eveningLines = careData.evening_routine.split('\n').filter(line => line.trim())
            checkNewPage(50 + (eveningLines.length * 15))
            
            currentPage.drawText('Evening Routine:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            eveningLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
          
          // Important Notes Section
          checkNewPage(80)
          currentYPosition -= 20
          currentPage.drawText('IMPORTANT NOTES & ALERTS', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 30
          
          // Allergies
          if (careData.allergies) {
            const allergyLines = careData.allergies.split('\n').filter(line => line.trim())
            checkNewPage(50 + (allergyLines.length * 15))
            
            currentPage.drawText('Allergies & Restrictions:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            allergyLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`! ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
          
          // Behavioral Notes
          if (careData.behavioral_notes) {
            const behaviorLines = careData.behavioral_notes.split('\n').filter(line => line.trim())
            checkNewPage(50 + (behaviorLines.length * 15))
            
            currentPage.drawText('Behavioral Notes:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            behaviorLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
          
          // Favorite Activities
          if (careData.favorite_activities) {
            const activityLines = careData.favorite_activities.split('\n').filter(line => line.trim())
            checkNewPage(50 + (activityLines.length * 15))
            
            currentPage.drawText('Favorite Activities:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            activityLines.forEach((line) => {
              checkNewPage(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
        }
      }
      
      // Add new pages for "full" type PDF with all additional sections
      if (type === 'full') {
        console.log('Adding additional pages for complete profile...')
        
        // Initialize universal page management system
        let currentPage = page
        let currentYPosition = yPosition
        let currentPageNum = 1
        
        // Universal checkNewPage function for Complete Profile PDF
        const checkNewPageComplete = (neededSpace: number) => {
          if (currentYPosition - neededSpace < 80) { // Bottom margin
            currentPageNum++
            console.log(`Adding new page ${currentPageNum} for complete profile...`)
            
            // Add footer to current page before creating new one
            currentPage.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
              x: 50,
              y: 30,
              size: 8,
              font: regularFont,
              color: rgb(0.5, 0.5, 0.5),
            })
            
            currentPage.drawText(`Pet Profile Document - Page ${currentPageNum - 1}`, {
              x: width - 200,
              y: 30,
              size: 8,
              font: regularFont,
              color: rgb(0.5, 0.5, 0.5),
            })
            
            // Create new page
            currentPage = pdfDoc.addPage([612, 792])
            currentYPosition = height - 60
            
            // Add page header
            currentPage.drawText(`COMPLETE PET PROFILE - PAGE ${currentPageNum}`, {
              x: 50,
              y: currentYPosition,
              size: 18,
              font: boldFont,
              color: titleColor,
            })
            currentYPosition -= 40
          }
        }

        // Enhanced photo loading function with JPG/PNG fallback
        const loadPhotoWithFallback = async (photoUrl: string, logPrefix: string) => {
          if (!photoUrl) return null
          
          try {
            console.log(`${logPrefix}: Attempting to load photo: ${photoUrl}`)
            const response = await fetch(photoUrl)
            if (!response.ok) {
              console.log(`${logPrefix}: Failed to fetch photo (${response.status})`)
              return null
            }
            
            const photoBytes = await response.arrayBuffer()
            console.log(`${logPrefix}: Photo loaded successfully, size: ${photoBytes.byteLength} bytes`)
            
            // Try JPG first, then PNG fallback
            try {
              const photoImage = await pdfDoc.embedJpg(new Uint8Array(photoBytes))
              console.log(`${logPrefix}: Photo embedded as JPG successfully`)
              return photoImage
            } catch (jpgError) {
              console.log(`${logPrefix}: JPG embedding failed, trying PNG...`)
              try {
                const photoImage = await pdfDoc.embedPng(photoBytes)
                console.log(`${logPrefix}: Photo embedded as PNG successfully`)
                return photoImage
              } catch (pngError) {
                console.log(`${logPrefix}: Both JPG and PNG embedding failed`)
                return null
              }
            }
          } catch (error) {
            console.log(`${logPrefix}: Photo loading error:`, error.message)
            return null
          }
        }

        // Care Instructions Section with dynamic page breaks
        if (careData) {
          console.log('Adding care instructions with improved spacing...')
          console.log('Care data fields:', Object.keys(careData))
          
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('CARE INSTRUCTIONS', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          if (careData.feeding_schedule) {
            checkNewPageComplete(50)
            currentPage.drawText('Feeding Schedule:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const feedingLines = careData.feeding_schedule.split('\n').filter(line => line.trim())
            feedingLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (careData.morning_routine) {
            checkNewPageComplete(50)
            currentPage.drawText('Morning Routine:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const morningLines = careData.morning_routine.split('\n').filter(line => line.trim())
            morningLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (careData.evening_routine) {
            checkNewPageComplete(50)
            currentPage.drawText('Evening Routine:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const eveningLines = careData.evening_routine.split('\n').filter(line => line.trim())
            eveningLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (careData.allergies) {
            checkNewPageComplete(50)
            currentPage.drawText('Allergies & Restrictions:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const allergyLines = careData.allergies.split('\n').filter(line => line.trim())
            allergyLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`! ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (careData.behavioral_notes) {
            checkNewPageComplete(50)
            currentPage.drawText('Behavioral Notes:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const behaviorLines = careData.behavioral_notes.split('\n').filter(line => line.trim())
            behaviorLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (careData.favorite_activities) {
            checkNewPageComplete(50)
            currentPage.drawText('Favorite Activities:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
            
            const activityLines = careData.favorite_activities.split('\n').filter(line => line.trim())
            activityLines.forEach((line) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${line.trim()}`, {
                x: 70,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
        }

        // Professional Data & Certifications with dynamic page breaks
        if (professionalData || (certificationsData && certificationsData.length > 0)) {
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('PROFESSIONAL CREDENTIALS', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          if (professionalData?.support_animal_status) {
            checkNewPageComplete(30)
            currentPage.drawText(`Support Animal Status: ${professionalData.support_animal_status}`, {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 20
          }

          if (certificationsData && certificationsData.length > 0) {
            checkNewPageComplete(50 + (certificationsData.length * 15))
            currentPage.drawText('Certifications:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            certificationsData.forEach((cert: any) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${cert.type} - ${cert.status} (${cert.issuer || 'N/A'})`, {
                x: 50,
                y: currentYPosition,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
        }

        // Training & Achievements with dynamic page breaks
        if ((trainingData && trainingData.length > 0) || (achievementsData && achievementsData.length > 0)) {
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('TRAINING & ACHIEVEMENTS', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          if (trainingData && trainingData.length > 0) {
            checkNewPageComplete(50 + (trainingData.length * 15))
            currentPage.drawText('Training:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            trainingData.forEach((training: any) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${training.course} at ${training.facility || 'N/A'} - ${training.completed || 'In Progress'}`, {
                x: 50,
                y: currentYPosition,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }

          if (achievementsData && achievementsData.length > 0) {
            checkNewPageComplete(50 + (achievementsData.length * 15))
            currentPage.drawText('Achievements:', {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            achievementsData.forEach((achievement: any) => {
              checkNewPageComplete(20)
              currentPage.drawText(`• ${achievement.title} - ${achievement.description || 'N/A'}`, {
                x: 50,
                y: currentYPosition,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            })
            currentYPosition -= 10
          }
        }

        // Reviews & Testimonials with dynamic page breaks
        if (reviewsData && reviewsData.length > 0) {
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('REVIEWS & TESTIMONIALS', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          reviewsData.forEach((review: any) => {
            // Calculate space needed for this review
            const reviewLines = review.text ? Math.ceil(review.text.length / 80) : 0
            const neededSpace = 80 + (reviewLines * 15)
            
            checkNewPageComplete(neededSpace)
            
            currentPage.drawText(`★ ${review.rating}/5 - ${review.reviewer_name}`, {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            if (review.text) {
              const reviewTextLines = review.text.split('\n').filter(line => line.trim())
              reviewTextLines.forEach((line) => {
                checkNewPageComplete(20)
                currentPage.drawText(`"${line.trim()}"`, {
                  x: 50,
                  y: currentYPosition,
                  size: 11,
                  font: regularFont,
                  color: blackColor,
                })
                currentYPosition -= 15
              })
            }

            checkNewPageComplete(20)
            currentPage.drawText(`${review.type || 'General'} | ${review.location || 'N/A'} | ${review.date || 'N/A'}`, {
              x: 50,
              y: currentYPosition,
              size: 10,
              font: regularFont,
              color: rgb(0.5, 0.5, 0.5),
            })
            currentYPosition -= 25
          })
        }

        // Travel History with dynamic page breaks
        if (travelData && travelData.length > 0) {
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('TRAVEL HISTORY', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          travelData.forEach((location: any) => {
            checkNewPageComplete(80)
            
            currentPage.drawText(sanitizeTextForPDF(`✈ ${location.name} (${location.type})`), {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            if (location.date_visited) {
              checkNewPageComplete(20)
              currentPage.drawText(`Visited: ${location.date_visited}`, {
                x: 50,
                y: currentYPosition,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentYPosition -= 15
            }

            if (location.notes) {
              checkNewPageComplete(25)
              currentPage.drawText(location.notes, {
                x: 50,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
              })
              currentYPosition -= 20
            }
            
            currentYPosition -= 15
          })
          
          currentYPosition -= 20
        }

        // Experience Section with dynamic page breaks
        if (experiencesData && experiencesData.length > 0) {
          currentYPosition -= 20
          checkNewPageComplete(50)
          
          currentPage.drawText('EXPERIENCE', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 25

          experiencesData.forEach((exp: any) => {
            // Calculate space needed for this experience
            const descLines = exp.description ? Math.ceil(exp.description.length / 80) : 0
            const neededSpace = 80 + (descLines * 15)
            
            checkNewPageComplete(neededSpace)
            
            currentPage.drawText(`• ${exp.activity}`, {
              x: 50,
              y: currentYPosition,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentYPosition -= 15

            if (exp.description) {
              const descLines = exp.description.split('\n').filter(line => line.trim())
              descLines.forEach((line) => {
                checkNewPageComplete(20)
                currentPage.drawText(line.trim(), {
                  x: 50,
                  y: currentYPosition,
                  size: 11,
                  font: regularFont,
                  color: blackColor,
                })
                currentYPosition -= 15
              })
            }

            if (exp.contact) {
              checkNewPageComplete(25)
              currentPage.drawText(`Contact: ${exp.contact}`, {
                x: 50,
                y: currentYPosition,
                size: 10,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
              })
              currentYPosition -= 20
            }
            
            currentYPosition -= 10
          })
        }

        // Enhanced Photo Gallery Section with dynamic page management
        if (photosData || galleryData) {
          console.log('Adding enhanced photo gallery section to complete profile...')
          
          currentYPosition -= 20
          checkNewPageComplete(200) // Ensure space for gallery section
          
          currentPage.drawText('PHOTO GALLERY', {
            x: 50,
            y: currentYPosition,
            size: 16,
            font: boldFont,
            color: titleColor,
          })
          currentYPosition -= 35

          // Gallery layout - 3 photos per row, 2 rows per page (6 photos per page)
          const photoWidth = 120
          const photoHeight = 90
          const photoSpacing = 25
          const photosPerRow = 3
          const rowsPerPage = 2
          const photosPerPage = photosPerRow * rowsPerPage

          let allPhotos = []
          
          // Collect all available photos
          if (photosData?.photo_url) allPhotos.push({ url: photosData.photo_url, type: 'profile' })
          if (photosData?.full_body_photo_url) allPhotos.push({ url: photosData.full_body_photo_url, type: 'full_body' })
          if (galleryData && galleryData.length > 0) {
            galleryData.forEach(photo => {
              if (photo.url) allPhotos.push({ url: photo.url, type: 'gallery', caption: photo.caption })
            })
          }

          // Process photos in batches for each page
          for (let photoIndex = 0; photoIndex < allPhotos.length; photoIndex += photosPerPage) {
            const pagePhotos = allPhotos.slice(photoIndex, photoIndex + photosPerPage)
            
            // If this isn't the first batch and we need more space, create new page
            if (photoIndex > 0) {
              checkNewPageComplete(300)
            }

            for (let i = 0; i < pagePhotos.length; i++) {
              const photo = pagePhotos[i]
              const row = Math.floor(i / photosPerRow)
              const col = i % photosPerRow
              
              const photoX = 50 + (col * (photoWidth + photoSpacing))
              const photoY = currentYPosition - (row * (photoHeight + photoSpacing + 20)) // Extra space for captions
              
              try {
                console.log(`Loading gallery photo ${photoIndex + i + 1}: ${photo.url}`)
                const photoImage = await loadPhotoWithFallback(photo.url, `Gallery photo ${photoIndex + i + 1}`)
                
                if (photoImage) {
                  const { width: imgWidth, height: imgHeight } = photoImage.scale(1)
                  const scale = Math.min(photoWidth / imgWidth, photoHeight / imgHeight)
                  const scaledWidth = imgWidth * scale
                  const scaledHeight = imgHeight * scale
                  
                  currentPage.drawImage(photoImage, {
                    x: photoX + (photoWidth - scaledWidth) / 2,
                    y: photoY - scaledHeight,
                    width: scaledWidth,
                    height: scaledHeight,
                  })
                  
                  // Add caption if available
                  if (photo.caption) {
                    currentPage.drawText(photo.caption.substring(0, 20), {
                      x: photoX,
                      y: photoY - scaledHeight - 15,
                      size: 8,
                      font: regularFont,
                      color: rgb(0.5, 0.5, 0.5),
                    })
                  }
                  
                  console.log(`Gallery photo ${photoIndex + i + 1} added successfully`)
                }
              } catch (photoError) {
                console.log(`Failed to load gallery photo ${photoIndex + i + 1}:`, photoError.message)
              }
            }
            
            // Update Y position after this batch
            const rowsUsed = Math.ceil(pagePhotos.length / photosPerRow)
            currentYPosition -= (rowsUsed * (photoHeight + photoSpacing + 20)) + 30
          }
        }


        // Add footer to final page
        currentPage.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
          x: 50,
          y: 30,
          size: 8,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
        })
        
        currentPage.drawText(`Pet Profile Document - Page ${currentPageNum}`, {
          x: width - 200,
          y: 30,
          size: 8,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
        })
        
        console.log(`Complete Profile PDF generated with ${currentPageNum} pages.`)
            
            // Page Footer
            currentPage.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
              x: 50,
              y: 50,
              size: 10,
              font: regularFont,
              color: rgb(0.83, 0.69, 0.22),
            })

            currentPage.drawText(`PetPort™ Official Document - Page ${currentPageNum}`, {
              x: width - 280,
              y: 50,
              size: 10,
              font: boldFont,
              color: rgb(0.83, 0.69, 0.22),
            })
          }
      }

      // QR Code for Missing Pet Flyers - DRAW FIRST to avoid being covered
      if (type === 'lost_pet') {
        console.log('Generating QR code for missing pet...')
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
            
            // Draw clean white background for QR code visibility  
            page.drawRectangle({
              x: qrX - 15,
              y: qrY - 45,
              width: qrSize + 30,
              height: qrSize + 60,
              color: rgb(1, 1, 1), // White background
              borderColor: rgb(0, 0, 0), // Black border instead of red
              borderWidth: 1,
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

        page.drawText('Generated by Petport.app', {
          x: width / 2 - 70,
          y: 30,
          size: 10,
          font: regularFont,
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