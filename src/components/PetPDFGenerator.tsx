
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Share2, Loader2, Users, ExternalLink } from "lucide-react";
import { generatePetPDF, generateQRCodeUrl, downloadPDFBlob, generatePublicProfileUrl, shareProfile } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
}

export const PetPDFGenerator = ({ petId, petName }: PetPDFGeneratorProps) => {
  // Separate loading states for each button
  const [isGeneratingEmergency, setIsGeneratingEmergency] = useState(false);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  
  const [emergencyPdfBlob, setEmergencyPdfBlob] = useState<Blob | null>(null);
  const [fullPdfBlob, setFullPdfBlob] = useState<Blob | null>(null);
  const [emergencyQrCodeUrl, setEmergencyQrCodeUrl] = useState<string | null>(null);
  const [fullQrCodeUrl, setFullQrCodeUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const publicProfileUrl = generatePublicProfileUrl(petId);

  const handleGeneratePDF = async (type: 'emergency' | 'full') => {
    // Set the appropriate loading state
    if (type === 'emergency') {
      setIsGeneratingEmergency(true);
    } else {
      setIsGeneratingFull(true);
    }

    try {
      console.log(`Starting ${type} PDF generation for pet:`, petId);
      
      const result = await generatePetPDF(petId, type);
      
      if (result.success && result.pdfBlob) {
        if (type === 'emergency') {
          setEmergencyPdfBlob(result.pdfBlob);
          // For QR code, we'll create a temporary URL
          const tempUrl = URL.createObjectURL(result.pdfBlob);
          setEmergencyQrCodeUrl(generateQRCodeUrl(tempUrl));
        } else {
          setFullPdfBlob(result.pdfBlob);
          const tempUrl = URL.createObjectURL(result.pdfBlob);
          setFullQrCodeUrl(generateQRCodeUrl(tempUrl));
        }
        
        // Automatically download the PDF
        const fileName = type === 'emergency' 
          ? `PetPort_Emergency_Profile_${petName}.pdf`
          : `PetPort_Complete_Profile_${petName}.pdf`;
        await downloadPDFBlob(result.pdfBlob, fileName);
        
        setIsDialogOpen(true);
        
        toast({
          title: "PDF Generated Successfully",
          description: `${petName}'s ${type === 'emergency' ? 'emergency profile' : 'complete profile'} PDF has been downloaded.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear the appropriate loading state
      if (type === 'emergency') {
        setIsGeneratingEmergency(false);
      } else {
        setIsGeneratingFull(false);
      }
    }
  };

  const handleDownload = async (blob: Blob | null, type: 'emergency' | 'full') => {
    if (!blob) return;
    
    try {
      const fileName = type === 'emergency' 
        ? `PetPort_Emergency_Profile_${petName}.pdf`
        : `PetPort_Complete_Profile_${petName}.pdf`;
      await downloadPDFBlob(blob, fileName);
      toast({
        title: "Download Started",
        description: `Your pet's ${type} profile is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (url: string, type: string) => {
    if (!url) return;

    setIsSharing(true);
    try {
      const success = await shareProfile(url, petName);
      if (success) {
        toast({
          title: navigator.share ? "Shared Successfully" : "Link Copied",
          description: navigator.share ? 
            `${petName}'s ${type} profile has been shared.` : 
            `${type} profile link copied to clipboard.`,
        });
      } else {
        throw new Error('Failed to share');
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not share the profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSharePublicProfile = async () => {
    await handleShare(publicProfileUrl, "public");
  };

  return (
    <div className="space-y-4">
      {/* Passport-style header with circular pet photo */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-800 p-4 rounded-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gold-500/10 rounded-full translate-y-6 -translate-x-6"></div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/50 flex-shrink-0">
            <div className="w-full h-full bg-gold-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gold-500" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-gold-500 tracking-wide border-b-2 border-gold-500 pb-1 mb-2">
              OFFICIAL DOCUMENTS
            </h3>
            <p className="text-gold-200 text-sm">Generate and share {petName}'s passport documents</p>
          </div>
        </div>
      </div>

      {/* Document generation buttons in stamped boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div className="absolute top-2 right-2 w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gold-600">1</span>
          </div>
          <h4 className="font-serif font-bold text-navy-900 mb-2 border-b border-gold-500/50 pb-1">🚨 Emergency Profile</h4>
          <p className="text-sm text-navy-600 mb-3">Essential medical and contact information</p>
          <Button 
            onClick={() => handleGeneratePDF('emergency')}
            disabled={isGeneratingEmergency}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
          >
            {isGeneratingEmergency ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Generate Emergency PDF
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div className="absolute top-2 right-2 w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gold-600">2</span>
          </div>
          <h4 className="font-serif font-bold text-navy-900 mb-2 border-b border-gold-500/50 pb-1">Complete Profile</h4>
          <p className="text-sm text-navy-600 mb-3">Full passport with all certifications</p>
          <Button 
            onClick={() => handleGeneratePDF('full')}
            disabled={isGeneratingFull}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
          >
            {isGeneratingFull ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Full Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dialog for sharing options */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
              📋 Share {petName}'s Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Public Profile Link */}
            <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
              <h4 className="font-serif font-bold text-navy-900 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-gold-500/20 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-gold-600" />
                </div>
                Public Profile Page
              </h4>
              <p className="text-sm text-navy-600 mb-3">Share a read-only online profile that anyone can view</p>
              <Button
                onClick={handleSharePublicProfile}
                disabled={isSharing}
                variant="outline"
                className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share Public Profile
              </Button>
            </div>

            {/* Emergency PDF */}
            {emergencyPdfBlob && (
              <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                <h4 className="font-serif font-bold text-navy-900 mb-3">🚨 Emergency Profile PDF</h4>
                <div className="flex justify-center mb-3">
                  <Button
                    onClick={() => handleDownload(emergencyPdfBlob, 'emergency')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Emergency PDF
                  </Button>
                </div>
              </div>
            )}

            {/* Full Profile PDF */}
            {fullPdfBlob && (
              <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                <h4 className="font-serif font-bold text-navy-900 mb-3">Complete Profile PDF</h4>
                <div className="flex justify-center mb-3">
                  <Button
                    onClick={() => handleDownload(fullPdfBlob, 'full')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Complete PDF
                  </Button>
                </div>
              </div>
            )}

            {/* In-App Sharing */}
            <div className="border-t border-gold-500/30 pt-4">
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  window.location.hash = 'share-with-members';
                }}
                className="w-full bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Share with PetPort Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
