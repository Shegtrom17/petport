
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

    // Fetch pet data with all related tables for full profile
    const { data: petData, error: fetchError } = await supabase
      .from('pets')
      .select(`
        *,
        pet_photos (photo_url, full_body_photo_url),
        professional_data (support_animal_status, badges),
        medical (medical_alert, medical_conditions, medications, last_vaccination),
        contacts (emergency_contact, second_emergency_contact, vet_contact, pet_caretaker),
        care_instructions (feeding_schedule, morning_routine, evening_routine, allergies, behavioral_notes, favorite_activities),
        experiences (activity, contact, description),
        achievements (title, description),
        training (course, facility, phone, completed),
        reviews (reviewer_name, rating, text, date, location, type),
        travel_locations (name, type, code, date_visited, notes),
        documents (name, type, file_url, size)
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
    console.log('Care instructions data:', JSON.stringify(petData.care_instructions, null, 2))
    console.log('Pet photos raw data from query:', JSON.stringify(petData.pet_photos, null, 2))
    
    // Extract photo data consistently
    const photoData = {
      photo_url: petData.pet_photos?.[0]?.photo_url || null,
      full_body_photo_url: petData.pet_photos?.[0]?.full_body_photo_url || null
    }
    console.log('✅ Extracted photo data:', JSON.stringify(photoData, null, 2))
    console.log('🔍 Photo URLs check:')
    console.log('  - Profile photo URL exists:', !!photoData.photo_url)
    console.log('  - Full body photo URL exists:', !!photoData.full_body_photo_url)
    console.log('  - Profile photo URL:', photoData.photo_url)
    console.log('  - Full body photo URL:', photoData.full_body_photo_url)

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
    
  // Add photos if available for Emergency PDF
if (photoData) {
  try {
    // Profile photo - left side
    if (photoData.photo_url) {
      console.log('🖼️ Processing profile photo...');
      console.log('  - Original URL:', photoData.photo_url);
      
      const photoUrl = photoData.photo_url.startsWith('http') 
        ? photoData.photo_url 
        : `${SUPABASE_URL}/storage/v1/object/public/${photoData.photo_url}`;
      
      console.log('  - Final URL:', photoUrl);
      console.log('  - URL starts with http:', photoData.photo_url.startsWith('http'));
      console.log('  - SUPABASE_URL:', SUPABASE_URL);
        
      console.log('📡 Fetching profile photo...');
      const photoResponse = await fetch(photoUrl, {
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Profile photo fetch response:');
      console.log('  - Status:', photoResponse.status);
      console.log('  - Status text:', photoResponse.statusText);
      console.log('  - Headers:', [...photoResponse.headers.entries()]);

      if (!photoResponse.ok) {
        console.error('❌ Profile photo fetch failed:', photoResponse.status, photoResponse.statusText);
        console.error('  - URL attempted:', photoUrl);
        return;
      }

      const photoBytes = new Uint8Array(await photoResponse.arrayBuffer());
      console.log('📦 Emergency PDF profile photo binary data size:', photoBytes.length, 'bytes');
      const isJpg = photoData.photo_url.toLowerCase().includes('.jpg')
      const photoImage = isJpg 
        ? await pdfDoc.embedJpg(photoBytes)
        : await pdfDoc.embedPng(photoBytes)

      // Position on left side
      page.drawImage(photoImage, {
        x: 50,  // Left margin
        y: height - 150,  // From top
        width: 100,
        height: 100
      })
    }

    // Full body photo - right side
    if (photoData.full_body_photo_url) {
      console.log('🖼️ Processing full body photo...');
      console.log('  - Original URL:', photoData.full_body_photo_url);
      
      const photoUrl = photoData.full_body_photo_url.startsWith('http') 
        ? photoData.full_body_photo_url 
        : `${SUPABASE_URL}/storage/v1/object/public/${photoData.full_body_photo_url}`;
        
      console.log('  - Final URL:', photoUrl);
      console.log('  - URL starts with http:', photoData.full_body_photo_url.startsWith('http'));
        
      console.log('📡 Fetching full body photo...');
      const photoResponse = await fetch(photoUrl, {
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Full body photo fetch response:');
      console.log('  - Status:', photoResponse.status);
      console.log('  - Status text:', photoResponse.statusText);
      console.log('  - Headers:', [...photoResponse.headers.entries()]);

      if (!photoResponse.ok) {
        console.error('❌ Full body photo fetch failed:', photoResponse.status, photoResponse.statusText);
        console.error('  - URL attempted:', photoUrl);
        return;
      }

      const photoBytes = new Uint8Array(await photoResponse.arrayBuffer());
      console.log('📦 Emergency PDF full body photo binary data size:', photoBytes.length, 'bytes');
      const isJpg = photoData.full_body_photo_url.toLowerCase().includes('.jpg')
      const bodyPhotoImage = isJpg 
        ? await pdfDoc.embedJpg(photoBytes)
        : await pdfDoc.embedPng(photoBytes)

      // Position on right side
      page.drawImage(bodyPhotoImage, {
        x: width - 150,  // Right margin
        y: height - 150,  // From top
        width: 100,
        height: 100
      })
    }
  } catch (error) {
    console.log('Error processing photos:', error)
  }
}

    
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
      // Calculate text height for proper box sizing
      const alertText = petData.medical.medical_conditions
      const textWidth = width - 140 // Account for padding
      const lines = Math.ceil(regularFont.widthOfTextAtSize(alertText, 11) / textWidth)
      const textHeight = lines * 14 // 14px line height
      const boxHeight = Math.max(textHeight + 35, 50) // Minimum 50px height
      
      page.drawRectangle({
        x: 50,
        y: yPosition - boxHeight + 20,
        width: width - 100,
        height: boxHeight,
        color: rgb(1, 0.95, 0.8), // Light yellow background
        borderColor: rgb(0.96, 0.62, 0.06), // Orange border
        borderWidth: 2,
      })
      
      // Center the title text horizontally
      const titleWidth = boldFont.widthOfTextAtSize('MEDICAL ALERT', 14)
      const titleX = 50 + (width - 100 - titleWidth) / 2
      
      page.drawText('MEDICAL ALERT', {
        x: titleX,
        y: yPosition - 5,
        size: 14,
        font: boldFont,
        color: redColor,
      })
      
      yPosition -= 25
      
      page.drawText(alertText, {
        x: 70,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: blackColor,
        maxWidth: width - 140,
      })
      
      yPosition -= (boxHeight - 15)
    }
    
    // Emergency Contacts Section - Compact layout
    const contacts = [
      { label: 'Primary:', value: petData.contacts?.emergency_contact || '' },
      { label: 'Secondary:', value: petData.contacts?.second_emergency_contact || '' },
      { label: 'Veterinarian:', value: petData.contacts?.vet_contact || '' },
    ]
    
    // Calculate actual contacts to show
    const validContacts = contacts.filter(contact => contact.value)
    const contactsHeight = Math.max(validContacts.length * 16 + 35, 60) // Minimum 60px height
    
    page.drawRectangle({
      x: 50,
      y: yPosition - contactsHeight + 20,
      width: width - 100,
      height: contactsHeight,
      color: rgb(0.99, 0.89, 0.89), // Light red background
      borderColor: redColor,
      borderWidth: 2,
    })
    
    page.drawText('EMERGENCY CONTACTS', {
      x: 60,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: redColor,
    })
    
    yPosition -= 20
    
    for (const contact of validContacts) {
      page.drawText(contact.label, {
        x: 70,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: blackColor,
      })
      
      page.drawText(contact.value, {
        x: 140,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: blackColor,
      })
      
      yPosition -= 16
    }
    
    yPosition -= 20
    
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
    
    // FULL PROFILE ADDITIONAL CONTENT
    if (!isEmergency) {
      // Create additional pages for full profile
      let currentPage = page
      let currentY = yPosition
      
      // Helper function to add new page if needed
      const addNewPageIfNeeded = (requiredSpace = 100) => {
        if (currentY < requiredSpace) {
          currentPage = pdfDoc.addPage([612, 792])
          currentY = height - 60
        }
      }
      
     // Photos Section for Full PDF
if (photoData) {
  addNewPageIfNeeded(200)  // Make sure we have room for photos
  currentPage.drawText('IDENTIFICATION PHOTOS', {
    x: 50,
    y: currentY,
    size: 16,
    font: boldFont,
    color: titleColor,
  })

  currentY -= 40

  try {
    // Profile photo - left side
    if (photoData.photo_url) {
      console.log('🖼️ Processing profile photo for FULL PDF...');
      console.log('  - Original URL:', photoData.photo_url);
      
      const photoUrl = photoData.photo_url.startsWith('http') 
        ? photoData.photo_url 
        : `${SUPABASE_URL}/storage/v1/object/public/${photoData.photo_url}`;
        
      console.log('  - Final URL:', photoUrl);
      console.log('  - URL starts with http:', photoData.photo_url.startsWith('http'));
      console.log('  - SUPABASE_URL:', SUPABASE_URL);
        
      console.log('📡 Fetching profile photo for full PDF...');
      const photoResponse = await fetch(photoUrl, {
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Full PDF profile photo fetch response:');
      console.log('  - Status:', photoResponse.status);
      console.log('  - Status text:', photoResponse.statusText);
      console.log('  - Headers:', [...photoResponse.headers.entries()]);

      if (!photoResponse.ok) {
        console.error('❌ Full PDF profile photo fetch failed:', photoResponse.status, photoResponse.statusText);
        console.error('  - URL attempted:', photoUrl);
        return;
      }

      const photoBytes = new Uint8Array(await photoResponse.arrayBuffer());
      console.log('📦 Profile photo binary data size:', photoBytes.length, 'bytes');
      const isJpg = photoData.photo_url.toLowerCase().includes('.jpg')
      const photoImage = isJpg 
        ? await pdfDoc.embedJpg(photoBytes)
        : await pdfDoc.embedPng(photoBytes)

      currentPage.drawImage(photoImage, {
        x: 50,
        y: currentY - 120,
        width: 200,
        height: 200
      })

      currentPage.drawText('Official Profile Photo', {
        x: 80,
        y: currentY - 140,
        size: 12,
        font: boldFont,
        color: blackColor,
      })
    }

    // Full body photo - right side
    if (photoData.full_body_photo_url) {
      console.log('🖼️ Processing full body photo for FULL PDF...');
      console.log('  - Original URL:', photoData.full_body_photo_url);
      
      const photoUrl = photoData.full_body_photo_url.startsWith('http') 
        ? photoData.full_body_photo_url 
        : `${SUPABASE_URL}/storage/v1/object/public/${photoData.full_body_photo_url}`;
        
      console.log('  - Final URL:', photoUrl);
      console.log('  - URL starts with http:', photoData.full_body_photo_url.startsWith('http'));
        
      console.log('📡 Fetching full body photo for full PDF...');
      const photoResponse = await fetch(photoUrl, {
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Full PDF full body photo fetch response:');
      console.log('  - Status:', photoResponse.status);
      console.log('  - Status text:', photoResponse.statusText);
      console.log('  - Headers:', [...photoResponse.headers.entries()]);

      if (!photoResponse.ok) {
        console.error('❌ Full PDF full body photo fetch failed:', photoResponse.status, photoResponse.statusText);
        console.error('  - URL attempted:', photoUrl);
        return;
      }

      const photoBytes = new Uint8Array(await photoResponse.arrayBuffer());
      console.log('📦 Full PDF full body photo binary data size:', photoBytes.length, 'bytes');
      const isJpg = photoData.full_body_photo_url.toLowerCase().includes('.jpg')
      const bodyPhotoImage = isJpg 
        ? await pdfDoc.embedJpg(photoBytes)
        : await pdfDoc.embedPng(photoBytes)

      currentPage.drawImage(bodyPhotoImage, {
        x: width - 250,
        y: currentY - 120,
        width: 200,
        height: 200
      })

      currentPage.drawText('Full Body Identification', {
        x: width - 220,
        y: currentY - 140,
        size: 12,
        font: boldFont,
        color: blackColor,
      })
    }

    currentY -= 250  // Move down past photos
  } catch (error) {
    console.log('Error processing photos for full PDF:', error)
    currentY -= 40
  }
}

      
      // About Section
      if (petData.bio) {
        addNewPageIfNeeded(100)
        currentPage.drawText('ABOUT', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 25
        
        const bioLines = petData.bio.match(/.{1,80}(\s|$)/g) || [petData.bio]
        for (const line of bioLines) {
          currentPage.drawText(line.trim(), {
            x: 70,
            y: currentY,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          currentY -= 15
        }
        
        currentY -= 20
      }
      
      // Care Instructions Section
      if (petData.care_instructions) {
        // care_instructions is an object, not an array
        const care = Array.isArray(petData.care_instructions) ? petData.care_instructions[0] : petData.care_instructions
        addNewPageIfNeeded(300)
        
        currentPage.drawText('CARE INSTRUCTIONS', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 35
        
        // Feeding Schedule subsection
        if (care.feeding_schedule) {
          addNewPageIfNeeded(80)
          currentPage.drawText('Feeding Schedule', {
            x: 70,
            y: currentY,
            size: 13,
            font: boldFont,
            color: rgb(0.2, 0.4, 0.7),
          })
          currentY -= 20
          
          const feedingLines = care.feeding_schedule.match(/.{1,65}(\s|$)/g) || [care.feeding_schedule]
          for (const line of feedingLines) {
            currentPage.drawText(`• ${line.trim()}`, {
              x: 90,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          currentY -= 15
        }
        
        // Daily Routine subsection
        if (care.morning_routine || care.evening_routine) {
          addNewPageIfNeeded(100)
          currentPage.drawText('Daily Routine', {
            x: 70,
            y: currentY,
            size: 13,
            font: boldFont,
            color: rgb(0.2, 0.4, 0.7),
          })
          currentY -= 20
          
          if (care.morning_routine) {
            currentPage.drawText('Morning Routine:', {
              x: 90,
              y: currentY,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentY -= 18
            
            const morningLines = care.morning_routine.match(/.{1,60}(\s|$)/g) || [care.morning_routine]
            for (const line of morningLines) {
              currentPage.drawText(`• ${line.trim()}`, {
                x: 110,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
            currentY -= 10
          }
          
          if (care.evening_routine) {
            currentPage.drawText('Evening Routine:', {
              x: 90,
              y: currentY,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentY -= 18
            
            const eveningLines = care.evening_routine.match(/.{1,60}(\s|$)/g) || [care.evening_routine]
            for (const line of eveningLines) {
              currentPage.drawText(`• ${line.trim()}`, {
                x: 110,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
            currentY -= 10
          }
          
          if (care.favorite_activities) {
            currentPage.drawText('Regular Activities:', {
              x: 90,
              y: currentY,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentY -= 18
            
            const activityLines = care.favorite_activities.match(/.{1,60}(\s|$)/g) || [care.favorite_activities]
            for (const line of activityLines) {
              currentPage.drawText(`• ${line.trim()}`, {
                x: 110,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
            currentY -= 10
          }
          
          currentY -= 15
        }
        
        // Emergency Important Notes subsection
        if (care.allergies || care.behavioral_notes) {
          addNewPageIfNeeded(100)
          currentPage.drawText('Emergency Important Notes', {
            x: 70,
            y: currentY,
            size: 13,
            font: boldFont,
            color: rgb(0.7, 0.2, 0.2),
          })
          currentY -= 20
          
          if (care.allergies) {
            currentPage.drawText('Food Restrictions & Allergies:', {
              x: 90,
              y: currentY,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentY -= 18
            
            const allergyLines = care.allergies.match(/.{1,60}(\s|$)/g) || [care.allergies]
            for (const line of allergyLines) {
              currentPage.drawText(`! ${line.trim()}`, {
                x: 110,
                y: currentY,
                size: 11,
                font: regularFont,
                color: rgb(0.7, 0.2, 0.2),
              })
              currentY -= 15
            }
            currentY -= 10
          }
          
          if (care.behavioral_notes) {
            currentPage.drawText('Special Needs & Important Warnings:', {
              x: 90,
              y: currentY,
              size: 12,
              font: boldFont,
              color: blackColor,
            })
            currentY -= 18
            
            const behaviorLines = care.behavioral_notes.match(/.{1,60}(\s|$)/g) || [care.behavioral_notes]
            for (const line of behaviorLines) {
              currentPage.drawText(`! ${line.trim()}`, {
                x: 110,
                y: currentY,
                size: 11,
                font: regularFont,
                color: rgb(0.7, 0.2, 0.2),
              })
              currentY -= 15
            }
            currentY -= 10
          }
          
          currentY -= 15
        }
        
        currentY -= 20
      }
      
      // Training & Certifications Section
      if (petData.training && petData.training.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('TRAINING & CERTIFICATIONS', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const training of petData.training) {
          addNewPageIfNeeded(60)
          currentPage.drawText(`• ${training.course}`, {
            x: 70,
            y: currentY,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          currentY -= 18
          
          if (training.facility) {
            currentPage.drawText(`  Facility: ${training.facility}`, {
              x: 80,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          
          if (training.completed) {
            currentPage.drawText(`  Completed: ${training.completed}`, {
              x: 80,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          
          currentY -= 10
        }
        
        currentY -= 20
      }
      
      // Achievements Section
      if (petData.achievements && petData.achievements.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('ACHIEVEMENTS', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const achievement of petData.achievements) {
          addNewPageIfNeeded(60)
          currentPage.drawText(`• ${achievement.title}`, {
            x: 70,
            y: currentY,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          currentY -= 18
          
          if (achievement.description) {
            const lines = achievement.description.match(/.{1,70}(\s|$)/g) || [achievement.description]
            for (const line of lines) {
              currentPage.drawText(`  ${line.trim()}`, {
                x: 80,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
          }
          
          currentY -= 10
        }
        
        currentY -= 20
      }
      
      // Experiences Section
      if (petData.experiences && petData.experiences.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('EXPERIENCES', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const experience of petData.experiences) {
          addNewPageIfNeeded(60)
          currentPage.drawText(`• ${experience.activity}`, {
            x: 70,
            y: currentY,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          currentY -= 18
          
          if (experience.contact) {
            currentPage.drawText(`  Contact: ${experience.contact}`, {
              x: 80,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          
          if (experience.description) {
            const lines = experience.description.match(/.{1,70}(\s|$)/g) || [experience.description]
            for (const line of lines) {
              currentPage.drawText(`  ${line.trim()}`, {
                x: 80,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
          }
          
          currentY -= 10
        }
        
        currentY -= 20
      }
      
      // Reviews Section
      if (petData.reviews && petData.reviews.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('REVIEWS & REFERENCES', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const review of petData.reviews) {
          addNewPageIfNeeded(100)
          currentPage.drawText(`${review.reviewer_name} - ${review.rating}/5 stars`, {
            x: 70,
            y: currentY,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          currentY -= 18
          
          if (review.location && review.date) {
            currentPage.drawText(`${review.location} - ${review.date}`, {
              x: 70,
              y: currentY,
              size: 10,
              font: regularFont,
              color: rgb(0.4, 0.4, 0.4),
            })
            currentY -= 15
          }
          
          if (review.text) {
            const lines = review.text.match(/.{1,70}(\s|$)/g) || [review.text]
            for (const line of lines) {
              currentPage.drawText(`"${line.trim()}"`, {
                x: 80,
                y: currentY,
                size: 11,
                font: regularFont,
                color: blackColor,
              })
              currentY -= 15
            }
          }
          
          currentY -= 15
        }
        
        currentY -= 20
      }
      
      // Travel History Section
      if (petData.travel_locations && petData.travel_locations.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('TRAVEL HISTORY', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const location of petData.travel_locations) {
          addNewPageIfNeeded(40)
          currentPage.drawText(`• ${location.name}`, {
            x: 70,
            y: currentY,
            size: 12,
            font: boldFont,
            color: blackColor,
          })
          currentY -= 18
          
          const details = []
          if (location.type && location.code) details.push(`${location.type.toUpperCase()}: ${location.code}`)
          if (location.date_visited) details.push(`Visited: ${location.date_visited}`)
          
          if (details.length > 0) {
            currentPage.drawText(`  ${details.join(' - ')}`, {
              x: 80,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          
          if (location.notes) {
            currentPage.drawText(`  Notes: ${location.notes}`, {
              x: 80,
              y: currentY,
              size: 11,
              font: regularFont,
              color: blackColor,
            })
            currentY -= 15
          }
          
          currentY -= 10
        }
        
        currentY -= 20
      }
      
      // Medical History Section (Extended)
      if (petData.medical?.last_vaccination) {
        addNewPageIfNeeded(60)
        
        currentPage.drawText('MEDICAL HISTORY', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        currentPage.drawText(`Last Vaccination: ${petData.medical.last_vaccination}`, {
          x: 70,
          y: currentY,
          size: 12,
          font: regularFont,
          color: blackColor,
        })
        
        currentY -= 30
      }
      
      // Documents Section
      if (petData.documents && petData.documents.length > 0) {
        addNewPageIfNeeded(100)
        
        currentPage.drawText('DOCUMENTS ON FILE', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const document of petData.documents) {
          addNewPageIfNeeded(30)
          currentPage.drawText(`• ${document.name}`, {
            x: 70,
            y: currentY,
            size: 11,
            font: regularFont,
            color: blackColor,
          })
          currentY -= 15
          
          currentPage.drawText(`  Type: ${document.type.toUpperCase()}`, {
            x: 80,
            y: currentY,
            size: 10,
            font: regularFont,
            color: rgb(0.4, 0.4, 0.4),
          })
          currentY -= 15
        }
        
        currentY -= 20
      }
      
      // Professional Badges
      if (petData.professional_data?.badges && petData.professional_data.badges.length > 0) {
        addNewPageIfNeeded(80)
        
        currentPage.drawText('PROFESSIONAL CERTIFICATIONS', {
          x: 50,
          y: currentY,
          size: 16,
          font: boldFont,
          color: titleColor,
        })
        
        currentY -= 30
        
        for (const badge of petData.professional_data.badges) {
          currentPage.drawText(`• ${badge}`, {
            x: 70,
            y: currentY,
            size: 12,
            font: regularFont,
            color: rgb(0.1, 0.6, 0.1),
          })
          currentY -= 20
        }
      }
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
    
    // 🔍 INSPECTION: Check PDF bytes generation
    console.log('📊 PDF BYTES INSPECTION:')
    console.log('  - PDF byte array type:', typeof pdfBytes)
    console.log('  - PDF byte array length:', pdfBytes.length)
    console.log('  - PDF byte array constructor:', pdfBytes.constructor.name)
    console.log('  - First 10 bytes:', Array.from(pdfBytes.slice(0, 10)))
    console.log('  - PDF signature check (should start with %PDF):', 
      String.fromCharCode(...pdfBytes.slice(0, 4)))
    
    // ✅ FIX: Return PDF bytes as ArrayBuffer which Supabase client handles correctly
    console.log('🔧 RETURNING PDF AS ARRAYBUFFER FOR SUPABASE CLIENT')
    
    return new Response(pdfBytes.buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
      },
      status: 200,
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
