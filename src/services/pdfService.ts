
import { supabase } from "@/integrations/supabase/client";

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  blob?: Blob; // Alias for compatibility
  fileName?: string;
  error?: string;
  type?: string;
}

export async function generatePetPDF(petId: string, type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' = 'emergency'): Promise<PDFGenerationResult> {
  try {
    console.log('🔧 CLIENT: Starting PDF generation for pet:', petId, 'type:', type)

    // Normalize common synonyms to prevent unintended fallbacks
    const t = (type || 'emergency').toString().toLowerCase();
    let normalizedType: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery';
    switch (t) {
      case 'complete':
      case 'full_profile':
      case 'profile':
      case 'complete_profile':
        normalizedType = 'full';
        break;
      case 'lost':
      case 'lost-pet':
      case 'missing':
        normalizedType = 'lost_pet';
        break;
      case 'emergency':
      case 'full':
      case 'lost_pet':
      case 'care':
      case 'gallery':
        normalizedType = t as typeof normalizedType;
        break;
      default:
        normalizedType = 'emergency';
    }

    console.log('🔧 CLIENT: Request body will be:', { petId, type: normalizedType })
    const response = await supabase.functions.invoke('generate-pet-pdf', {
      body: { petId, type: normalizedType }
    });

    console.log('📡 CLIENT: Raw response from edge function:')
    console.log('  - Response object:', response)
    console.log('  - Response error:', response.error)
    console.log('  - Response data type:', typeof response.data)
    console.log('  - Response data constructor:', response.data?.constructor?.name)
    console.log('  - Response data length/size:', response.data?.length || response.data?.size)

    if (response.error) {
      console.error('❌ CLIENT: Edge function returned error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Failed to generate PDF'
      };
    }

    // The response data is now JSON with PDF bytes array from the edge function
    if (!response.data) {
      console.error('❌ CLIENT: No PDF data received from edge function')
      return {
        success: false,
        error: 'No PDF data received'
      };
    }

    console.log('🔧 CLIENT: Processing response data...')
    console.log('  - Response data type:', typeof response.data)
    console.log('  - Response data structure:', response.data)

    // Handle JSON response with pdfBytes array
    if (response.data.success && response.data.pdfBytes) {
      console.log('  - Found JSON response with pdfBytes array')
      console.log('  - PDF bytes array length:', response.data.pdfBytes.length)
      
      // Convert the pdfBytes array back to Uint8Array, then to Blob
      const pdfBytesArray = new Uint8Array(response.data.pdfBytes);
      const pdfBlob = new Blob([pdfBytesArray], { type: 'application/pdf' });
      
      console.log('📦 CLIENT: Created PDF blob from JSON:')
      console.log('  - Blob size:', pdfBlob.size)
      console.log('  - Blob type:', pdfBlob.type)
      
      const fileName = response.data.fileName || `PetPort_${normalizedType}_Profile.pdf`;
      console.log('✅ CLIENT: PDF generation successful, filename:', fileName)
      
      return {
        success: true,
        pdfBlob,
        blob: pdfBlob, // Add alias for compatibility
        fileName,
        type: normalizedType
      };
    }

    // Fallback for legacy blob responses (shouldn't happen with text-only version)
    let pdfBlob: Blob;
    if (response.data instanceof Blob) {
      pdfBlob = response.data;
    } else if (response.data instanceof ArrayBuffer) {
      pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    } else {
      // If it's raw binary data, convert it
      pdfBlob = new Blob([new Uint8Array(response.data)], { type: 'application/pdf' });
    }
    
    console.log('📦 CLIENT: Created PDF blob (fallback):')
    console.log('  - Blob size:', pdfBlob.size)
    console.log('  - Blob type:', pdfBlob.type)
    
    const fileName = `PetPort_${normalizedType}_Profile.pdf`;
    console.log('✅ CLIENT: PDF generation successful, filename:', fileName)
    
    return {
      success: true,
      pdfBlob,
      blob: pdfBlob, // Add alias for compatibility
      fileName,
      type: normalizedType
    };

  } catch (error) {
    console.error('❌ CLIENT: Error in generatePetPDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    };
  }
}

export function generateQRCodeUrl(url: string, size: number = 200): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
}

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
    console.log('📖 Starting PDF view process...');
    console.log('  - Blob size:', blob.size);
    console.log('  - Blob type:', blob.type);
    
    // Create object URL from blob
    const viewUrl = window.URL.createObjectURL(blob);
    console.log('  - Created blob URL:', viewUrl);
    
    // Try to open in new window first
    const newWindow = window.open();
    if (newWindow) {
      console.log('  - Opening PDF in new window');
      newWindow.location.href = viewUrl;
    } else {
      console.log('  - Popup blocked, using fallback method');
      // Fallback if popup blocked - create temporary link
      const a = document.createElement('a');
      a.href = viewUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    // Clean up the URL after allowing time for the window to load
    setTimeout(() => {
      console.log('  - Cleaning up blob URL');
      window.URL.revokeObjectURL(viewUrl);
    }, 1000);
    
    console.log('✅ PDF view process completed successfully');
  } catch (error) {
    console.error('❌ Error viewing PDF:', error);
    throw new Error('Failed to view PDF');
  }
}

