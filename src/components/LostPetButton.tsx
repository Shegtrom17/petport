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
}

export const LostPetButton = ({ petId, petName = "Pet", isMissing = false, className = "", petData, lostPetData }: LostPetButtonProps) => {
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
  
  // Check if we have complete lost pet data
  const hasCompleteLostPetData = activeLostPetData && (
    activeLostPetData.last_seen_location || 
    activeLostPetData.last_seen_date || 
    activeLostPetData.distinctive_features || 
    activeLostPetData.reward_amount
  );
  
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
    navigate(`/lost-pet/${petId}`);
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    setIsGenerating(true);
    try {
      if (!petData) {
        throw new Error('Pet data not available for PDF generation');
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
        } text-white shadow-lg hover:shadow-xl transition-all ${className}`}
      >
        {isMissing ? (
          <>
            <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
            MISSING FLYER
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Missing Pet Flyer
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

            {/* Data Completeness Check */}
            {!isLoadingLostPetData && !hasCompleteLostPetData && !generatedPdfBlob && !isGenerating && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      Improve Your Flyer's Effectiveness
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      A complete flyer with last seen location, date, and distinctive features 
                      significantly increases the chances of finding {petName}.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={navigateToLostPetPage}
                        variant="outline"
                        size="sm"
                        className="border-amber-500 text-amber-700 hover:bg-amber-100"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Complete Details
                      </Button>
                      <Button
                        onClick={() => setIsOptionsDialogOpen(false)}
                        size="sm"
                        className="bg-amber-600 text-white hover:bg-amber-700"
                        disabled={isGenerating}
                      >
                        Continue Anyway
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Actions */}
            {!isLoadingLostPetData && !generatedPdfBlob && !isGenerating && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  {hasCompleteLostPetData ? 
                    `Generate ${petName}'s missing pet flyer:` : 
                    `Generate a basic flyer with available information:`
                  }
                </p>
                
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