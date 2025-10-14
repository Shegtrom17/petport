import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share, Eye, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { shareProfile, generatePublicMissingUrl, generateQRCodeUrl, sharePDFBlob } from "@/services/pdfService";
import { generateClientPetPDF, downloadPDFBlob, viewPDFBlob, isIOS, isStandalonePWA } from "@/services/clientPdfService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LostPetPDFGeneratorProps {
  petId: string;
  petName: string;
  isActive: boolean;
  petData?: any; // Add pet data prop for client-side generation
}

export const LostPetPDFGenerator = ({ petId, petName, isActive, petData }: LostPetPDFGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [authError, setAuthError] = useState(false);

  const handleGenerateFlyer = async () => {
    if (!user) {
      setAuthError(true);
      return;
    }

    if (!petData) {
      toast({
        title: "Error",
        description: "Pet data not available for flyer generation.",
        variant: "destructive"
      });
      return;
    }

    setAuthError(false);
    setIsGenerating(true);
    
    try {
      console.log('LostPetPDFGenerator - Generating lost pet PDF for petId:', petId, 'petName:', petName);
      const result = await generateClientPetPDF(petData, 'lost_pet');
      
      if (result.success && result.blob) {
        setPdfBlob(result.blob);
        setShowDialog(true);
        
        toast({
          title: "Missing Pet Flyer Generated",
          description: "Your lost pet flyer is ready to download or share",
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('❌ Error generating lost pet PDF:', error);
      setPdfBlob(null);
      setShowDialog(false);
      toast({
        title: "Flyer Generation Failed", 
        description: `Could not generate the lost pet flyer: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (pdfBlob) {
      const filename = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`;
      try {
        // Create a fresh blob for download to avoid security issues
        const freshBlob = new Blob([await pdfBlob.arrayBuffer()], { type: 'application/pdf' });
        await downloadPDFBlob(freshBlob, filename);
        toast({
          title: "Flyer Downloaded",
          description: "Print and distribute to help find your pet",
        });
      } catch (downloadError) {
        console.error('Download failed:', downloadError);
        toast({
          title: "Download Failed",
          description: "Please try using Preview and save from there.",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = async () => {
    if (pdfBlob) {
      const filename = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`;
      await viewPDFBlob(pdfBlob, filename);
    }
  };

  const handleShare = async () => {
    if (!pdfBlob) return;

    setIsSharing(true);
    try {
      // Create a temporary URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const shareUrl = generatePublicMissingUrl(petId);
      
      const result = await shareProfile(
        shareUrl,
        `🚨 MISSING PET ALERT - ${petName}`,
        `Help us find ${petName}! Last seen information and contact details included. Please share with your network.`
      );

      if (result.success) {
        toast({
          title: "Shared Successfully",
          description: result.message,
        });
      }
      
      // Clean up the temporary URL
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Could not share the flyer. Please try copying the link manually.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

const handleQuickFlyer = async () => {
  if (!user) {
    setAuthError(true);
    return;
  }
  if (!petData) {
    toast({ title: "Error", description: "Pet data not available for flyer generation.", variant: "destructive" });
    return;
  }
  setIsGenerating(true);
  try {
    const result = await generateClientPetPDF(petData, 'lost_pet');
    if (result.success && result.blob) {
      setPdfBlob(result.blob);
      const missingUrl = generatePublicMissingUrl(petId);
      const title = `🚨 MISSING PET ALERT - ${petName}`;
      const text = `Help us find ${petName}! Last seen details and contacts inside.`;
      
      // iOS detection (iOS doesn't support file sharing via Web Share API)
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOSDevice) {
        // iOS fallback: Open PDF in new tab
        const url = URL.createObjectURL(result.blob);
        window.open(url, '_blank');
        toast({ 
          title: "PDF Ready", 
          description: "PDF opened in new tab. Use Safari's share button to send it.",
          duration: 5000
        });
        setShowDialog(true);
        return;
      }
      
      // Non-iOS: Try native file share
      const file = new File([result.blob], `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`, { type: 'application/pdf' });
      const canShareFiles = typeof (navigator as any).canShare === 'function' && (navigator as any).canShare({ files: [file] });
      if (navigator.share && canShareFiles) {
        await (navigator as any).share({ title, text, url: missingUrl, files: [file] });
        toast({ title: "Shared Flyer", description: "Thanks for sharing to help bring them home." });
        return;
      }
      // Fallback: share link only and open options dialog
      await shareProfile(missingUrl, title, text);
      setShowDialog(true);
    } else {
      throw new Error(result.error || 'Failed to generate PDF');
    }
  } catch (e) {
    console.error('Quick flyer failed:', e);
    setShowDialog(true);
    toast({ title: "Share Unavailable", description: "Preview opened instead. Use options to share.", variant: "default" });
  } finally {
    setIsGenerating(false);
  }
};

const buttonVariant = isActive ? "destructive" : "secondary";
const buttonIcon = isActive ? AlertTriangle : FileText;
const ButtonIcon = buttonIcon;

  return (
    <>
      {/* Authentication Error Alert */}
      {authError && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Please sign in to generate PDF documents for your pet.
          </AlertDescription>
        </Alert>
      )}

      {/* Privacy Information */}
      {user && (
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Sharing Notice:</strong> PDF generation works for all profiles. To share via social media or QR codes, your profile must be public.
          </AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateFlyer}
        disabled={isGenerating || !user}
        className={`w-full py-3 font-semibold ${
          isActive 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        <ButtonIcon className="w-5 h-5 mr-2" />
        {isGenerating 
          ? 'Generating Flyer...' 
          : isActive 
            ? '🚨 Generate Missing Pet Flyer' 
            : 'Generate Lost Pet Flyer Template'
        }
      </Button>

      {/* One-tap Quick Flyer (generate + share) */}
      <Button
        onClick={handleQuickFlyer}
        disabled={isGenerating || !user}
        variant="outline"
        className="w-full mt-2"
      >
        <Share className="w-4 h-4 mr-2" />
        One-tap Quick Flyer
      </Button>
      {/* PDF Actions Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Missing Pet Flyer Ready</span>
            </DialogTitle>
            <DialogDescription>
              Your professional missing pet flyer has been generated. Choose to preview, download, or share the flyer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your professional missing pet flyer has been generated with all essential information. 
              Print copies to post around your neighborhood and share digitally on social media.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={handleView} variant="outline" className="justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Preview Flyer
              </Button>
              
              <Button onClick={handleDownload} className="justify-start bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              {(isIOS() || isStandalonePWA()) && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  💡 On iPhone: Use Preview → Share → Save to Files
                </div>
              )}
              
              <Button 
                onClick={async () => {
                  if (!pdfBlob) return;
                  const fileName = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}_Missing_Pet_Flyer.pdf`;
                  const result = await sharePDFBlob(pdfBlob, fileName, petName, 'profile');
                  
                  if (result.success) {
                    toast({
                      title: result.shared ? "Missing Pet Flyer Shared!" : "Link Copied!",
                      description: result.message,
                    });
                  } else if (result.error !== 'Share cancelled') {
                    toast({
                      title: "Unable to Share PDF",
                      description: result.error || "Please download and share manually.",
                      variant: "destructive",
                    });
                  }
                }} 
                variant="outline" 
                disabled={isSharing}
                className="justify-start"
              >
                <Share className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share PDF'}
              </Button>
            </div>

            {/* QR Preview for quick scanning */}
            <div className="flex flex-col items-center rounded-lg border p-4">
              <img
                src={generateQRCodeUrl(generatePublicMissingUrl(petId), 200)}
                alt={`QR code for ${petName} missing pet page`}
                className="w-40 h-40"
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground mt-2">Scan for live updates and contact info</p>
            </div>

            <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border">
              <strong>💡 Pro Tips:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Print in color on bright paper for maximum visibility</li>
                <li>• Post at eye level in high-traffic areas</li>
                <li>• Share on local lost pet Facebook groups</li>
                <li>• Contact local animal shelters and vet clinics</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};