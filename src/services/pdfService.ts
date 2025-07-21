
import { supabase } from "@/integrations/supabase/client";

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  fileName?: string;
  error?: string;
  type?: string;
}

export async function generatePetPDF(petId: string, type: 'emergency' | 'full' = 'emergency'): Promise<PDFGenerationResult> {
  try {
    console.log('Generating PDF for pet:', petId, 'type:', type);

    // Call edge function and get raw response
    const response = await supabase.functions.invoke('generate-pet-pdf', {
      body: { petId, type }
    });

    if (response.error) {
      console.error('Error calling PDF generation function:', response.error);
      return {
        success: false,
        error: response.error.message || 'Failed to generate PDF'
      };
    }

    // Check if we have valid PDF data
    let pdfData: Uint8Array | null = null;
    
    if (response.data) {
      // Handle different response formats
      if (response.data instanceof ArrayBuffer) {
        pdfData = new Uint8Array(response.data);
      } else if (response.data instanceof Uint8Array) {
        pdfData = response.data;
      } else if (response.data instanceof Blob) {
        const arrayBuffer = await response.data.arrayBuffer();
        pdfData = new Uint8Array(arrayBuffer);
      } else if (typeof response.data === 'string') {
        // If it's base64 encoded
        try {
          const binaryString = atob(response.data);
          pdfData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            pdfData[i] = binaryString.charCodeAt(i);
          }
        } catch (e) {
          console.error('Failed to decode base64 PDF data:', e);
          return {
            success: false,
            error: 'Invalid PDF data encoding'
          };
        }
      }
    }

    // Validate PDF data
    if (!pdfData || pdfData.length === 0) {
      console.error('No PDF data received');
      return {
        success: false,
        error: 'No PDF data received'
      };
    }

    // Check for PDF header (should start with %PDF)
    const pdfHeader = String.fromCharCode(...pdfData.slice(0, 4));
    if (pdfHeader !== '%PDF') {
      console.error('Invalid PDF header:', pdfHeader, 'First bytes:', Array.from(pdfData.slice(0, 10)));
      return {
        success: false,
        error: 'Invalid PDF format - missing PDF header'
      };
    }

    // Create blob and return success
    const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
    const fileName = `PetPort_${type}_Profile.pdf`;
    
    console.log('PDF blob created successfully, size:', pdfBlob.size, 'bytes');
    
    return {
      success: true,
      pdfBlob,
      fileName,
      type
    };

  } catch (error) {
    console.error('Error in generatePetPDF:', error);
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
      return { success: true, shared: true };
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
    return { success: true, shared: false };
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
