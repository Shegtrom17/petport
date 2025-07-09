
import { supabase } from "@/integrations/supabase/client";

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  fileName?: string;
  error?: string;
}

export async function generatePetPDF(petId: string): Promise<PDFGenerationResult> {
  try {
    console.log('Generating PDF for pet:', petId);

    const { data, error } = await supabase.functions.invoke('generate-pet-pdf', {
      body: { petId }
    });

    if (error) {
      console.error('Error calling PDF generation function:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF'
      };
    }

    console.log('PDF generation response:', data);

    if (data?.success) {
      return {
        success: true,
        pdfUrl: data.pdfUrl,
        fileName: data.fileName
      };
    } else {
      return {
        success: false,
        error: data?.error || 'Unknown error occurred'
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
  // Using QR Server API for QR code generation
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
}

export async function downloadPDF(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
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