// Keep existing functions for backward compatibility
export async function downloadPDF(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    await downloadPDFBlob(blob, filename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
}

// Generate a shareable public profile URL
export function generatePublicProfileUrl(petId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/profile/${petId}`;
}

// Enhanced mobile PWA sharing functionality
export interface ShareResult {
  success: boolean;
  shared: boolean; // true if actually shared, false if copied to clipboard
  message?: string; // Add message for compatibility
  error?: string;
}

export async function shareProfile(url: string, title: string, description: string = ''): Promise<ShareResult> {
  // Check if native sharing is available (mobile PWA)
  if (navigator.share && navigator.canShare && navigator.canShare({ title, text: description, url })) {
    try {
      await navigator.share({
        title: title,
        text: description,
        url: url,
      });
      console.log('Content shared successfully via native share');
      return { success: true, shared: true, message: 'Shared successfully' };
    } catch (error: any) {
      console.error('Native sharing failed:', error);
      
      // If user cancelled share, don't treat as error
      if (error.name === 'AbortError') {
        return { success: false, shared: false, error: 'Share cancelled' };
      }
      
      // Fall back to clipboard for other errors
      return await fallbackToClipboard(url);
    }
  }
  
  // Fallback for desktop or when native sharing not available
  return await fallbackToClipboard(url);
}

async function fallbackToClipboard(url: string): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(url);
    console.log('Link copied to clipboard');
    return { success: true, shared: false, message: 'Link copied to clipboard' };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, shared: false, error: 'Unable to copy link' };
  }
}

// Enhanced sharing with better mobile experience
export async function shareProfileOptimized(
  url: string, 
  petName: string, 
  contentType: 'profile' | 'care' | 'emergency' = 'profile',
  isMissingPet: boolean = false
): Promise<ShareResult> {
  let title: string;
  let description: string;
  
  // Optimize content for different sharing contexts
  switch (contentType) {
    case 'care':
      title = `${petName}'s Care Instructions`;
      description = isMissingPet 
        ? `🚨 MISSING: ${petName} - Care instructions for safe return`
        : `Care instructions for ${petName} - feeding, medication, emergency contacts`;
      break;
    case 'emergency':
      title = `${petName}'s Emergency Info`;
      description = `Emergency contact & medical info for ${petName}`;
      break;
    default:
      title = isMissingPet ? `🚨 MISSING PET: ${petName}` : `${petName}'s Profile`;
      description = isMissingPet 
        ? `Help bring ${petName} home! Complete profile with photos & contact info`
        : `Meet ${petName}! View their complete profile, photos, and information`;
  }
  
  return await shareProfile(url, title, description);
}
