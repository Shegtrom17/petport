
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Download, Share2, Loader2, Users, ExternalLink, LogIn, AlertTriangle, Eye, Heart, Dog, Camera, User } from "lucide-react";
import { generateQRCodeUrl, generatePublicProfileUrl, shareProfileOptimized, sharePDFBlob } from "@/services/pdfService";
import { generateClientPetPDF, viewPDFBlob, downloadPDFBlob, isIOS, isStandalonePWA } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { resolvePdfType, PDFType } from "@/utils/pdfType";

interface PetPDFGeneratorProps {
  petId: string;
  petName: string;
  petData?: any; // Add pet data prop for client-side generation
  handlePetUpdate?: () => Promise<void>;
}

interface PDFTypeConfig {
  key: 'emergency' | 'full' | 'care' | 'resume' | 'lost_pet' | 'gallery';
  title: string;
  description: string;
  editLocation: string;
  editPath: string;
  icon: any;
  available: boolean;
}

export const PetPDFGenerator = ({ petId, petName, petData, handlePetUpdate }: PetPDFGeneratorProps) => {
  // Auth state
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Dialog and loading states
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [selectedPdfType, setSelectedPdfType] = useState<'emergency' | 'full' | 'care' | 'resume' | 'lost_pet' | 'gallery' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [resolvedType, setResolvedType] = useState<PDFType | null>(null);
  const { toast } = useToast();

  // Define all PDF types
  const pdfTypes: PDFTypeConfig[] = [
    {
      key: 'emergency',
      title: 'Emergency Profile',
      description: 'Essential contact & medical info',
      editLocation: 'Complete Basic Information for best results',
      editPath: '#basic-info',
      icon: AlertTriangle,
      available: true
    },
    {
      key: 'full',
      title: 'General Profile',
      description: 'Essential pet information and photos from key profile sections',
      editLocation: 'All profile sections',
      editPath: '#profile',
      icon: FileText,
      available: true
    },
    {
      key: 'care',
      title: 'Care & Handling',
      description: 'Detailed care instructions',
      editLocation: 'Care Instructions section',
      editPath: '#care-instructions',
      icon: Heart,
      available: !!(petData?.careInstructions && (
        petData.careInstructions.feedingSchedule || 
        petData.careInstructions.morningRoutine || 
        petData.careInstructions.eveningRoutine || 
        petData.careInstructions.allergies || 
        petData.careInstructions.behavioralNotes || 
        petData.careInstructions.favoriteActivities || 
        petData.careInstructions.medications
      ))
    },
    {
      key: 'resume',
      title: 'Pet Resume',
      description: 'Skills, training & achievements',
      editLocation: 'Resume section',
      editPath: '#resume',
      icon: User,
      available: !!(petData && (
        (petData.experiences && petData.experiences.length > 0) ||
        (petData.achievements && petData.achievements.length > 0) ||
        (petData.training && petData.training.length > 0) ||
        (petData.reviews && petData.reviews.length > 0)
      ))
    },
    {
      key: 'lost_pet',
      title: 'Lost Pet Flyer',
      description: 'Missing pet alert document',
      editLocation: 'Complete Basic Information for comprehensive flyers',
      editPath: '#basic-info',
      icon: Dog,
      available: true
    },
    {
      key: 'gallery',
      title: 'Portrait Gallery',
      description: 'Photo collection document',
      editLocation: 'Gallery section',
      editPath: '#gallery',
      icon: Camera,
      available: !!(petData?.gallery_photos && petData.gallery_photos.length > 0)
    }
  ];

  const publicProfileUrl = generatePublicProfileUrl(petId);

  const showPdfOptions = (type: 'emergency' | 'full' | 'care' | 'resume' | 'lost_pet' | 'gallery') => {
    setAuthError(null);

    if (!user) {
      setAuthError("You must be signed in to generate PDF documents.");
      return;
    }

    // Check if the PDF type has required data
    const pdfConfig = pdfTypes.find(pdf => pdf.key === type);
    if (!pdfConfig?.available) {
      toast({
        title: "Missing Information",
        description: `Please add content to the ${pdfConfig?.editLocation} before generating this PDF.`,
        variant: "destructive",
      });
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
        console.log('🔧 PetPDFGenerator: Starting PDF generation', { 
        selectedPdfType, 
        petName: petData.name,
        action 
      });
      
      // Refresh pet data before generating PDF
      if (handlePetUpdate) {
        await handlePetUpdate();
      }
      
      // CRITICAL: Use client-side generation directly to ensure proper type handling
      // Emergency vs Full profiles have different content structures
      const normalizedType: PDFType = resolvePdfType(selectedPdfType as string);
      console.log('🔧 PetPDFGenerator: Resolved type', { input: selectedPdfType, normalizedType });
      const result = await generateClientPetPDF(petData, normalizedType);
      
      console.log('📄 PDF Generation Result:', {
        success: result.success,
        type: result.type || selectedPdfType,
        blobSize: result.blob?.size,
        fileName: result.fileName
      });

      if (result.success && result.blob) {
        setGeneratedPdfBlob(result.blob);
        setResolvedType((result.type as PDFType) || normalizedType);
        
        if (action === 'download') {
          // Use environment-aware download
          const resolved = (result.type as PDFType) || normalizedType;
          const fileName = `${petName}_${resolved}_profile.pdf`;
          try {
            await downloadPDFBlob(result.blob, fileName);
            toast({
              title: "Download Started",
              description: `${resolved === 'emergency' ? 'Emergency' : resolved === 'full' ? 'Complete' : resolved} profile PDF is downloading.`,
            });
            setIsOptionsDialogOpen(false);
          } catch (downloadError) {
            console.error('Download failed:', downloadError);
            toast({
              title: "Download Failed",
              description: "Please try using the Preview option and save from there.",
              variant: "destructive",
            });
          }
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
    // Use profile-share edge function for better social previews
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${petId}`;
    const shareUrl = `https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/profile-share?petId=${petId}&redirect=${encodeURIComponent(profileUrl)}`;
    await handleShare(shareUrl, "public");
  };

  return (
    <div className="space-y-4">
      {/* Passport-style header with circular pet photo */}
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: '#5691af' }}>
          <FileText className="w-6 h-6" style={{ color: '#5691af' }} />
          Quick PDF Generation
        </h3>
        <p className="text-sm mt-1" style={{ color: '#5691af' }}>
          Centralized PDF hub • Edit content in specific sections
        </p>
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


      {/* Document generation buttons in grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pdfTypes.map((pdfType) => {
          const IconComponent = pdfType.icon;
          const isAvailable = pdfType.available;
          const isDisabled = authLoading || (!user && !authError) || !isAvailable;
          
          return (
            <div key={pdfType.key} className={`bg-white p-3 rounded-lg border-2 shadow-sm relative ${
              isAvailable ? 'border-[#5691af]/30' : 'border-gray-300/50'
            }`}>
              <div 
                onClick={() => !isDisabled && showPdfOptions(pdfType.key)}
                className={`w-full cursor-pointer text-center transition-all duration-200 py-2 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } ${isAvailable ? 'text-navy-900 hover:text-gold-600' : 'text-gray-500'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {!user ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <IconComponent className={`w-5 h-5 ${isAvailable ? 'text-gold-600' : 'text-gray-400'}`} />
                  )}
                  <div>
                    <div className="font-semibold text-sm">
                      {!user ? 'Sign In Required' : pdfType.title}
                    </div>
                    {user && (
                      <>
                        <div className="text-xs text-gray-600 mt-1">
                          {pdfType.description}
                        </div>
                        {!isAvailable && (
                          <div className="text-xs text-orange-600 mt-1">
                            Add content in {pdfType.editLocation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF Options Dialog */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              {selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title} Options
            </DialogTitle>
            <DialogDescription>
              Generate, view, or download {petName}'s {selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.toLowerCase()} document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* PDF Actions */}
            {!generatedPdfBlob && !isGenerating && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  Choose how you'd like to use {petName}'s {selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.toLowerCase()}:
                </p>
                
                 <div className="grid grid-cols-2 gap-3">
                   <Button
                     onClick={() => handlePdfAction('view')}
                     variant="outline"
                     className="border-gold-500 text-gold-600 hover:bg-gold-50 text-xs sm:text-sm px-2 sm:px-4 h-auto py-2 flex-col sm:flex-row"
                   >
                     <Eye className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                     <span className="text-center">Generate & View</span>
                   </Button>
                   <Button
                     onClick={() => handlePdfAction('download')}
                     className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 text-xs sm:text-sm px-2 sm:px-4 h-auto py-2 flex-col sm:flex-row"
                   >
                     <Download className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                     <span className="text-center">Generate & Download</span>
                   </Button>
                 </div>
                 
                 <Button
                   onClick={() => handlePdfAction('view')}
                   variant="outline"
                   className="w-full border-navy-900 text-navy-900 hover:bg-navy-50 text-xs sm:text-sm px-2 sm:px-4 h-auto py-2 flex-col sm:flex-row"
                 >
                   <Share2 className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                   <span className="text-center">Generate & Share PDF</span>
                 </Button>
                
                <p className="text-xs text-navy-500 text-center">
                  💡 After generating, you'll see View | Download | Share options
                </p>
              </div>
            )}
            
            {/* Loading State */}
            {isGenerating && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gold-500" />
                <p className="text-navy-600">Generating {selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.toLowerCase()} PDF...</p>
              </div>
            )}
            
            {/* Generated PDF Actions */}
            {generatedPdfBlob && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-1">
                    {selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title} PDF
                  </h4>
                  {resolvedType && (
                    <p className="text-xs text-muted-foreground mb-2">Resolved type: {resolvedType}</p>
                  )}
                   <div className="grid grid-cols-3 gap-2 justify-center mb-3">
                     <Button
                       onClick={async () => {
                          if (generatedPdfBlob) {
                            const fileName = `PetPort_${selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.replace(/\s+/g, '_')}_${petName}.pdf`;
                           try {
                             await viewPDFBlob(generatedPdfBlob, fileName);
                           } catch (error) {
                             console.error('PDF view error:', error);
                             toast({
                               title: "View Failed",
                               description: "Could not open PDF. Please try downloading instead.",
                               variant: "destructive",
                             });
                           }
                         }
                       }}
                       variant="outline"
                       size="sm"
                       className="border-gold-500 text-gold-600 hover:bg-gold-50 text-xs sm:text-sm px-1 sm:px-3 h-auto py-2 flex-col sm:flex-row"
                     >
                       <Eye className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-1" />
                       <span className="text-center">View</span>
                     </Button>
                       <Button
                          onClick={async () => {
                            if (!generatedPdfBlob) return;
                            const fileName = `PetPort_${selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.replace(/\s+/g, '_')}_${petName}.pdf`;
                           try {
                             // Create a fresh blob for download to avoid security issues
                             const freshBlob = new Blob([await generatedPdfBlob.arrayBuffer()], { type: 'application/pdf' });
                             await downloadPDFBlob(freshBlob, fileName);
                             toast({
                               title: "Download Started",
                               description: "PDF download initiated.",
                             });
                           } catch (downloadError) {
                             console.error('Download failed:', downloadError);
                             toast({
                               title: "Download Failed", 
                               description: "Please try using Preview and save from there.",
                               variant: "destructive",
                             });
                           }
                         }}
                       variant="outline"
                       size="sm"
                       className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 text-xs sm:text-sm px-1 sm:px-3 h-auto py-2 flex-col sm:flex-row"
                     >
                       <Download className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-1" />
                        <span className="text-center">Download</span>
                      </Button>
                      {(isIOS() || isStandalonePWA()) && (
                        <div className="col-span-3 text-xs text-blue-600 text-center bg-blue-50 p-2 rounded border border-blue-200">
                          💡 On iPhone: Use Preview then Share → Save to Files
                        </div>
                      )}
                      <Button
                        onClick={async () => {
                          if (!generatedPdfBlob) return;
                          const fileName = `PetPort_${selectedPdfType && pdfTypes.find(p => p.key === selectedPdfType)?.title.replace(/\s+/g, '_')}_${petName}.pdf`;
                          // Map our PDF types to the accepted content types for sharing
                          const contentTypeMap: Record<string, 'profile' | 'care' | 'emergency' | 'credentials' | 'reviews'> = {
                            'emergency': 'emergency',
                            'full': 'profile',
                            'care': 'care',
                            'resume': 'credentials',
                            'lost_pet': 'profile',
                            'gallery': 'profile'
                          };
                          const contentType = contentTypeMap[selectedPdfType || 'full'] || 'profile';
                         const result = await sharePDFBlob(generatedPdfBlob, fileName, petName, contentType);
                         
                         if (result.success) {
                           toast({
                             title: result.shared ? "PDF Shared!" : "Link Copied!",
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
                       size="sm"
                       disabled={isSharing}
                       className="border-navy-900 text-navy-900 hover:bg-navy-50 text-xs sm:text-sm px-1 sm:px-3 h-auto py-2 flex-col sm:flex-row"
                     >
                       <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-1" />
                       <span className="text-center">Share</span>
                     </Button>
                   </div>
                </div>

                {/* Sharing Options */}
                <div className="border-t border-gold-500/30 pt-4 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Your profile must be public to share with others. PDF generation works for all profiles.
                    </p>
                  </div>
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
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
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
