
import { supabase } from "@/integrations/supabase/client";
import { resolvePdfType, PDFType } from "@/utils/pdfType";

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

    // Use centralized type resolver to prevent drift
    const normalizedType: PDFType = resolvePdfType(type as string);
    console.log('🔧 CLIENT: Resolved type', { input: type, normalizedType });

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

// Generate a shareable public missing-pet URL
export function generatePublicMissingUrl(petId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/missing-pet/${petId}`;
}

// Generate a shareable public care instructions URL
export function generatePublicCareUrl(petId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/care/${petId}`;
}
// Enhanced mobile PWA sharing functionality
export interface ShareResult {
  success: boolean;
  shared: boolean; // true if actually shared, false if copied to clipboard
  message?: string; // Add message for compatibility
  error?: string;
}

export async function shareProfile(url: string, title: string, description: string = ''): Promise<ShareResult> {
  // Try native share when available (more permissive - some browsers return false for canShare)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description,
        url,
      });
      console.log('Content shared successfully via native share');
      return { success: true, shared: true, message: 'Shared successfully' };
    } catch (error: any) {
      console.error('Native sharing failed:', error);
      // If user cancelled share, don't treat as error
      if (error?.name === 'AbortError' || error?.message?.toLowerCase?.().includes('cancel')) {
        return { success: false, shared: false, error: 'Share cancelled' };
      }
      // Fall through to clipboard fallback
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
// PDF Sharing functionality with Web Share API and storage fallback
export async function sharePDFBlob(
  pdfBlob: Blob,
  fileName: string,
  petName: string,
  contentType: 'profile' | 'care' | 'emergency' | 'credentials' | 'reviews' = 'profile'
): Promise<ShareResult> {
  console.log('📤 Starting PDF share process...', { fileName, petName, contentType });
  
  // Try Web Share API first (mobile browsers that support file sharing)
  if (navigator.share) {
    try {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      const shareData = {
        title: `${petName}'s ${contentType} PDF`,
        text: `${petName}'s ${contentType} information`,
        files: [file]
      };
      
      // Check if file sharing is supported
      if (navigator.canShare && navigator.canShare(shareData)) {
        console.log('📱 Using native file sharing...');
        await navigator.share(shareData);
        return { success: true, shared: true, message: 'PDF shared successfully' };
      } else {
        console.log('📱 File sharing not supported, trying text sharing...');
        // Fallback to storage + text sharing
      }
    } catch (error: any) {
      console.error('Native PDF sharing failed:', error);
      if (error?.name === 'AbortError' || error?.message?.toLowerCase?.().includes('cancel')) {
        return { success: false, shared: false, error: 'Share cancelled' };
      }
      // Continue to fallback
    }
  }
  
  // Fallback: upload to storage and share URL
  try {
    console.log('☁️ Using storage fallback for PDF sharing...');
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to share PDFs');
    }
    
    // Create unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;
    
    console.log('📤 Uploading PDF to storage...', { filePath });
    
    // Upload PDF to storage
    const { data, error } = await supabase.storage
      .from('shared_exports')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600' // 1 hour cache
      });
    
    if (error) {
      console.error('Storage upload failed:', error);
      throw error;
    }
    
    console.log('✅ PDF uploaded successfully, creating signed URL...');
    
    // Create signed URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('shared_exports')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
    
    if (signedUrlError) {
      console.error('Signed URL creation failed:', signedUrlError);
      throw signedUrlError;
    }
    
    console.log('🔗 Signed URL created, attempting to share...');
    
    // Share the signed URL
    const title = `${petName}'s ${contentType} PDF`;
    const description = `Download ${petName}'s ${contentType} information`;
    
    const shareResult = await shareProfile(signedUrlData.signedUrl, title, description);
    
    // Clean up file after 1 hour (background cleanup)
    setTimeout(async () => {
      try {
        console.log('🧹 Cleaning up shared PDF file...');
        await supabase.storage.from('shared_exports').remove([filePath]);
      } catch (error) {
        console.error('Failed to clean up shared PDF:', error);
      }
    }, 60 * 60 * 1000); // Clean up after 1 hour
    
    return {
      ...shareResult,
      message: shareResult.shared 
        ? 'PDF uploaded and shared successfully!' 
        : 'PDF uploaded - download link copied to clipboard!'
    };
  } catch (error) {
    console.error('PDF sharing fallback failed:', error);
    
    // Final fallback: create temporary download URL
    try {
      console.log('💾 Using final fallback - temporary download...');
      const tempUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = tempUrl;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(tempUrl);
      
      return { 
        success: true, 
        shared: false, 
        message: 'PDF downloaded - you can now share the file manually' 
      };
    } catch (downloadError) {
      console.error('Final fallback failed:', downloadError);
      return { 
        success: false, 
        shared: false, 
        error: 'Unable to share PDF. Please try downloading and sharing manually.' 
      };
    }
  }
}

export async function shareProfileOptimized(
  url: string, 
  petName: string, 
  contentType: 'profile' | 'care' | 'emergency' | 'credentials' | 'resume' | 'reviews' = 'profile',
  isMissingPet: boolean = false
): Promise<ShareResult> {
  let title: string;
  let description: string;
  
  switch (contentType) {
    case 'care':
      title = `${petName}'s Care Instructions`;
      description = isMissingPet 
        ? `🚨 MISSING: ${petName} - Care instructions for safe return`
        : `Care instructions for ${petName} - feeding, medication, emergency contacts`;
      break;
    case 'credentials':
      title = `${petName}'s Credentials`;
      description = `Professional credentials for ${petName}: certifications, training and badges`;
      break;
    case 'resume':
      title = `${petName}'s Resume`;
      description = `Professional resume for ${petName}: training, achievements, and experience`;
      break;
    case 'reviews':
      title = `${petName}'s Reviews & References`;
      description = `Read reviews and references for ${petName} on PetPort`;
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
