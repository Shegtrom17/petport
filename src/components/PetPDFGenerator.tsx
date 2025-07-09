
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, QrCode, Share2, Loader2, Users, ExternalLink } from "lucide-react";
import { generatePetPDF, generateQRCodeUrl, downloadPDF, generatePublicProfileUrl, shareProfile } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
}

export const PetPDFGenerator = ({ petId, petName }: PetPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emergencyPdfUrl, setEmergencyPdfUrl] = useState<string | null>(null);
  const [fullPdfUrl, setFullPdfUrl] = useState<string | null>(null);
  const [emergencyQrCodeUrl, setEmergencyQrCodeUrl] = useState<string | null>(null);
  const [fullQrCodeUrl, setFullQrCodeUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const publicProfileUrl = generatePublicProfileUrl(petId);

  const handleGeneratePDF = async (type: 'emergency' | 'full') => {
    setIsGenerating(true);
    try {
      console.log(`Starting ${type} PDF generation for pet:`, petId);
      
      const result = await generatePetPDF(petId, type);
      
      if (result.success && result.pdfUrl) {
        if (type === 'emergency') {
          setEmergencyPdfUrl(result.pdfUrl);
          setEmergencyQrCodeUrl(generateQRCodeUrl(result.pdfUrl));
        } else {
          setFullPdfUrl(result.pdfUrl);
          setFullQrCodeUrl(generateQRCodeUrl(result.pdfUrl));
        }
        
        setIsDialogOpen(true);
        
        toast({
          title: "PDF Generated Successfully",
          description: `${petName}'s ${type === 'emergency' ? 'emergency passport' : 'complete profile'} PDF is ready to download and share.`,
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
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, type: 'emergency' | 'full') => {
    if (!url) return;
    
    try {
      await downloadPDF(url, `${petName}-${type}-profile.html`);
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
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <FileText className="w-5 h-5" />
          <span>Pet Profiles & Sharing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-700">
          Generate shareable documents and profiles for {petName}. Choose between emergency info or complete profile.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={() => handleGeneratePDF('emergency')}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Emergency Passport
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleGeneratePDF('full')}
                disabled={isGenerating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Full Profile PDF
                  </>
                )}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share {petName}'s Profile</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Public Profile Link */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Public Profile Page
                  </h4>
                  <p className="text-sm text-gray-600">Share a read-only online profile that anyone can view</p>
                  <Button
                    onClick={handleSharePublicProfile}
                    disabled={isSharing}
                    variant="outline"
                    className="w-full"
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
                {emergencyPdfUrl && emergencyQrCodeUrl && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Emergency Passport PDF</h4>
                    <div className="text-center">
                      <img 
                        src={emergencyQrCodeUrl} 
                        alt="Emergency PDF QR Code" 
                        className="border-2 border-gray-300 rounded-lg mx-auto mb-2"
                        style={{width: '120px', height: '120px'}}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleDownload(emergencyPdfUrl, 'emergency')}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleShare(emergencyPdfUrl, 'emergency')}
                        variant="outline"
                        size="sm"
                        disabled={isSharing}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                {/* Full Profile PDF */}
                {fullPdfUrl && fullQrCodeUrl && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Complete Profile PDF</h4>
                    <div className="text-center">
                      <img 
                        src={fullQrCodeUrl} 
                        alt="Full Profile PDF QR Code" 
                        className="border-2 border-gray-300 rounded-lg mx-auto mb-2"
                        style={{width: '120px', height: '120px'}}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleDownload(fullPdfUrl, 'full')}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleShare(fullPdfUrl, 'complete')}
                        variant="outline"
                        size="sm"
                        disabled={isSharing}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                {/* In-App Sharing */}
                <div className="border-t pt-3">
                  <Button
                    onClick={() => {
                      setIsDialogOpen(false);
                      // Navigate to in-app sharing component
                      window.location.hash = 'share-with-members';
                    }}
                    variant="default"
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Share with PetPass Members
                  </Button>
                </div>

                {/* Direct Links */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Public Profile: {publicProfileUrl}</p>
                  {emergencyPdfUrl && <p className="break-all">Emergency PDF: {emergencyPdfUrl}</p>}
                  {fullPdfUrl && <p className="break-all">Full PDF: {fullPdfUrl}</p>}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
