
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PetData {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  microchip_id: string;
  pet_pass_id: string;
  photo_url: string;
  full_body_photo_url: string;
  vet_contact: string;
  emergency_contact: string;
  second_emergency_contact: string;
  pet_caretaker: string;
  medical_alert: boolean;
  medical_conditions: string;
  medications: string[];
  last_vaccination: string;
  notes: string;
}

function generatePetPDF(petData: PetData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PetPass - ${petData.name}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        .pet-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
            margin: 5px 0;
        }
        .pet-id { 
            font-size: 14px; 
            color: #666; 
            margin: 5px 0;
        }
        .section { 
            margin-bottom: 20px; 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 5px;
        }
        .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 5px;
        }
        .emergency { 
            background-color: #fef2f2; 
            border-color: #ef4444;
        }
        .emergency .section-title { 
            color: #ef4444;
        }
        .medical-alert { 
            background-color: #fef2f2; 
            border: 2px solid #ef4444; 
            color: #991b1b;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px;
        }
        .field { 
            margin-bottom: 8px;
        }
        .field-label { 
            font-weight: bold; 
            color: #555;
        }
        .field-value { 
            margin-left: 10px;
        }
        .photo-section {
            text-align: center;
            margin: 20px 0;
        }
        .photo {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            border: 2px solid #ddd;
        }
        .medications {
            background-color: #f8fafc;
            padding: 10px;
            border-radius: 5px;
            margin-top: 5px;
        }
        .medication-item {
            padding: 3px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PetPass Digital Passport</h1>
        <div class="pet-name">${petData.name}</div>
        <div class="pet-id">ID: ${petData.pet_pass_id}</div>
        <div class="pet-id">Microchip: ${petData.microchip_id}</div>
    </div>

    ${petData.photo_url ? `
    <div class="photo-section">
        <img src="${petData.photo_url}" alt="${petData.name}" class="photo" />
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="grid">
            <div class="field">
                <span class="field-label">Species:</span>
                <span class="field-value">${petData.species || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Breed:</span>
                <span class="field-value">${petData.breed || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Age:</span>
                <span class="field-value">${petData.age || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Weight:</span>
                <span class="field-value">${petData.weight || 'Not specified'}</span>
            </div>
        </div>
        ${petData.notes ? `
        <div class="field">
            <span class="field-label">Notes:</span>
            <div class="field-value">${petData.notes}</div>
        </div>
        ` : ''}
    </div>

    ${petData.medical_alert ? `
    <div class="section medical-alert">
        <div class="section-title">⚠️ MEDICAL ALERT</div>
        <div style="font-weight: bold; font-size: 16px;">${petData.medical_conditions}</div>
    </div>
    ` : ''}

    <div class="section emergency">
        <div class="section-title">Emergency Contacts</div>
        <div class="field">
            <span class="field-label">Primary Emergency:</span>
            <span class="field-value">${petData.emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Secondary Emergency:</span>
            <span class="field-value">${petData.second_emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Veterinarian:</span>
            <span class="field-value">${petData.vet_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Pet Caretaker:</span>
            <span class="field-value">${petData.pet_caretaker || 'Not provided'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Medical Information</div>
        <div class="field">
            <span class="field-label">Last Vaccination:</span>
            <span class="field-value">${petData.last_vaccination || 'Not recorded'}</span>
        </div>
        ${petData.medications && petData.medications.length > 0 ? `
        <div class="field">
            <span class="field-label">Current Medications:</span>
            <div class="medications">
                ${petData.medications.map(med => `<div class="medication-item">${med}</div>`).join('')}
            </div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This document contains important information for ${petData.name}'s care and emergency situations.
    </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { petId } = await req.json();
    
    if (!petId) {
      return new Response(
        JSON.stringify({ error: 'Pet ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating PDF for pet:', petId);

    // Fetch pet data with all related information
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (petError || !pet) {
      console.error('Error fetching pet:', petError);
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch related data
    const [
      contactsResponse,
      medicalResponse,
      photosResponse
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('medical').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('pet_photos').select('*').eq('pet_id', petId).maybeSingle()
    ]);

    // Combine data
    const petData: PetData = {
      id: pet.id,
      name: pet.name,
      breed: pet.breed || '',
      species: pet.species || '',
      age: pet.age || '',
      weight: pet.weight || '',
      microchip_id: pet.microchip_id || '',
      pet_pass_id: pet.pet_pass_id || '',
      photo_url: photosResponse.data?.photo_url || '',
      full_body_photo_url: photosResponse.data?.full_body_photo_url || '',
      vet_contact: contactsResponse.data?.vet_contact || '',
      emergency_contact: contactsResponse.data?.emergency_contact || '',
      second_emergency_contact: contactsResponse.data?.second_emergency_contact || '',
      pet_caretaker: contactsResponse.data?.pet_caretaker || '',
      medical_alert: medicalResponse.data?.medical_alert || false,
      medical_conditions: medicalResponse.data?.medical_conditions || '',
      medications: medicalResponse.data?.medications || [],
      last_vaccination: medicalResponse.data?.last_vaccination || '',
      notes: pet.notes || ''
    };

    // Generate HTML content
    const htmlContent = generatePetPDF(petData);
    
    // Convert HTML to PDF using a simple HTML-to-PDF approach
    // For now, we'll store the HTML and later implement proper PDF conversion
    const fileName = `${petId}/pet-passport-${Date.now()}.html`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet_pdfs')
      .upload(fileName, new Blob([htmlContent], { type: 'text/html' }), {
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pet_pdfs')
      .getPublicUrl(fileName);

    console.log('PDF generated successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl: publicUrl,
        fileName: fileName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
