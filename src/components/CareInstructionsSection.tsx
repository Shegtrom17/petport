import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from "@/components/ui/drawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Input } from "@/components/ui/input";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle, Edit, Loader2, FileText, Download, Share2, ExternalLink, Eye, Phone, Copy, Stethoscope, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollControls } from "@/components/ui/scroll-controls";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { extractPhoneNumber, formatPhoneForTel } from "@/utils/contactUtils";
import { CareInstructionsEditForm } from "@/components/CareInstructionsEditForm";
import { fetchCareInstructions } from "@/services/careInstructionsService";
import { generateQRCodeUrl, shareProfile, shareProfileOptimized, sharePDFBlob, generatePublicCareUrl } from "@/services/pdfService";
import { generateClientPetPDF, downloadPDFBlob } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { AICareAssistantModal } from "@/components/AICareAssistantModal";
import { AIMedicalAssistantModal } from "@/components/AIMedicalAssistantModal";

interface CareInstructionsSectionProps {
  petData: any;
  onUpdate?: () => void;
  handlePetUpdate?: () => Promise<void>;
}


export const CareInstructionsSection = ({ petData, onUpdate, handlePetUpdate }: CareInstructionsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [careData, setCareData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [careShareDialogOpen, setCareShareDialogOpen] = useState(false);
  const [isAICareModalOpen, setIsAICareModalOpen] = useState(false);
  const [isAIMedicalModalOpen, setIsAIMedicalModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const isHorse = petData.species?.toLowerCase() === 'horse';
  const isMobile = useIsMobile();


  // Load care instructions from database
  useEffect(() => {
    const loadCareInstructions = async () => {
      try {
        console.log("Loading care instructions for display, pet:", petData.id);
        const data = await fetchCareInstructions(petData.id);
        console.log("Loaded care data:", data);
        setCareData(data);
      } catch (error) {
        console.error("Error loading care instructions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load care instructions."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCareInstructions();
  }, [petData.id, toast]);

  const handleSave = async () => {
    setIsEditing(false);
    setIsLoading(true);
    
    // Reload the care data after saving
    try {
      const data = await fetchCareInstructions(petData.id);
      setCareData(data);
      
      // Trigger parent data refresh to update medications display
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error reloading care instructions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPdfOptions = () => {
    setIsPdfDialogOpen(true);
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    setIsGeneratingPDF(true);
    
    try {
      // Refresh pet data to get latest care data before generating PDF
      if (handlePetUpdate) {
        await handlePetUpdate();
      }
      
      console.log('Starting care instructions PDF generation for pet:', petData.id);
      
      // Fetch medical data to include in PDF
      const { data: medicalData } = await supabase
        .from('medical')
        .select('medical_conditions, medical_alert, last_vaccination, medical_emergency_document')
        .eq('pet_id', petData.id)
        .single();
      
      // Combine pet data with medical data for PDF generation
      const enhancedPetData = {
        ...petData,
        medical_conditions: medicalData?.medical_conditions,
        medical_alert: medicalData?.medical_alert,
        last_vaccination: medicalData?.last_vaccination,
        medical_emergency_document: medicalData?.medical_emergency_document
      };
      
      const result = await generateClientPetPDF(enhancedPetData, 'care');
      
      if (result.success && result.blob) {
        setGeneratedPdfBlob(result.blob);
        
        if (action === 'download') {
          const filename = `${petData.name}_Care_Instructions.pdf`;
          try {
            await downloadPDFBlob(result.blob, filename);
            toast({
              title: "PDF downloaded successfully!",
              description: `${petData.name}'s care instructions PDF has been downloaded.`,
            });
            setIsPdfDialogOpen(false);
          } catch (downloadError) {
            console.error('Download failed:', downloadError);
            toast({
              title: "Download failed",
              description: "Please try using Preview and save from there.",
              variant: "destructive",
            });
          }
        } else if (action === 'view') {
          const filename = `${petData.name}_Care_Instructions.pdf`;
          const { viewPDFBlob } = await import('@/services/clientPdfService');
          await viewPDFBlob(result.blob, filename);
        }
      } else {
        toast({
          title: "PDF Generation Failed",
          description: result.error || "Failed to generate PDF",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    if (generatedPdfBlob) {
      const filename = `${petData.name}_Care_Instructions.pdf`;
      const { viewPDFBlob } = await import('@/services/clientPdfService');
      await viewPDFBlob(generatedPdfBlob, filename);
    }
  };

  const handleDownloadGeneratedPDF = async () => {
    if (generatedPdfBlob) {
      const filename = `${petData.name}_Care_Instructions.pdf`;
      // Create a fresh blob for download to avoid security issues
      const freshBlob = new Blob([await generatedPdfBlob.arrayBuffer()], { type: 'application/pdf' });
      await downloadPDFBlob(freshBlob, filename);
      toast({
        title: "PDF downloaded successfully!",
        description: `${petData.name}'s care instructions PDF has been downloaded.`,
      });
    }
  };

  const handleShareCareLink = async () => {
    const careUrl = generatePublicCareUrl(petData.id);
    setIsSharing(true);
    try {
      const result = await shareProfileOptimized(careUrl, petData.name, 'care');
      
      if (result.success) {
        if (result.shared) {
          toast({
            title: "Care Instructions Shared! 📱",
            description: `${petData.name}'s care instructions shared successfully.`,
          });
        } else {
          toast({
            title: "Link Copied! 📋",
            description: "Care instructions link copied - share with caretakers!",
          });
        }
      } else {
        if (result.error === 'Share cancelled') {
          return; // Don't show error for user cancellation
        }
        throw new Error(result.error || 'Sharing failed');
      }
    } catch (error) {
      console.error('Failed to share care instructions:', error);
      toast({
        title: "Unable to Share",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  
  if (isEditing) {
    return (
      <CareInstructionsEditForm
        petData={{
          ...petData,
          careInstructions: careData ? {
            feedingSchedule: careData.feeding_schedule,
            morningRoutine: careData.morning_routine,
            eveningRoutine: careData.evening_routine,
            allergies: careData.allergies,
            behavioralNotes: careData.behavioral_notes,
            favoriteActivities: careData.favorite_activities,
            caretakerNotes: careData.caretaker_notes
          } : {}
        }}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading care instructions...</p>
        </CardContent>
      </Card>
    );
  }

  // Parse feeding schedule - if saved data exists, use it; otherwise show defaults
  const getFeedingScheduleItems = () => {
    if (careData?.feeding_schedule) {
      // If there's saved feeding schedule, display it as a single item
      return [
        { 
          time: "Custom Schedule", 
          meal: careData.feeding_schedule, 
          notes: "As specified by owner" 
        }
      ];
    }
    
    // Default schedule based on species
    if (isHorse) {
      return [
        { time: "6:00 AM", meal: "Morning hay - 2 flakes timothy", notes: "Check water buckets" },
        { time: "12:00 PM", meal: "Grain feed - 2 lbs sweet feed", notes: "Add supplements" },
        { time: "6:00 PM", meal: "Evening hay - 2 flakes", notes: "Turn out or bring in from pasture" },
      ];
    } else {
      return [
        { time: "7:00 AM", meal: "Morning feed - 2 cups dry food + supplements", notes: "Mix with warm water if preferred" },
        { time: "12:00 PM", meal: "Light snack - Training treats only", notes: "If active/training day" },
        { time: "6:00 PM", meal: "Evening feed - 2 cups dry food", notes: "Fresh water always available" },
      ];
    }
  };

  const feedingScheduleItems = getFeedingScheduleItems();

  return (
    <div className="space-y-6">


      {/* Care Summary */}
      <Card className="border-0 shadow-xl bg-brand-primary text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1">
              <Heart className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold">Care Instructions</h2>
                <p className="text-blue-100">Complete care guide for {petData.name}</p>
                <p className="text-xs text-blue-200 mt-2"><strong>Profile must be public to share.</strong></p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 ml-6">
              <div
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Edit care instructions"
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </div>
              <div
                onClick={showPdfOptions}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Generate PDF"
                onKeyDown={(e) => e.key === 'Enter' && showPdfOptions()}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </div>
              {isMobile ? (
                <Drawer open={careShareDialogOpen} onOpenChange={setCareShareDialogOpen}>
                  <DrawerTrigger asChild>
                    <div
                      className={`flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label="Share care instructions"
                      onKeyDown={(e) => e.key === 'Enter' && !isSharing && setCareShareDialogOpen(true)}
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span className="text-sm">Share</span>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent className="px-4 bg-[#f8f8f8]">
                    <DrawerHeader>
                      <DrawerTitle className="text-navy-900 border-b-2 border-gold-500 pb-2">
                        🌿 Share {petData.name}'s Care Instructions
                      </DrawerTitle>
                      <DrawerDescription className="text-navy-600 text-sm">
                        Share your pet's care instructions with pet sitters and caregivers
                      </DrawerDescription>
                    </DrawerHeader>
                    <div ref={dialogContentRef} className="max-h-[75vh] overflow-y-auto space-y-6">
                      <ScrollControls targetRef={dialogContentRef} />
                      {/* Public Care Instructions Link */}
                      <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gold-500/20 rounded-full flex items-center justify-center">
                            <ExternalLink className="w-3 h-3 text-gold-600" />
                          </div>
                          Public Care Instructions
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">Share detailed daily care info with pet sitters and caregivers. <strong>Profile must be public to share.</strong></p>

                        <Button
                          onClick={handleShareCareLink}
                          disabled={isSharing || !petData.is_public}
                          variant="outline"
                          className="w-full border-border text-foreground hover:bg-muted"
                        >
                          {isSharing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Share2 className="w-4 h-4 mr-2" />
                          )}
                          Get Shareable Link
                        </Button>
                        {!petData.is_public && (
                          <p className="text-xs text-red-700 mt-2">Make your pet profile public to enable sharing.</p>
                        )}
                      </div>

                      {/* Social sharing options */}
                      {petData.is_public ? (
                        <div className="w-full min-w-0">
                          <ErrorBoundary>
                            <SocialShareButtons 
                              petName={petData.name} 
                              petId={petData.id} 
                              context="care" 
                              shareUrlOverride={generatePublicCareUrl(petData.id)} 
                              defaultOpenOptions={true}
                            />
                          </ErrorBoundary>
                        </div>
                      ) : null}

                      {/* QR Code Section */}
                      {petData.is_public ? (
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-3 text-center">Care Instructions QR Code</h4>
                          <p className="text-sm text-muted-foreground mb-4 text-center">
                            Scan to view care instructions
                          </p>
                          <div className="flex flex-col items-center space-y-4">
                            <ErrorBoundary>
                              <img 
                                src={generateQRCodeUrl(generatePublicCareUrl(petData.id), 200)} 
                                alt="QR Code for Care Instructions"
                                className="border rounded-lg"
                                onError={(e) => {
                                  console.error('QR Code failed to load');
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </ErrorBoundary>
                            <div className="w-full">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={generatePublicCareUrl(petData.id)}
                                  readOnly
                                  className="text-xs"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatePublicCareUrl(petData.id));
                                    toast({
                                      title: "URL copied!",
                                      description: "Care instructions URL copied to clipboard",
                                    });
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Direct Links */}
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-lg">
                        <p className="font-medium">Direct Links:</p>
                        <p className="break-all">Care: {generatePublicCareUrl(petData.id)}</p>
                        {generatedPdfBlob && <p className="break-all">PDF: Available after generation</p>}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={careShareDialogOpen} onOpenChange={setCareShareDialogOpen}>
                  <DialogTrigger asChild>
                    <div
                      className={`flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label="Share care instructions"
                      onKeyDown={(e) => e.key === 'Enter' && !isSharing && setCareShareDialogOpen(true)}
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span className="text-sm">Share</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent 
                    ref={dialogContentRef}
                    className="max-w-[100vw] sm:max-w-md w-full min-w-0 max-h-[90vh] overflow-y-auto bg-[#f8f8f8] px-4"
                  >
                    <ScrollControls targetRef={dialogContentRef} />
                    <DialogHeader>
                      <DialogTitle className="text-navy-900 border-b-2 border-gold-500 pb-2">
                        🌿 Share {petData.name}'s Care Instructions
                      </DialogTitle>
                      <DialogDescription className="text-navy-600 text-sm">
                        Share your pet's care instructions with pet sitters and caregivers
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Public Care Instructions Link */}
                      <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gold-500/20 rounded-full flex items-center justify-center">
                            <ExternalLink className="w-3 h-3 text-gold-600" />
                          </div>
                          Public Care Instructions
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">Share detailed daily care info with pet sitters and caregivers. <strong>Profile must be public to share.</strong></p>

                        <Button
                          onClick={handleShareCareLink}
                          disabled={isSharing || !petData.is_public}
                          variant="outline"
                          className="w-full border-border text-foreground hover:bg-muted"
                        >
                          {isSharing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Share2 className="w-4 h-4 mr-2" />
                          )}
                          Get Shareable Link
                        </Button>
                        {!petData.is_public && (
                          <p className="text-xs text-red-700 mt-2">Make your pet profile public to enable sharing.</p>
                        )}
                      </div>

                      {/* Social sharing options */}
                      {petData.is_public ? (
                        <div className="w-full min-w-0">
                          <ErrorBoundary>
                            <SocialShareButtons 
                              petName={petData.name} 
                              petId={petData.id} 
                              context="care" 
                              shareUrlOverride={generatePublicCareUrl(petData.id)} 
                              defaultOpenOptions={true}
                            />
                          </ErrorBoundary>
                        </div>
                      ) : null}

                      {/* QR Code Section */}
                      {petData.is_public ? (
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-3 text-center">Care Instructions QR Code</h4>
                          <p className="text-sm text-muted-foreground mb-4 text-center">
                            Scan to view care instructions
                          </p>
                          <div className="flex flex-col items-center space-y-4">
                            <ErrorBoundary>
                              <img 
                                src={generateQRCodeUrl(generatePublicCareUrl(petData.id), 200)} 
                                alt="QR Code for Care Instructions"
                                className="border rounded-lg"
                                onError={(e) => {
                                  console.error('QR Code failed to load');
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </ErrorBoundary>
                            <div className="w-full">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={generatePublicCareUrl(petData.id)}
                                  readOnly
                                  className="text-xs"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatePublicCareUrl(petData.id));
                                    toast({
                                      title: "URL copied!",
                                      description: "Care instructions URL copied to clipboard",
                                    });
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Direct Links */}
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-lg">
                        <p className="font-medium">Direct Links:</p>
                        <p className="break-all">Care: {generatePublicCareUrl(petData.id)}</p>
                        {generatedPdfBlob && <p className="break-all">PDF: Available after generation</p>}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

            </div>
          </div>

          {/* PDF Options Dialog */}
          <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
            <DialogContent className="max-w-md bg-[#f8f8f8]">
              <DialogHeader>
                <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
                  🌿 Care Instructions PDF Options
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* PDF Actions */}
                {!generatedPdfBlob && !isGeneratingPDF && (
                  <div className="space-y-3">
                    <p className="text-sm text-navy-600 text-center">
                      Choose how you'd like to use {petData.name}'s care instructions:
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
                {isGeneratingPDF && (
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full">
                      <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
                    </div>
                    <p className="text-sm text-navy-600">
                      Generating {petData.name}'s care instructions PDF...
                    </p>
                  </div>
                )}

                {/* Success State - PDF Generated */}
                {generatedPdfBlob && !isGeneratingPDF && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mb-3">
                        <FileText className="w-8 h-8 text-gold-600" />
                      </div>
                      <p className="text-sm text-navy-600 mb-4">
                        PDF ready! Choose an action:
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleViewPDF}
                        variant="outline"
                        className="border-gold-500 text-gold-600 hover:bg-gold-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View PDF
                      </Button>
                      <Button
                        onClick={handleDownloadGeneratedPDF}
                        className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {!petData.is_public && (
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <p className="text-sm text-blue-200 text-center">
                📝 Make your profile public in the privacy settings above to enable sharing & QR codes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feeding Schedule */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-[#5691af]" />
            <span>{isHorse ? 'Feeding & Turnout Schedule' : 'Feeding Schedule'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedingScheduleItems.map((feeding, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#5691af] flex-shrink-0" />
                  <Badge variant="outline" className="text-[#5691af] border-[#5691af]/30">
                    {feeding.time}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{feeding.meal}</p>
                  <p className="text-sm text-gray-600 mt-1">{feeding.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Routine */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-[#5691af]" />
            <span>Daily Routine & Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-[#5691af] mb-2">Morning Routine</h4>
              {careData?.morning_routine ? (
                <p className="text-sm text-gray-700">{careData.morning_routine}</p>
              ) : (
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Wake up around 7:00 AM</li>
                  <li>• {isHorse ? 'Check water buckets and hay' : 'Potty break immediately'}</li>
                  <li>• {isHorse ? 'Quick health check' : 'Short walk before breakfast'}</li>
                  <li>• Feeding time</li>
                </ul>
              )}
            </div>
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-[#5691af] mb-2">Evening Routine</h4>
              {careData?.evening_routine ? (
                <p className="text-sm text-gray-700">{careData.evening_routine}</p>
              ) : (
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Dinner around 6:00 PM</li>
                  <li>• {isHorse ? 'Turn out or bring in from pasture' : 'Play time after dinner'}</li>
                  <li>• {isHorse ? 'Final hay feeding' : 'Final potty break at 10 PM'}</li>
                  <li>• {!isHorse && 'Bedtime routine - quiet time'}</li>
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications & Health */}
      <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-red-600" />
            <span>Medication & Supplements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {petData.medications.length > 0 ? (
            petData.medications.map((medication, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="w-4 h-4 text-red-600" />
                  <Badge variant="destructive" className="text-center text-xs sm:text-sm">
                    <span className="hidden sm:inline">MEDICATION & SUPPLEMENTS</span>
                    <span className="sm:hidden">MED & SUPPLEMENTS</span>
                  </Badge>
                </div>
                <p className="font-medium text-red-900">{medication}</p>
                <p className="text-sm text-red-700 mt-1">
                  Administer as prescribed. Contact vet if missed doses or reactions occur.
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic">No current medications</p>
          )}
          
          <div className="p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-[#5691af] mb-2">Health Monitoring</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Monitor appetite and water intake daily</li>
              <li>• Watch for any behavioral changes</li>
              <li>• Check for signs of distress or discomfort</li>
              {isHorse && <li>• Check hooves and legs for heat/swelling</li>}
              <li>• Contact vet immediately if concerns arise</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#5691af]" />
            <span>Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded border border-gray-200">
            <h4 className="font-medium text-[#5691af] mb-1">Allergies & Restrictions</h4>
            <p className="text-sm text-gray-700">
              {careData?.allergies || (isHorse 
                ? "Sensitive to alfalfa - stick to timothy hay only. No moldy or dusty feed."
                : "Sensitive to chicken - avoid all poultry-based treats and foods."
              )}
            </p>
          </div>
          <div className="p-3 rounded border border-gray-200">
            <h4 className="font-medium text-[#5691af] mb-1">Behavioral Notes</h4>
            <p className="text-sm text-gray-700">
              {careData?.behavioral_notes || (isHorse
                ? "Generally calm but can be anxious during storms. Provide extra hay for comfort."
                : "Friendly with other dogs but needs slow introductions. Afraid of thunderstorms - provide comfort."
              )}
            </p>
          </div>
          <div className="p-3 rounded border border-gray-200">
            <h4 className="font-medium text-[#5691af] mb-1">Favorite Activities</h4>
            <p className="text-sm text-gray-700">
              {careData?.favorite_activities || (isHorse
                ? "Enjoys trail rides and groundwork. Loves grooming sessions."
                : "Loves swimming, fetch, and puzzle toys. Great with children."
              )}
            </p>
          </div>
          {careData?.caretaker_notes && (
            <div className="p-3 rounded border border-blue-200 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-1">Notes for Sitter</h4>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">
                {careData.caretaker_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Contacts Section - Moved to bottom */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
             <Phone className="w-5 h-5 text-[#5691af]" />
             <span className="text-foreground">Quick Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petData.emergencyContact && (
              <div className="p-3 bg-card rounded-lg border shadow-sm">
                <p className="text-red-800 text-sm font-semibold tracking-wide mb-1">PRIMARY EMERGENCY</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.emergencyContact);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 text-red-900 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                         aria-label="Call primary emergency contact"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.emergencyContact}
                       </a>
                       <p className="text-xs text-red-700 mt-1 ml-6">Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium text-red-900">{petData.emergencyContact}</p>
                   );
                 })()}
              </div>
            )}
            
            {petData.secondEmergencyContact && (
              <div className="p-3 bg-card rounded-lg border shadow-sm">
                <p className="text-red-800 text-sm font-semibold tracking-wide mb-1">SECONDARY EMERGENCY</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.secondEmergencyContact);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 text-red-900 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                         aria-label="Call secondary emergency contact"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.secondEmergencyContact}
                       </a>
                       <p className="text-xs text-red-700 mt-1 ml-6">Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium text-red-900">{petData.secondEmergencyContact}</p>
                   );
                 })()}
              </div>
            )}
            
            {petData.vetContact && (
              <div className="p-3 bg-card rounded-lg border shadow-sm">
                <p className="text-sm font-semibold tracking-wide mb-1" style={{color: 'hsl(var(--azure))'}}>VETERINARIAN</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.vetContact);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                         style={{color: 'hsl(var(--azure))'}}
                         onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--azure-hover))'}
                         onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--azure))'}
                         aria-label="Call veterinarian"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.vetContact}
                       </a>
                       <p className="text-xs mt-1 ml-6" style={{color: 'hsl(var(--azure))'}}>Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium" style={{color: 'hsl(var(--azure))'}}>{petData.vetContact}</p>
                   );
                 })()}
              </div>
            )}
            
            {petData.petCaretaker && (
              <div className="p-3 bg-card rounded-lg border shadow-sm">
                <p className="text-sm font-semibold tracking-wide mb-1" style={{color: 'hsl(var(--azure))'}}>PET CARETAKER</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.petCaretaker);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                         style={{color: 'hsl(var(--azure))'}}
                         onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--azure-hover))'}
                         onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--azure))'}
                         aria-label="Call pet caretaker"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.petCaretaker}
                       </a>
                       <p className="text-xs mt-1 ml-6" style={{color: 'hsl(var(--azure))'}}>Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium" style={{color: 'hsl(var(--azure))'}}>{petData.petCaretaker}</p>
                   );
                 })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Note - Moved below Quick Contacts */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardContent className="p-4">
          <p className="text-[#5691af] text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>

      {/* AI Care Assistant Modal */}
      <AICareAssistantModal
        open={isAICareModalOpen}
        onOpenChange={setIsAICareModalOpen}
        petData={petData}
      />

      {/* AI Medical Assistant Modal */}
      <AIMedicalAssistantModal
        open={isAIMedicalModalOpen}
        onOpenChange={setIsAIMedicalModalOpen}
        petData={petData}
      />

      {/* Dual Floating AI Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsAICareModalOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-[#5691af] hover:bg-[#4a7d99] hover:scale-110"
              aria-label="AI Care Assistant"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-sm">
            <p className="font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Care Assistant
            </p>
            <p className="text-xs text-muted-foreground">Ask about feeding, routines & care</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsAIMedicalModalOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-red-500/90 hover:bg-red-600 hover:scale-110"
              aria-label="AI Medical Advisor"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-sm">
            <p className="font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Medical Advisor
            </p>
            <p className="text-xs text-muted-foreground">Ask about health & symptoms</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
