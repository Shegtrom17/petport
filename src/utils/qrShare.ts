import { toast } from 'sonner';

/**
 * Share a QR code for a given URL using the QR Server API (same as pdfService)
 * Falls back to download if native sharing isn't available
 */
export async function shareQRCode(url: string, petName: string, pageType: string): Promise<void> {
  try {
    // Use the same QR API that's already working in pdfService
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
    
    // Fetch the QR code image
    const response = await fetch(qrUrl);
    if (!response.ok) throw new Error('Failed to generate QR code');
    
    const blob = await response.blob();
    const fileName = `${petName}-${pageType}-QR.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // Try native sharing first
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${petName} - ${pageType}`,
        text: `Scan this QR code to view ${petName}'s ${pageType}`,
        files: [file],
      });
      
      toast.success("QR Code Shared!", {
        description: `${pageType} QR code shared successfully`,
      });
    } else {
      // Fallback: Download the QR code
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast.success("QR Code Downloaded", {
        description: `${fileName} saved to your device`,
      });
    }
  } catch (error) {
    console.error('QR share failed:', error);
    toast.error("QR Generation Failed", {
      description: "Could not generate QR code. Please try copying the link instead.",
    });
  }
}
