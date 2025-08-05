import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sanitizeText } from '@/utils/inputSanitizer';

export interface ClientPDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  blob?: Blob; // Alias for compatibility
  fileName?: string;
  error?: string;
  type?: string;
}

// Create a temporary React component for PDF generation
const createPetProfileHTML = (petData: any, type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' = 'emergency') => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  const emergencyContacts = petData.emergency_contacts || [];
  const primaryContact = emergencyContacts[0] || {};
  
  let content = '';
  
  if (type === 'lost_pet') {
    content = `
      <style>
        @page {
          margin: 20mm 15mm 35mm 15mm;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        .section {
          page-break-inside: avoid;
          margin-bottom: 30px;
          min-height: 80px;
        }
        
        .contact-section {
          page-break-inside: avoid;
          margin-bottom: 25px;
          min-height: 100px;
        }
        
        .reward-section {
          page-break-inside: avoid;
          margin-top: 40px;
          min-height: 80px;
        }
        
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .contact-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .reward-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      </style>
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div class="section" style="text-align: center; margin-bottom: 30px; border: 3px solid #dc2626; padding: 20px; background: #fef2f2;">
          <h1 style="color: #dc2626; font-size: 36px; margin: 0; font-weight: bold;">🚨 MISSING PET ALERT</h1>
          <h2 style="color: #dc2626; font-size: 28px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div class="section" style="display: flex; gap: 30px; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">PET INFORMATION</h3>
            <p><strong>Name:</strong> ${safeText(petData.name)}</p>
            <p><strong>Breed:</strong> ${safeText(petData.breed)}</p>
            <p><strong>Age:</strong> ${safeText(petData.age)}</p>
            <p><strong>Weight:</strong> ${safeText(petData.weight)}</p>
            <p><strong>Color:</strong> ${safeText(petData.color)}</p>
            <p><strong>Gender:</strong> ${safeText(petData.gender)}</p>
            ${petData.microchip_id ? `<p><strong>Microchip:</strong> ${safeText(petData.microchip_id)}</p>` : ''}
          </div>
          
          <div class="contact-section" style="flex: 1;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">EMERGENCY CONTACT</h3>
            <p><strong>Owner:</strong> ${safeText(primaryContact.name || 'Contact via PetPort')}</p>
            ${primaryContact.phone ? `<p><strong>Phone:</strong> ${safeText(primaryContact.phone)}</p>` : ''}
            ${primaryContact.email ? `<p><strong>Email:</strong> ${safeText(primaryContact.email)}</p>` : ''}
            <p><strong>PetPort ID:</strong> ${safeText(petData.id)}</p>
          </div>
        </div>
        
        ${petData.bio ? `
          <div class="section" style="margin-bottom: 20px;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">DESCRIPTION</h3>
            <p>${safeText(petData.bio)}</p>
          </div>
        ` : ''}
        
        <div class="reward-section" style="text-align: center; background: #fef2f2; padding: 20px; border: 2px solid #dc2626; margin-top: 30px;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0;">REWARD OFFERED</h3>
          <p style="font-size: 18px; margin: 0;">Please contact immediately if found!</p>
          <p style="font-size: 14px; margin: 10px 0 0 0;">Generated from PetPort Digital Pet Passport</p>
        </div>
      </div>
    `;
  } else if (type === 'emergency') {
    // Enhanced Emergency PDF with comprehensive emergency information
    const vetContact = petData.vetContact || '';
    const emergencyContact = petData.emergencyContact || '';
    const secondEmergencyContact = petData.secondEmergencyContact || '';
    const medications = petData.medications || [];
    const allergies = petData.careInstructions?.allergies || '';
    const medicalAlert = petData.medicalAlert || false;
    const petCaretaker = petData.petCaretaker || '';
    
    content = `
      <style>
        @page {
          margin: 20mm 15mm 35mm 15mm;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        .emergency-section {
          page-break-inside: avoid;
          margin-bottom: 30px;
          min-height: 120px;
          orphans: 3;
          widows: 3;
        }
        
        .contact-card {
          page-break-inside: avoid;
          margin-bottom: 20px;
          min-height: 60px;
          orphans: 2;
          widows: 2;
          break-inside: avoid;
        }
        
        .medical-section {
          page-break-inside: avoid;
          margin-bottom: 30px;
          min-height: 100px;
        }
        
        .pet-info-section {
          page-break-inside: avoid;
          margin-bottom: 25px;
          min-height: 80px;
        }
        
        .contact-group {
          page-break-inside: avoid;
          margin-bottom: 35px;
          min-height: 150px;
        }
        
        .section-spacer {
          height: 25px;
          page-break-inside: avoid;
        }
        
        .page-buffer {
          height: 40px;
          page-break-inside: avoid;
        }
        
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .emergency-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 25px;
          }
          
          .contact-card {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 15px;
          }
          
          .medical-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .pet-info-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      </style>
      <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white; line-height: 1.3;">
        <!-- Emergency Header -->
        <div class="emergency-section" style="text-align: center; margin-bottom: 20px; border: 3px solid #dc2626; padding: 15px; background: #fef2f2;">
          <h1 style="color: #dc2626; font-size: 26px; margin: 0; font-weight: bold;">🚨 EMERGENCY PROFILE</h1>
          <h2 style="color: #dc2626; font-size: 22px; margin: 5px 0; font-weight: bold;">${safeText(petData.name)}</h2>
          ${petData.microchipId ? `<p style="margin: 3px 0; font-size: 16px; font-weight: bold;">Microchip: ${safeText(petData.microchipId)}</p>` : ''}
        </div>
        
        <!-- Pet Photo Section -->
        ${petData.photoUrl ? `
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="${petData.photoUrl}" alt="${safeText(petData.name)}" style="max-width: 200px; max-height: 200px; border: 3px solid #dc2626; border-radius: 8px;">
          </div>
        ` : ''}
        
        <!-- Critical Medical Alert -->
        ${medicalAlert || medications.length > 0 || allergies ? `
          <div style="margin-bottom: 25px; background: #fee2e2; padding: 20px; border: 3px solid #dc2626; border-radius: 8px;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">⚠️ CRITICAL MEDICAL INFORMATION</h3>
            
            ${medicalAlert ? `
              <div style="background: #fca5a5; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #7f1d1d;">MEDICAL ALERT ACTIVE</p>
              </div>
            ` : ''}
            
            ${medications.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px;">MEDICATIONS:</h4>
                ${medications.map((med: string) => `<p style="margin: 2px 0; padding-left: 10px;">• ${safeText(med)}</p>`).join('')}
              </div>
            ` : ''}
            
            ${allergies ? `
              <div style="margin-bottom: 10px;">
                <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px;">ALLERGIES:</h4>
                <p style="margin: 0; padding-left: 10px; font-weight: bold;">${safeText(allergies)}</p>
              </div>
            ` : ''}
            
            ${petData.medicalConditions ? `
              <div>
                <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px;">MEDICAL CONDITIONS:</h4>
                <p style="margin: 0; padding-left: 10px;">${safeText(petData.medicalConditions)}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Pet Basic Information -->
        <div class="pet-info-section" style="margin-bottom: 20px;">
          <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; border-bottom: 2px solid #374151; padding-bottom: 3px;">PET INFORMATION</h3>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Species:</strong> ${safeText(petData.species)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Breed:</strong> ${safeText(petData.breed)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Age:</strong> ${safeText(petData.age)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Weight:</strong> ${safeText(petData.weight)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Gender:</strong> ${safeText(petData.gender)}</p>
            ${petData.color ? `<p style="margin: 3px 0; font-size: 13px;"><strong>Color:</strong> ${safeText(petData.color)}</p>` : ''}
            ${petData.petPortId ? `<p style="margin: 3px 0; font-size: 13px;"><strong>PetPort ID:</strong> ${safeText(petData.petPortId)}</p>` : ''}
          </div>
        </div>
        
        <!-- Emergency Contacts -->
        <div class="contact-group" style="margin-bottom: 35px;">
          <h3 style="color: #1d4ed8; margin: 0 0 20px 0; font-size: 18px; text-align: center; font-weight: bold;">📞 EMERGENCY CONTACTS</h3>
          
          ${emergencyContact ? `
            <div class="contact-card" style="margin-bottom: 20px; padding: 12px; background: white; border-radius: 6px; border: 2px solid #dc2626; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h4 style="color: #dc2626; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">🚨 PRIMARY EMERGENCY CONTACT</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">${safeText(emergencyContact)}</p>
            </div>
          ` : ''}
          
          ${secondEmergencyContact ? `
            <div class="contact-card" style="margin-bottom: 20px; padding: 12px; background: white; border-radius: 6px; border: 2px solid #f59e0b; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h4 style="color: #d97706; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">📱 SECONDARY EMERGENCY CONTACT</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">${safeText(secondEmergencyContact)}</p>
            </div>
          ` : ''}
          
          ${vetContact ? `
            <div class="contact-card" style="margin-bottom: 20px; padding: 12px; background: white; border-radius: 6px; border: 2px solid #059669; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h4 style="color: #047857; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">🏥 VETERINARIAN</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">${safeText(vetContact)}</p>
            </div>
          ` : ''}
          
          ${petCaretaker ? `
            <div class="contact-card" style="margin-bottom: 20px; padding: 12px; background: white; border-radius: 6px; border: 2px solid #7c3aed; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h4 style="color: #6d28d9; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">👤 PET CARETAKER</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">${safeText(petCaretaker)}</p>
            </div>
          ` : ''}
        </div>
        
        <!-- Page Buffer -->
        <div class="page-buffer"></div>
        
        <!-- Important Notes -->
        ${petData.bio || petData.notes ? `
          <div style="margin-bottom: 25px; background: #fefce8; padding: 15px; border-radius: 8px; border: 2px solid #eab308;">
            <h3 style="color: #a16207; margin: 0 0 10px 0; font-size: 18px;">📝 IMPORTANT NOTES</h3>
            ${petData.bio ? `<p style="margin: 0 0 10px 0;"><strong>Bio:</strong> ${safeText(petData.bio)}</p>` : ''}
            ${petData.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${safeText(petData.notes)}</p>` : ''}
          </div>
        ` : ''}
        
        <!-- Location Information -->
        ${petData.county || petData.state ? `
          <div style="margin-bottom: 25px; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #22c55e;">
            <h3 style="color: #15803d; margin: 0 0 10px 0; font-size: 18px;">📍 LOCATION</h3>
            <p style="margin: 0;">${petData.county ? safeText(petData.county) : ''}${petData.county && petData.state ? ', ' : ''}${petData.state ? safeText(petData.state) : ''}</p>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: bold;">🆘 IN CASE OF EMERGENCY</p>
          <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Contact the numbers above immediately</p>
          <p style="margin: 10px 0 5px 0; font-size: 12px; color: #6b7280;">Generated from PetPort Digital Pet Passport</p>
          <p style="margin: 0; font-size: 11px; color: #6b7280;">Pet ID: ${safeText(petData.id)} | Generated: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
  } else if (type === 'gallery') {
    // Gallery PDF with photos
    const galleryPhotos = petData.gallery_photos || [];
    const photoGrid = galleryPhotos.length > 0 
      ? galleryPhotos.map((photo: any, index: number) => `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${photo.url}" alt="Gallery photo ${index + 1}" style="max-width: 300px; max-height: 300px; border: 2px solid #1e40af; border-radius: 8px;">
            ${photo.caption ? `<p style="margin-top: 10px; font-style: italic; color: #6b7280;">${safeText(photo.caption)}</p>` : ''}
          </div>
        `).join('')
      : '<p style="text-align: center; color: #6b7280;">No photos available</p>';
    
    content = `
      <style>
        @page {
          margin: 20mm 15mm 35mm 15mm;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        .gallery-item {
          page-break-inside: avoid;
          margin-bottom: 30px;
          min-height: 200px;
        }
        
        .gallery-header {
          page-break-inside: avoid;
          margin-bottom: 25px;
          min-height: 100px;
        }
        
        .gallery-footer {
          page-break-inside: avoid;
          margin-top: 40px;
          min-height: 60px;
        }
        
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .gallery-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .gallery-header {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .gallery-footer {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      </style>
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div class="gallery-header" style="text-align: center; margin-bottom: 30px; border: 2px solid #1e40af; padding: 20px; background: #eff6ff;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PetPort Photo Gallery</h1>
          <h2 style="color: #1e40af; font-size: 20px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div class="gallery-item" style="margin-bottom: 20px; text-align: center;">
          <p><strong>Pet:</strong> ${safeText(petData.name)} (${safeText(petData.breed)})</p>
          <p><strong>PetPort ID:</strong> ${safeText(petData.id)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${galleryPhotos.map((photo: any, index: number) => `
            <div class="gallery-item" style="text-align: center; margin-bottom: 20px;">
              <img src="${photo.url}" alt="Gallery photo ${index + 1}" style="max-width: 300px; max-height: 300px; border: 2px solid #1e40af; border-radius: 8px;">
              ${photo.caption ? `<p style="margin-top: 10px; font-style: italic; color: #6b7280;">${safeText(photo.caption)}</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="gallery-footer" style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Generated from PetPort Digital Pet Passport</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Visit: ${window.location.origin}/profile/${petData.id}</p>
        </div>
      </div>
    `;
  } else {
    // Full profile
    content = `
      <style>
        @page {
          margin: 20mm 15mm 35mm 15mm;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        .profile-section {
          page-break-inside: avoid;
          margin-bottom: 30px;
          min-height: 80px;
        }
        
        .profile-header {
          page-break-inside: avoid;
          margin-bottom: 25px;
          min-height: 100px;
        }
        
        .profile-content {
          page-break-inside: avoid;
          margin-bottom: 25px;
          min-height: 120px;
        }
        
        .profile-footer {
          page-break-inside: avoid;
          margin-top: 40px;
          min-height: 60px;
        }
        
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .profile-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .profile-header {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .profile-content {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .profile-footer {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      </style>
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div class="profile-header" style="text-align: center; margin-bottom: 30px; border: 2px solid #1e40af; padding: 20px; background: #eff6ff;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PetPort Digital Passport</h1>
          <h2 style="color: #1e40af; font-size: 20px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div class="profile-content" style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">BASIC INFORMATION</h3>
            <p><strong>Name:</strong> ${safeText(petData.name)}</p>
            <p><strong>Breed:</strong> ${safeText(petData.breed)}</p>
            <p><strong>Age:</strong> ${safeText(petData.age)}</p>
            <p><strong>Weight:</strong> ${safeText(petData.weight)}</p>
            <p><strong>Color:</strong> ${safeText(petData.color)}</p>
            <p><strong>Gender:</strong> ${safeText(petData.gender)}</p>
            ${petData.microchip_id ? `<p><strong>Microchip:</strong> ${safeText(petData.microchip_id)}</p>` : ''}
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">CONTACT</h3>
            <p><strong>Owner:</strong> ${safeText(primaryContact.name || 'Contact via PetPort')}</p>
            ${primaryContact.phone ? `<p><strong>Phone:</strong> ${safeText(primaryContact.phone)}</p>` : ''}
            ${primaryContact.email ? `<p><strong>Email:</strong> ${safeText(primaryContact.email)}</p>` : ''}
            <p><strong>PetPort ID:</strong> ${safeText(petData.id)}</p>
          </div>
        </div>
        
        ${petData.bio ? `
          <div class="profile-section" style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">BIOGRAPHY</h3>
            <p>${safeText(petData.bio)}</p>
          </div>
        ` : ''}
        
        ${petData.medical_conditions ? `
          <div class="profile-section" style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">MEDICAL CONDITIONS</h3>
            <p>${safeText(petData.medical_conditions)}</p>
          </div>
        ` : ''}
        
        <div class="profile-footer" style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Generated from PetPort Digital Pet Passport</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Visit: ${window.location.origin}/profile/${petData.id}</p>
        </div>
      </div>
    `;
  }
  
  return content;
};

export async function generateClientPetPDF(
  petData: any, 
  type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' = 'emergency'
): Promise<ClientPDFGenerationResult> {
  try {
    console.log('🔧 CLIENT: Starting client-side PDF generation for pet:', petData.name, 'type:', type);
    
    // Create a temporary container for HTML content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.innerHTML = createPetProfileHTML(petData, type);
    
    document.body.appendChild(tempContainer);
    
    // Use html2canvas to capture the HTML as an image
    const canvas = await html2canvas(tempContainer, {
      width: 800,
      height: tempContainer.scrollHeight,
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);
    
    // Create PDF using jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add image to PDF (handle multiple pages if needed)
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Convert PDF to blob
    const pdfBlob = pdf.output('blob');
    const fileName = `${petData.name}_${type}_profile.pdf`;
    
    console.log('✅ CLIENT: Client-side PDF generation successful');
    console.log('  - Blob size:', pdfBlob.size);
    console.log('  - Filename:', fileName);
    
    return {
      success: true,
      pdfBlob,
      blob: pdfBlob, // Alias for compatibility
      fileName,
      type
    };
    
  } catch (error) {
    console.error('❌ CLIENT: Error in client-side PDF generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    };
  }
}

// Legacy functions for compatibility - redirect to client-side generation
export async function generatePetPDF(petId: string, type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' = 'emergency'): Promise<ClientPDFGenerationResult> {
  // This would need to fetch pet data from Supabase first
  // For now, return an error asking to use the new client-side method directly
  return {
    success: false,
    error: 'Please use generateClientPetPDF with pet data directly'
  };
}

// Keep other utility functions
export async function downloadPDFBlob(blob: Blob, filename: string): Promise<void> {
  try {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
}

export async function viewPDFBlob(blob: Blob, filename: string): Promise<void> {
  try {
    const viewUrl = window.URL.createObjectURL(blob);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.location.href = viewUrl;
    } else {
      const a = document.createElement('a');
      a.href = viewUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    setTimeout(() => {
      window.URL.revokeObjectURL(viewUrl);
    }, 1000);
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw new Error('Failed to view PDF');
  }
}
