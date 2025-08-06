
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Download, Share2, Loader2, Users, ExternalLink, LogIn, AlertTriangle, Eye } from "lucide-react";
import { generateQRCodeUrl, generatePublicProfileUrl, shareProfileOptimized } from "@/services/pdfService";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
  petData?: any; // Add pet data prop for client-side generation
}

export const PetPDFGenerator = ({ petId, petName, petData }: PetPDFGeneratorProps) => {
  // Auth state
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Dialog and loading states
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [selectedPdfType, setSelectedPdfType] = useState<'emergency' | 'full' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const publicProfileUrl = generatePublicProfileUrl(petId);

  const showPdfOptions = (type: 'emergency' | 'full') => {
    setAuthError(null);

    if (!user) {
      setAuthError("You must be signed in to generate PDF documents.");
      return;
    }

    setSelectedPdfType(type);
    setIsOptionsDialogOpen(true);
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    if (!selectedPdfType || !petData) {
      toast({
        title: "Error",
        description: "Pet data not available for PDF generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateClientPetPDF(petData, selectedPdfType);

      if (result.success && result.pdfBlob) {
        setGeneratedPdfBlob(result.pdfBlob);
        
        if (action === 'download') {
          // Direct download
          const fileName = `${petName}_${selectedPdfType}_profile.pdf`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(result.pdfBlob);
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          
          toast({
            title: "Download Started",
            description: `${selectedPdfType === 'emergency' ? 'Emergency' : 'Complete'} profile PDF is downloading.`,
          });
          
          setIsOptionsDialogOpen(false);
        }
        // If action is 'view', keep dialog open to show PDF options
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


  const handleShare = async (url: string, type: string) => {
    if (!url) return;
    
    setIsSharing(true);
    try {
      const contentType = type === 'emergency' ? 'emergency' : 'profile';
      const result = await shareProfileOptimized(url, petName, contentType);
      
      if (result.success) {
        if (result.shared) {
          toast({
            title: "Profile Shared!",
            description: `${petName}'s ${type} profile shared successfully.`,
          });
        } else {
          toast({
            title: "Link Copied!",
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
            <h3 className="text-xl font-bold text-gold-500 tracking-wide border-b-2 border-gold-500 pb-1 mb-2">
              OFFICIAL DOCUMENTS
            </h3>
            <p className="text-gold-200 text-sm">Generate and share {petName}'s Petport documents</p>
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
        <div className="bg-white p-3 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div 
            onClick={() => showPdfOptions('emergency')}
            className={`w-full cursor-pointer flex items-center justify-center text-navy-900 hover:text-gold-600 hover:scale-110 transition-all duration-200 py-2 ${(authLoading || (!user && !authError)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!user ? (
              <LogIn className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            {!user ? 'Sign In to Generate' : 'Generate Emergency PDF'}
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border-2 border-gold-500/30 shadow-sm relative">
          <div 
            onClick={() => showPdfOptions('full')}
            className={`w-full cursor-pointer flex items-center justify-center text-navy-900 hover:text-gold-600 hover:scale-110 transition-all duration-200 py-2 ${(authLoading || (!user && !authError)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!user ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Generate
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Complete Profile PDF
              </>
            )}
          </div>
        </div>
      </div>

      {/* PDF Options Dialog */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              {selectedPdfType === 'emergency' ? 'Emergency' : 'Complete'} Profile Options
            </DialogTitle>
            <DialogDescription>
              Generate, view, or download {petName}'s {selectedPdfType === 'emergency' ? 'emergency' : 'complete'} profile document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* PDF Actions */}
            {!generatedPdfBlob && !isGenerating && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  Choose how you'd like to use {petName}'s {selectedPdfType === 'emergency' ? 'emergency' : 'complete'} profile:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handlePdfAction('view')}
                    variant="outline"
                    className="border-gold-500 text-gold-600 hover:bg-gold-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handlePdfAction('download')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isGenerating && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gold-500" />
                <p className="text-navy-600">Generating {selectedPdfType === 'emergency' ? 'emergency' : 'complete'} profile PDF...</p>
              </div>
            )}
            
            {/* Generated PDF Actions */}
            {generatedPdfBlob && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-3">
                    {selectedPdfType === 'emergency' ? 'Emergency Profile PDF' : 'Complete Profile PDF'}
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(generatedPdfBlob);
                        window.open(url, '_blank')?.focus();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="border-gold-500 text-gold-600 hover:bg-gold-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const fileName = `PetPort_${selectedPdfType === 'emergency' ? 'Emergency' : 'Complete'}_Profile_${petName}.pdf`;
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(generatedPdfBlob);
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                {/* Sharing Options */}
                <div className="border-t border-gold-500/30 pt-4 space-y-3">
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
                  
                  <Button
                    onClick={() => {
                      setIsOptionsDialogOpen(false);
                      window.location.hash = 'share-with-members';
                    }}
                    className="w-full bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Share with PetPort Members
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
