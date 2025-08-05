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
    console.log('=== PDF Generation Started v3 ===')
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    // Handle both frontend parameter formats
    const petId = requestBody.petId || requestBody.pet_id
    const type = requestBody.type
    
    if (!petId || !type) {
      console.error('Missing petId/pet_id or type')
      return new Response(JSON.stringify({ error: 'Missing petId/pet_id or type', pdfBytes: null, filename: null }), {
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
    console.log('Fetching pet data for ID:', petId)
    const { data: petData, error: petError } = await supabaseClient
      .from('pets')
      .select('*')
      .eq('id', petId)
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

    // Fetch all related data for comprehensive PDFs
    const [
      { data: contacts },
      { data: medical },
      { data: careInstructions },
      { data: petPhotos },
      { data: galleryPhotos },
      { data: documents },
      { data: certifications },
      { data: achievements },
      { data: training },
      { data: experiences },
      { data: reviews },
      { data: travelLocations },
      { data: professionalData },
      { data: lostPetData }
    ] = await Promise.all([
      supabaseClient.from('contacts').select('*').eq('pet_id', petId),
      supabaseClient.from('medical').select('*').eq('pet_id', petId),
      supabaseClient.from('care_instructions').select('*').eq('pet_id', petId),
      supabaseClient.from('pet_photos').select('*').eq('pet_id', petId),
      supabaseClient.from('gallery_photos').select('*').eq('pet_id', petId),
      supabaseClient.from('documents').select('*').eq('pet_id', petId),
      supabaseClient.from('certifications').select('*').eq('pet_id', petId),
      supabaseClient.from('achievements').select('*').eq('pet_id', petId),
      supabaseClient.from('training').select('*').eq('pet_id', petId),
      supabaseClient.from('experiences').select('*').eq('pet_id', petId),
      supabaseClient.from('reviews').select('*').eq('pet_id', petId),
      supabaseClient.from('travel_locations').select('*').eq('pet_id', petId),
      supabaseClient.from('professional_data').select('*').eq('pet_id', petId),
      supabaseClient.from('lost_pet_data').select('*').eq('pet_id', petId)
    ])

    console.log('Fetched data for type:', type)

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

    // Helper function to add medical alert
    const addMedicalAlert = (medicalData: any) => {
      if (medicalData && medicalData.length > 0 && medicalData[0]?.medical_alert) {
        page.drawText('🚨 MEDICAL ALERT 🚨', {
          x: margin,
          y: currentY,
          font: boldFont,
          size: 16,
          color: rgb(0.8, 0, 0), // Red color for alert
        })
        currentY -= 24
      }
    }

    // Helper function to create a new page when needed
    const checkPageSpace = (requiredSpace: number) => {
      if (currentY - requiredSpace < 50) {
        const newPage = pdfDoc.addPage()
        currentY = newPage.getSize().height - 50
        return newPage
      }
      return page
    }

    // PDF Generation based on type
    if (type === 'emergency') {
      addTitle('🚨 EMERGENCY PET PROFILE 🚨')
      
      // Medical Alert - Most Important
      addMedicalAlert(medical)
      
      addSectionTitle('Pet Identification')
      addKeyValuePair('Name', petData.name || 'N/A')
      addKeyValuePair('Species', petData.species || 'N/A')
      addKeyValuePair('Breed', petData.breed || 'N/A')
      addKeyValuePair('Age', petData.age || 'N/A')
      addKeyValuePair('Weight', petData.weight || 'N/A')
      addKeyValuePair('PetPort ID', petData.petport_id || 'N/A')
      addKeyValuePair('Microchip ID', petData.microchip_id || 'N/A')
      currentY -= 12

      // Emergency Contacts
      addSectionTitle('Emergency Contacts')
      if (contacts && contacts.length > 0) {
        const contact = contacts[0]
        addKeyValuePair('Emergency Contact', contact.emergency_contact || 'N/A')
        addKeyValuePair('Second Emergency', contact.second_emergency_contact || 'N/A')
        addKeyValuePair('Veterinarian', contact.vet_contact || 'N/A')
        addKeyValuePair('Pet Caretaker', contact.pet_caretaker || 'N/A')
      }
      currentY -= 12

      // Medical Information
      if (medical && medical.length > 0) {
        addSectionTitle('Medical Information')
        const medInfo = medical[0]
        if (medInfo.medical_alert) {
          addText('⚠️ HAS MEDICAL ALERT - SEE CONDITIONS BELOW')
        }
        addKeyValuePair('Medical Conditions', medInfo.medical_conditions || 'None')
        if (medInfo.medications && medInfo.medications.length > 0) {
          addKeyValuePair('Medications', medInfo.medications.join(', '))
        }
        addKeyValuePair('Last Vaccination', medInfo.last_vaccination || 'N/A')
      }

    } else if (type === 'full') {
      addTitle(`Complete Profile - ${petData.name}`)
      
      // Pet Information
      addSectionTitle('Pet Information')
      addKeyValuePair('Name', petData.name || 'N/A')
      addKeyValuePair('PetPort ID', petData.petport_id || 'N/A')
      addKeyValuePair('Species', petData.species || 'N/A')
      addKeyValuePair('Breed', petData.breed || 'N/A')
      addKeyValuePair('Age', petData.age || 'N/A')
      addKeyValuePair('Weight', petData.weight || 'N/A')
      addKeyValuePair('Microchip ID', petData.microchip_id || 'N/A')
      addKeyValuePair('State/County', `${petData.state || ''} ${petData.county || ''}`.trim() || 'N/A')
      currentY -= 12

      if (petData.bio) {
        addSectionTitle('Biography')
        addText(petData.bio)
        currentY -= 12
      }

      // Medical Alert Check
      addMedicalAlert(medical)

      // Contact Information
      checkPageSpace(120)
      addSectionTitle('Contact Information')
      if (contacts && contacts.length > 0) {
        const contact = contacts[0]
        addKeyValuePair('Emergency Contact', contact.emergency_contact || 'N/A')
        addKeyValuePair('Second Emergency', contact.second_emergency_contact || 'N/A')
        addKeyValuePair('Veterinarian', contact.vet_contact || 'N/A')
        addKeyValuePair('Pet Caretaker', contact.pet_caretaker || 'N/A')
      }
      currentY -= 12

      // Medical Information
      if (medical && medical.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Medical Information')
        const medInfo = medical[0]
        if (medInfo.medical_alert) {
          addText('⚠️ MEDICAL ALERT: This pet has medical conditions requiring attention')
        }
        addKeyValuePair('Medical Conditions', medInfo.medical_conditions || 'None')
        if (medInfo.medications && medInfo.medications.length > 0) {
          addKeyValuePair('Current Medications', medInfo.medications.join(', '))
        }
        addKeyValuePair('Last Vaccination', medInfo.last_vaccination || 'N/A')
        currentY -= 12
      }

      // Care Instructions
      if (careInstructions && careInstructions.length > 0) {
        checkPageSpace(200)
        addSectionTitle('Care Instructions')
        const care = careInstructions[0]
        if (care.feeding_schedule) addKeyValuePair('Feeding Schedule', care.feeding_schedule)
        if (care.morning_routine) addKeyValuePair('Morning Routine', care.morning_routine)
        if (care.evening_routine) addKeyValuePair('Evening Routine', care.evening_routine)
        if (care.allergies) addKeyValuePair('Allergies', care.allergies)
        if (care.behavioral_notes) addKeyValuePair('Behavioral Notes', care.behavioral_notes)
        if (care.favorite_activities) addKeyValuePair('Favorite Activities', care.favorite_activities)
        currentY -= 12
      }

      // Certifications
      if (certifications && certifications.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Certifications')
        certifications.forEach(cert => {
          addKeyValuePair('Type', cert.type)
          addKeyValuePair('Status', cert.status)
          addKeyValuePair('Issuer', cert.issuer || 'N/A')
          addKeyValuePair('Issue Date', cert.issue_date || 'N/A')
          addKeyValuePair('Expiry Date', cert.expiry_date || 'N/A')
          if (cert.certification_number) addKeyValuePair('Number', cert.certification_number)
          currentY -= 8
        })
        currentY -= 12
      }

      // Training
      if (training && training.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Training')
        training.forEach(course => {
          addKeyValuePair('Course', course.course)
          addKeyValuePair('Facility', course.facility || 'N/A')
          addKeyValuePair('Phone', course.phone || 'N/A')
          addKeyValuePair('Completed', course.completed || 'In Progress')
          currentY -= 8
        })
        currentY -= 12
      }

      // Achievements
      if (achievements && achievements.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Achievements')
        achievements.forEach(achievement => {
          addKeyValuePair('Title', achievement.title)
          if (achievement.description) addText(`Description: ${achievement.description}`)
          currentY -= 8
        })
        currentY -= 12
      }

      // Travel History
      if (travelLocations && travelLocations.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Travel History')
        travelLocations.forEach(location => {
          addKeyValuePair('Location', `${location.name} (${location.type})`)
          addKeyValuePair('Date Visited', location.date_visited || 'N/A')
          if (location.notes) addText(`Notes: ${location.notes}`)
          currentY -= 8
        })
        currentY -= 12
      }

      // Reviews & Testimonials
      if (reviews && reviews.length > 0) {
        checkPageSpace(120)
        addSectionTitle('Reviews & Testimonials')
        reviews.forEach(review => {
          addKeyValuePair('Reviewer', review.reviewer_name)
          addKeyValuePair('Rating', `${review.rating}/5 stars`)
          addKeyValuePair('Type', review.type || 'General')
          if (review.text) addText(`"${review.text}"`)
          if (review.reviewer_contact) addKeyValuePair('Contact', review.reviewer_contact)
          currentY -= 8
        })
      }

    } else if (type === 'lost_pet') {
      addTitle('🚨 MISSING PET ALERT 🚨')
      
      addSectionTitle('Pet Information')
      addKeyValuePair('Name', petData.name || 'N/A')
      addKeyValuePair('Species', petData.species || 'N/A')
      addKeyValuePair('Breed', petData.breed || 'N/A')
      addKeyValuePair('Age', petData.age || 'N/A')
      addKeyValuePair('Weight', petData.weight || 'N/A')
      addKeyValuePair('PetPort ID', petData.petport_id || 'N/A')
      currentY -= 12

      if (lostPetData && lostPetData.length > 0) {
        const lostInfo = lostPetData[0]
        addSectionTitle('Missing Information')
        addKeyValuePair('Last Seen Location', lostInfo.last_seen_location || 'N/A')
        addKeyValuePair('Last Seen Date', lostInfo.last_seen_date ? new Date(lostInfo.last_seen_date).toLocaleDateString() : 'N/A')
        addKeyValuePair('Last Seen Time', lostInfo.last_seen_time || 'N/A')
        if (lostInfo.distinctive_features) addKeyValuePair('Distinctive Features', lostInfo.distinctive_features)
        if (lostInfo.reward_amount) addKeyValuePair('Reward', lostInfo.reward_amount)
        currentY -= 12
      }

      // Contact Information
      addSectionTitle('Contact Information - URGENT')
      if (contacts && contacts.length > 0) {
        const contact = contacts[0]
        addKeyValuePair('Primary Contact', contact.emergency_contact || 'N/A')
        addKeyValuePair('Secondary Contact', contact.second_emergency_contact || 'N/A')
      }

    } else if (type === 'care') {
      addTitle(`Care Instructions - ${petData.name}`)
      
      if (careInstructions && careInstructions.length > 0) {
        const care = careInstructions[0]
        
        if (care.feeding_schedule) {
          addSectionTitle('Feeding Schedule')
          addText(care.feeding_schedule)
          currentY -= 12
        }
        
        if (care.morning_routine) {
          addSectionTitle('Morning Routine')
          addText(care.morning_routine)
          currentY -= 12
        }
        
        if (care.evening_routine) {
          addSectionTitle('Evening Routine')
          addText(care.evening_routine)
          currentY -= 12
        }
        
        if (care.allergies) {
          addSectionTitle('Allergies & Restrictions')
          addText(care.allergies)
          currentY -= 12
        }
        
        if (care.behavioral_notes) {
          addSectionTitle('Behavioral Notes')
          addText(care.behavioral_notes)
          currentY -= 12
        }
        
        if (care.favorite_activities) {
          addSectionTitle('Favorite Activities')
          addText(care.favorite_activities)
          currentY -= 12
        }
      }

      // Include medical information for care
      if (medical && medical.length > 0) {
        const medInfo = medical[0]
        addSectionTitle('Medical Care')
        if (medInfo.medical_alert) {
          addText('⚠️ MEDICAL ALERT: Special care required')
        }
        if (medInfo.medical_conditions) addKeyValuePair('Conditions', medInfo.medical_conditions)
        if (medInfo.medications && medInfo.medications.length > 0) {
          addKeyValuePair('Medications', medInfo.medications.join(', '))
        }
      }

    } else if (type === 'gallery') {
      addTitle(`Photo Gallery - ${petData.name}`)
      
      addSectionTitle('Profile Photos')
      if (petPhotos && petPhotos.length > 0) {
        addText('Profile photo and full body photo available in digital version')
      }
      
      if (galleryPhotos && galleryPhotos.length > 0) {
        addSectionTitle(`Gallery Photos (${galleryPhotos.length} photos)`)
        galleryPhotos.forEach((photo, index) => {
          addText(`Photo ${index + 1}: ${photo.caption || 'No caption'}`)
        })
      }
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
