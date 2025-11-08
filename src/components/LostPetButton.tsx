import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Download, Eye, Loader2, MapPin, ExternalLink } from "lucide-react";
import { generatePublicProfileUrl, shareProfileOptimized } from "@/services/pdfService";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LostPetButtonProps {
  petId?: string;
  petName?: string;
  isMissing?: boolean;
  className?: string;
  petData?: any;
  lostPetData?: any;
  handlePetUpdate?: () => Promise<void>;
}

export const LostPetButton = ({ petId, petName = "Pet", isMissing = false, className = "", petData, lostPetData, handlePetUpdate }: LostPetButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dialog and loading states - exact same pattern as PetPDFGenerator
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [fetchedLostPetData, setFetchedLostPetData] = useState<any>(null);
  const [isLoadingLostPetData, setIsLoadingLostPetData] = useState(false);
  
  // Use provided lostPetData or fetch it if needed
  const activeLostPetData = lostPetData || fetchedLostPetData;
  
  // Enhanced data completeness analysis
  const getDataCompleteness = (data: any) => {
    if (!data) return { 
      level: 'none', 
      hasEssential: false, 
      hasRecommended: false, 
      hasComplete: false,
      missingFields: {
        location: true,
        date: true,
        features: true,
        reward: true,
        notes: true
      }
    };
    
    const hasEssential = data.last_seen_location && data.last_seen_date;
    const hasRecommended = hasEssential && data.distinctive_features;
    const hasComplete = hasRecommended && (data.reward_amount || data.behavioral_notes);
    
    return {
      level: hasComplete ? 'complete' : hasRecommended ? 'recommended' : hasEssential ? 'essential' : 'incomplete',
      hasEssential,
      hasRecommended,
      hasComplete,
      missingFields: {
        location: !data.last_seen_location,
        date: !data.last_seen_date,
        features: !data.distinctive_features,
        reward: !data.reward_amount,
        notes: !data.behavioral_notes
      }
    };
  };

  const dataCompleteness = getDataCompleteness(activeLostPetData);
  const hasCompleteLostPetData = dataCompleteness.hasRecommended;
  
  const hasAnyLostPetData = activeLostPetData && Object.keys(activeLostPetData).length > 0;

  // Fetch lost pet data when dialog opens if we don't have it
  useEffect(() => {
    const fetchLostPetData = async () => {
      if (!petId || lostPetData || !isOptionsDialogOpen) return;
      
      setIsLoadingLostPetData(true);
      try {
        const { data, error } = await supabase
          .from('lost_pet_data')
          .select('*')
          .eq('pet_id', petId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading lost pet data:', error);
          return;
        }

        if (data) {
          setFetchedLostPetData({
            is_missing: data.is_missing || false,
            last_seen_location: data.last_seen_location || "",
            last_seen_date: data.last_seen_date ? new Date(data.last_seen_date) : null,
            last_seen_time: data.last_seen_time || "",
            distinctive_features: data.distinctive_features || "",
            reward_amount: data.reward_amount || "",
            finder_instructions: data.finder_instructions || "",
            contact_priority: data.contact_priority || "",
            emergency_notes: data.emergency_notes || ""
          });
        }
      } catch (error) {
        console.error('Error fetching lost pet data:', error);
      } finally {
        setIsLoadingLostPetData(false);
      }
    };

    fetchLostPetData();
  }, [petId, lostPetData, isOptionsDialogOpen]);

  const showPdfOptions = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate a missing pet flyer.",
        variant: "destructive",
      });
      return;
    }

    if (!petId) {
      toast({
        title: "No Pet Selected",
        description: "Please select a pet to generate a missing pet flyer.",
        variant: "destructive",
      });
      return;
    }

    setIsOptionsDialogOpen(true);
  };

  const navigateToLostPetPage = () => {
    setIsOptionsDialogOpen(false);
    navigate('/app');
    window.dispatchEvent(new Event('navigate-to-quickid'));
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    setIsGenerating(true);
    try {
      if (!petData) {
        throw new Error('Pet data not available for PDF generation');
      }

      // Refresh pet data before generating PDF
      if (handlePetUpdate) {
        await handlePetUpdate();
      }

      console.log('LostPetButton - Generating PDF for pet:', petData.name, petData.id);
      console.log('LostPetButton - Lost pet data:', activeLostPetData);
      
      // Combine pet data with lost pet data for PDF generation
      const combinedData = {
        ...petData,
        ...activeLostPetData
      };
      
      const result = await generateClientPetPDF(combinedData, 'lost_pet');
      
      if (!result.success || !result.blob) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      setGeneratedPdfBlob(result.blob);

      if (action === 'view') {
        const url = URL.createObjectURL(result.blob);
        window.open(url, '_blank')?.focus();
        URL.revokeObjectURL(url);
      } else if (action === 'download') {
        const fileName = `${petName}_Missing_Pet_Flyer.pdf`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(result.blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }

      toast({
        title: "Success",
        description: `Missing pet flyer ${action === 'view' ? 'opened' : 'downloaded'} successfully!`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setGeneratedPdfBlob(null);
      setIsOptionsDialogOpen(false);
      toast({
        title: "Error",
        description: "Failed to generate missing pet flyer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={showPdfOptions}
        className={`bg-gradient-to-r ${
          isMissing 
            ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500' 
            : 'from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300'
        } text-white shadow-lg hover:shadow-xl transition-all whitespace-nowrap ${className}`}
      >
        {isMissing ? (
          <>
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-2 animate-pulse flex-shrink-0" />
            <span className="hidden xs:inline sm:hidden">MISSING</span>
            <span className="xs:hidden sm:inline">MISSING FLYER</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-2 flex-shrink-0" />
            Lost Pet Flyer
          </>
        )}
      </Button>

      {/* PDF Options Dialog - exact same pattern as PetPDFGenerator */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-red-500 pb-2">
              🚨 Missing Pet Flyer Options
            </DialogTitle>
            <DialogDescription>
              Generate and download {petName}'s missing pet flyer for printing and sharing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Loading Lost Pet Data */}
            {isLoadingLostPetData && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-navy-600">Loading lost pet information...</p>
              </div>
            )}

            {/* Enhanced Data Completeness Check */}
            {!isLoadingLostPetData && !hasCompleteLostPetData && !generatedPdfBlob && !isGenerating && (
              <div className={`rounded-lg p-4 ${
                !dataCompleteness.hasEssential 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    !dataCompleteness.hasEssential ? 'text-red-600' : 'text-amber-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      !dataCompleteness.hasEssential ? 'text-red-800' : 'text-amber-800'
                    }`}>
                      {!dataCompleteness.hasEssential 
                        ? 'Critical Information Missing' 
                        : 'Enhance Your Flyer'}
                    </h4>
                    
                    {/* Context-specific messaging */}
                    <div className={`text-sm mb-3 ${
                      !dataCompleteness.hasEssential ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      {!dataCompleteness.hasEssential ? (
                        <div>
                          <p className="mb-2">Your flyer needs essential information to be effective:</p>
                          <ul className="space-y-1 ml-4">
                            {dataCompleteness.missingFields.location && (
                              <li>• Last seen location (where to search)</li>
                            )}
                            {dataCompleteness.missingFields.date && (
                              <li>• Last seen date (timeline importance)</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2">Adding these details will make your flyer more effective:</p>
                          <ul className="space-y-1 ml-4">
                            {dataCompleteness.missingFields.features && (
                              <li>• Distinctive features (helps identify {petName})</li>
                            )}
                            {dataCompleteness.missingFields.reward && (
                              <li>• Reward amount (increases motivation to help)</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={navigateToLostPetPage}
                        variant="outline"
                        size="sm"
                        className={`${
                          !dataCompleteness.hasEssential 
                            ? 'border-red-500 text-red-700 hover:bg-red-100' 
                            : 'border-amber-500 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {!dataCompleteness.hasEssential ? 'Add Essential Info' : 'Complete Details'}
                      </Button>
                      {dataCompleteness.hasEssential && (
                        <Button
                          onClick={() => setIsOptionsDialogOpen(false)}
                          size="sm"
                          className="bg-amber-600 text-white hover:bg-amber-700"
                          disabled={isGenerating}
                        >
                          Generate Anyway
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Actions */}
            {!isLoadingLostPetData && !generatedPdfBlob && !isGenerating && (
              <div className="space-y-3">
                {hasCompleteLostPetData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-green-800">
                        {dataCompleteness.level === 'complete' 
                          ? 'Complete information - Ready for an effective flyer!' 
                          : 'Good information - Your flyer will be helpful!'}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-navy-600 text-center">
                  {hasCompleteLostPetData ? 
                    `Generate ${petName}'s missing pet flyer:` : 
                    `Generate a basic flyer with available information:`
                  }
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => window.open(`/missing/${petId}`, '_blank')}
                    variant="azure"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Lost Pet Page
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handlePdfAction('view')}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => handlePdfAction('download')}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isGenerating && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                <p className="text-navy-600">Generating missing pet flyer...</p>
              </div>
            )}
            
            {/* Generated PDF Actions */}
            {generatedPdfBlob && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-red-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-3">
                    🚨 Missing Pet Flyer PDF
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(generatedPdfBlob);
                        window.open(url, '_blank')?.focus();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const fileName = `${petName}_Missing_Pet_Flyer.pdf`;
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(generatedPdfBlob);
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};