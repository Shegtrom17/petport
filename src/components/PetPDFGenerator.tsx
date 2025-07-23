
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Download, Share2, Loader2, Users, ExternalLink, LogIn, AlertTriangle, Eye } from "lucide-react";
import { generatePetPDF, generateQRCodeUrl, downloadPDFBlob, viewPDFBlob, generatePublicProfileUrl, shareProfileOptimized } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
}

export const PetPDFGenerator = ({ petId, petName }: PetPDFGeneratorProps) => {
  // Auth state
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Separate loading states for each button
  const [isGeneratingEmergency, setIsGeneratingEmergency] = useState(false);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  
  const [emergencyPdfBlob, setEmergencyPdfBlob] = useState<Blob | null>(null);
  const [fullPdfBlob, setFullPdfBlob] = useState<Blob | null>(null);
  const [emergencyQrCodeUrl, setEmergencyQrCodeUrl] = useState<string | null>(null);
  const [fullQrCodeUrl, setFullQrCodeUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const publicProfileUrl = generatePublicProfileUrl(petId);

  const handleGeneratePDF = async (type: 'emergency' | 'full') => {
    // Clear any previous auth errors
    setAuthError(null);
    
    // Check authentication first
    if (!user) {
      setAuthError("You must be signed in to generate PDF documents.");
      return;
    }

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
        // Handle specific error cases
        const errorMessage = result.error || 'Failed to generate PDF';
        if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
          setAuthError("Your session has expired. Please sign in again to generate PDFs.");
        } else {
          toast({
            title: "Generation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      
      // Handle authentication errors
      if (error?.message?.includes('unauthorized') || error?.message?.includes('JWT')) {
        setAuthError("Authentication error. Please sign in again to generate PDFs.");
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
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

  const handleView = async (blob: Blob | null, type: 'emergency' | 'full') => {
    if (!blob) return;
    
    try {
      const fileName = type === 'emergency' 
        ? `PetPort_Emergency_Profile_${petName}.pdf`
        : `PetPort_Complete_Profile_${petName}.pdf`;
      await viewPDFBlob(blob, fileName);
      toast({
        title: "PDF Opened",
        description: `${petName}'s ${type} profile opened in new tab.`,
      });
    } catch (error) {
      toast({
        title: "View Failed",
        description: error instanceof Error ? error.message : "Could not view the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (url: string, type: string) => {
    if (!url) return;
    
    setIsSharing(true);
    try {
      const contentType = type === 'emergency' ? 'emergency' : 'profile';
      const result = await shareProfileOptimized(url, petName, contentType);
      
      if (result.success) {
        if (result.shared) {
          toast({
            title: "Profile Shared! 📱",
            description: `${petName}'s ${type} profile shared successfully.`,
          });
        } else {
          toast({
            title: "Link Copied! 📋",
            description: `${type} profile link copied - share with anyone!`,
          });
        }
      } else {
        if (result.error === 'Share cancelled') {
          return; // Don't show error for user cancellation
        }
        throw new Error(result.error || 'Sharing failed');
      }
    } catch (error) {
      toast({
        title: "Unable to Share",
        description: "Please try again or copy the link manually.",
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

      {/* Authentication Alert */}
      {authError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="mt-2">
            {authError}
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="mt-2 ml-0 border-red-300 text-red-700 hover:bg-red-50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Auth Status Info */}
      {!user && !authLoading && !authError && (
        <Alert>
          <LogIn className="h-4 w-4" />
          <AlertTitle>Sign In Required</AlertTitle>
          <AlertDescription className="mt-2">
            You must be signed in to generate and download PDF documents.
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="mt-2 ml-0"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Continue
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Document generation buttons in stamped boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div className="absolute top-2 right-2 w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gold-600">1</span>
          </div>
          <h4 className="font-serif font-bold text-navy-900 mb-2 border-b border-gold-500/50 pb-1">🚨 Emergency Profile</h4>
          <p className="text-sm text-navy-600 mb-3">Essential medical and contact information</p>
          <Button 
            onClick={() => handleGeneratePDF('emergency', 'view')}
            disabled={isGeneratingEmergency || authLoading || (!user && !authError)}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 disabled:opacity-50"
          >
            {isGeneratingEmergency ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : !user ? (
              <LogIn className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            {!user ? 'Sign In to Generate' : 'Generate Emergency PDF'}
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div className="absolute top-2 right-2 w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gold-600">2</span>
          </div>
          <h4 className="font-serif font-bold text-navy-900 mb-2 border-b border-gold-500/50 pb-1">Complete Profile</h4>
          <p className="text-sm text-navy-600 mb-3">Full passport with all certifications</p>
          <Button 
            onClick={() => handleGeneratePDF('full', 'view')}
            disabled={isGeneratingFull || authLoading || (!user && !authError)}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 disabled:opacity-50"
          >
            {isGeneratingFull ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : !user ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Generate
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
                <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                  <Button
                    onClick={() => handleView(emergencyPdfBlob, 'emergency')}
                    variant="outline"
                    className="border-gold-500 text-gold-600 hover:bg-gold-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handleDownload(emergencyPdfBlob, 'emergency')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}

            {/* Full Profile PDF */}
            {fullPdfBlob && (
              <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                <h4 className="font-serif font-bold text-navy-900 mb-3">Complete Profile PDF</h4>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                  <Button
                    onClick={() => handleView(fullPdfBlob, 'full')}
                    variant="outline"
                    className="border-gold-500 text-gold-600 hover:bg-gold-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handleDownload(fullPdfBlob, 'full')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
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
