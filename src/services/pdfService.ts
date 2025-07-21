
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

    const { data, error } = await supabase.functions.invoke('generate-pet-pdf', {
      body: { petId, type }
    });

    if (error) {
      console.error('Error calling PDF generation function:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF'
      };
    }

    // The response should be a PDF blob
    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      const pdfBlob = new Blob([data], { type: 'application/pdf' });
      const fileName = `PetPort_${type}_Profile.pdf`;
      
      console.log('PDF blob created successfully, size:', pdfBlob.size);
      
      return {
        success: true,
        pdfBlob,
        fileName,
        type
      };
    } else {
      console.error('Invalid PDF response format:', typeof data, data);
      return {
        success: false,
        error: 'Invalid PDF response format'
      };
    }
  } catch (error) {
    console.error('Error in generatePetPDF:', error);
    return {
      success: false,
      error: 'Failed to generate PDF'
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

// Share profile functionality
export async function shareProfile(url: string, title: string, description: string = ''): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: description,
        url: url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      // If native sharing fails, fall back to clipboard
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        return false;
      }
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}
