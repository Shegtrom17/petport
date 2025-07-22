
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
    const response = await supabase.functions.invoke('generate-pet-pdf', {
      body: { petId, type }
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to generate PDF'
      };
    }

    if (!response.data || !response.data.pdfData) {
      return {
        success: false,
        error: 'No PDF data received'
      };
    }

    // Decode base64 PDF data back to binary
    const base64Data = response.data.pdfData;
    const binaryString = atob(base64Data);
    const pdfBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pdfBytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob from binary data
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileName = response.data.fileName || `PetPort_${type}_Profile.pdf`;
    
    return {
      success: true,
      pdfBlob,
      fileName,
      type
    };

  } catch (error) {
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
    const viewUrl = window.URL.createObjectURL(blob);
    const newWindow = window.open(viewUrl, '_blank');
    
    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups to view PDF.');
    }
    
    // Clean up the URL after a short delay to allow the window to load
    setTimeout(() => {
      window.URL.revokeObjectURL(viewUrl);
    }, 1000);
  } catch (error) {
    console.error('Error viewing PDF:', error);
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
