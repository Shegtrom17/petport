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
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border: 3px solid #dc2626; padding: 20px; background: #fef2f2;">
          <h1 style="color: #dc2626; font-size: 36px; margin: 0; font-weight: bold;">🚨 MISSING PET ALERT</h1>
          <h2 style="color: #dc2626; font-size: 28px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div style="display: flex; gap: 30px; margin-bottom: 30px;">
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
          
          <div style="flex: 1;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">EMERGENCY CONTACT</h3>
            <p><strong>Owner:</strong> ${safeText(primaryContact.name || 'Contact via PetPort')}</p>
            ${primaryContact.phone ? `<p><strong>Phone:</strong> ${safeText(primaryContact.phone)}</p>` : ''}
            ${primaryContact.email ? `<p><strong>Email:</strong> ${safeText(primaryContact.email)}</p>` : ''}
            <p><strong>PetPort ID:</strong> ${safeText(petData.id)}</p>
          </div>
        </div>
        
        ${petData.bio ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">DESCRIPTION</h3>
            <p>${safeText(petData.bio)}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; background: #fef2f2; padding: 20px; border: 2px solid #dc2626; margin-top: 30px;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0;">REWARD OFFERED</h3>
          <p style="font-size: 18px; margin: 0;">Please contact immediately if found!</p>
          <p style="font-size: 14px; margin: 10px 0 0 0;">Generated from PetPort Digital Pet Passport</p>
        </div>
      </div>
    `;
  } else if (type === 'emergency') {
    content = `
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border: 2px solid #dc2626; padding: 20px; background: #fef2f2;">
          <h1 style="color: #dc2626; font-size: 24px; margin: 0;">🚨 EMERGENCY PROFILE</h1>
          <h2 style="color: #dc2626; font-size: 20px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">BASIC INFO</h3>
            <p><strong>Breed:</strong> ${safeText(petData.breed)}</p>
            <p><strong>Age:</strong> ${safeText(petData.age)}</p>
            <p><strong>Weight:</strong> ${safeText(petData.weight)}</p>
            ${petData.microchip_id ? `<p><strong>Microchip:</strong> ${safeText(petData.microchip_id)}</p>` : ''}
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">EMERGENCY CONTACT</h3>
            <p><strong>Owner:</strong> ${safeText(primaryContact.name || 'Contact via PetPort')}</p>
            ${primaryContact.phone ? `<p><strong>Phone:</strong> ${safeText(primaryContact.phone)}</p>` : ''}
            ${primaryContact.email ? `<p><strong>Email:</strong> ${safeText(primaryContact.email)}</p>` : ''}
          </div>
        </div>
        
        ${petData.medical_conditions ? `
          <div style="margin-bottom: 20px; background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">MEDICAL CONDITIONS</h3>
            <p style="margin: 0;">${safeText(petData.medical_conditions)}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Generated from PetPort Digital Pet Passport</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">PetPort ID: ${safeText(petData.id)}</p>
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
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border: 2px solid #1e40af; padding: 20px; background: #eff6ff;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PetPort Photo Gallery</h1>
          <h2 style="color: #1e40af; font-size: 20px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div style="margin-bottom: 20px; text-align: center;">
          <p><strong>Pet:</strong> ${safeText(petData.name)} (${safeText(petData.breed)})</p>
          <p><strong>PetPort ID:</strong> ${safeText(petData.id)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${photoGrid}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Generated from PetPort Digital Pet Passport</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Visit: ${window.location.origin}/profile/${petData.id}</p>
        </div>
      </div>
    `;
  } else {
    // Full profile
    content = `
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border: 2px solid #1e40af; padding: 20px; background: #eff6ff;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PetPort Digital Passport</h1>
          <h2 style="color: #1e40af; font-size: 20px; margin: 10px 0;">${safeText(petData.name)}</h2>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
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
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">BIOGRAPHY</h3>
            <p>${safeText(petData.bio)}</p>
          </div>
        ` : ''}
        
        ${petData.medical_conditions ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">MEDICAL CONDITIONS</h3>
            <p>${safeText(petData.medical_conditions)}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f3f4f6; border: 1px solid #d1d5db;">
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
