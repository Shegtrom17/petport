import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle, Edit, Loader2, FileText, Download, QrCode, Share2, ExternalLink, Eye, Phone } from "lucide-react";
import { CareInstructionsEditForm } from "@/components/CareInstructionsEditForm";
import { fetchCareInstructions } from "@/services/careInstructionsService";
import { generateQRCodeUrl, shareProfile, shareProfileOptimized, sharePDFBlob } from "@/services/pdfService";
import { generateClientPetPDF, downloadPDFBlob } from "@/services/clientPdfService";
import { useToast } from "@/hooks/use-toast";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { supabase } from "@/integrations/supabase/client";


interface CareInstructionsSectionProps {
  petData: {
    id: string;
    name: string;
    species?: string;
    medications: string[];
    emergencyContact?: string;
    secondEmergencyContact?: string;
    vetContact?: string;
    petCaretaker?: string;
    is_public?: boolean;
  };
  onUpdate?: () => void;
}

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  
  // Extract phone number using regex - handles various formats
  const phoneMatch = contactString.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0].replace(/[^\d]/g, '') : null;
};

const formatPhoneForTel = (phone: string) => {
  return `+1${phone}`; // Assuming US numbers, adjust as needed
};

export const CareInstructionsSection = ({ petData, onUpdate }: CareInstructionsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [careData, setCareData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [careShareDialogOpen, setCareShareDialogOpen] = useState(false);
  const [carePdfBlob, setCarePdfBlob] = useState<Blob | null>(null);
  const [careQrCodeUrl, setCareQrCodeUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const isHorse = petData.species?.toLowerCase() === 'horse';

  // Generate QR code for public care URL
  useEffect(() => {
    const careUrl = generateCarePublicUrl();
    setCareQrCodeUrl(generateQRCodeUrl(careUrl));
  }, [petData.id]);

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

  const handleGenerateCarePDF = async () => {
    setIsGeneratingPDF(true);
    try {
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
        setCarePdfBlob(result.blob);
        setCareShareDialogOpen(true);
        
        toast({
          title: "Care Instructions PDF Generated",
          description: `${petData.name}'s care instructions PDF is ready to download and share.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate care instructions PDF');
      }
    } catch (error) {
      console.error('❌ Care PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: `Failed to generate care instructions PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateCarePublicUrl = (): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/care/${petData.id}`;
  };

  const handleShareCareLink = async () => {
    const careUrl = generateCarePublicUrl();
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

  const handleDownloadCarePDF = async () => {
    if (!carePdfBlob) return;
    
    try {
      const fileName = `PetPort_Care_Instructions_${petData.name}.pdf`;
      await downloadPDFBlob(carePdfBlob, fileName);
      toast({
        title: "Download Started",
        description: `${petData.name}'s care instructions are being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareCarePDF = async () => {
    if (!carePdfBlob) return;
    const tempUrl = URL.createObjectURL(carePdfBlob);
    const title = `${petData.name}'s Care Instructions PDF`;
    const description = `Care instructions PDF for ${petData.name}`;
    await shareProfile(tempUrl, title, description);
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
            favoriteActivities: careData.favorite_activities
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
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
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
                onClick={handleGenerateCarePDF}
                className={`flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Generate PDF"
                onKeyDown={(e) => e.key === 'Enter' && !isGeneratingPDF && handleGenerateCarePDF()}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="text-sm">PDF</span>
              </div>
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
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#f8f8f8]">
                  <DialogHeader>
                    <DialogTitle className="text-navy-900 border-b-2 border-sage-500 pb-2 font-bold">
                      🌿 Share {petData.name}'s Care Instructions
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                     {/* Public Care Instructions Link */}
                     <div className="bg-white p-4 rounded-lg border border-sage-500/30 shadow-sm">
                       <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                         <div className="w-6 h-6 bg-sage-500/20 rounded-full flex items-center justify-center">
                           <ExternalLink className="w-3 h-3 text-sage-600" />
                         </div>
                         Public Care Instructions
                       </h4>
                       <p className="text-sm text-navy-600 mb-3">Share detailed daily care info with pet sitters and caregivers. <strong>Profile must be public to share.</strong></p>
                       
                       {careQrCodeUrl && petData.is_public && (
                         <div className="text-center mb-3">
                           <img 
                             src={careQrCodeUrl} 
                             alt="Care Instructions QR Code" 
                             className="border-2 border-sage-500/30 rounded-lg mx-auto"
                             style={{width: '120px', height: '120px'}}
                           />
                           <p className="text-xs text-sage-600 mt-2">Scan to access care instructions</p>
                         </div>
                       )}

                      <Button
                        onClick={handleShareCareLink}
                        disabled={isSharing || !petData.is_public}
                        variant="outline"
                        className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
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
                      <SocialShareButtons 
                        petName={petData.name} 
                        petId={petData.id} 
                        context="care" 
                        shareUrlOverride={generateCarePublicUrl()} 
                        defaultOpenOptions 
                      />
                    ) : null}

                     {/* Care PDF */}
                     {carePdfBlob && (
                       <div className="bg-white p-4 rounded-lg border border-sage-500/30 shadow-sm">
                         <h4 className="font-bold text-navy-900 mb-3">🌿 Care Instructions PDF</h4>
                         <div className="grid grid-cols-3 gap-2">
                           <Button
                             onClick={() => {
                               if (carePdfBlob) {
                                 const url = URL.createObjectURL(carePdfBlob);
                                 window.open(url, '_blank');
                               }
                             }}
                             variant="outline"
                             size="sm"
                             className="border-sage-500 text-sage-600 hover:bg-sage-50 font-semibold"
                           >
                             <Eye className="w-4 h-4 mr-1" />
                             View
                           </Button>
                           <Button
                             onClick={handleDownloadCarePDF}
                             variant="outline"
                             size="sm"
                             className="border-navy-900 text-navy-900 hover:bg-navy-50"
                           >
                             <Download className="w-4 h-4 mr-1" />
                             Download
                           </Button>
                            <Button
                              onClick={async () => {
                                if (!carePdfBlob) return;
                                const fileName = `PetPort_Care_Instructions_${petData.name}.pdf`;
                                const result = await sharePDFBlob(carePdfBlob, fileName, petData.name, 'care');
                                
                                if (result.success) {
                                  toast({
                                    title: result.shared ? "Care PDF Shared!" : "Link Copied!",
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
                              className="border-navy-900 text-navy-900 hover:bg-navy-50"
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                         </div>
                       </div>
                     )}

                    {/* Direct Links */}
                    <div className="text-xs text-navy-500 space-y-1 bg-navy-50 p-3 rounded-lg">
                      <p className="font-medium">Direct Links:</p>
                      <p className="break-all">Care: {generateCarePublicUrl()}</p>
                      {carePdfBlob && <p className="break-all">PDF: Available after generation</p>}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-orange-600" />
            <span>{isHorse ? 'Feeding & Turnout Schedule' : 'Feeding Schedule'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedingScheduleItems.map((feeding, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
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
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-purple-600" />
            <span>Daily Routine & Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Morning Routine</h4>
              {careData?.morning_routine ? (
                <p className="text-sm text-purple-800">{careData.morning_routine}</p>
              ) : (
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Wake up around 7:00 AM</li>
                  <li>• {isHorse ? 'Check water buckets and hay' : 'Potty break immediately'}</li>
                  <li>• {isHorse ? 'Quick health check' : 'Short walk before breakfast'}</li>
                  <li>• Feeding time</li>
                </ul>
              )}
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Evening Routine</h4>
              {careData?.evening_routine ? (
                <p className="text-sm text-indigo-800">{careData.evening_routine}</p>
              ) : (
                <ul className="text-sm text-indigo-800 space-y-1">
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
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-red-600" />
            <span>Medications & Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {petData.medications.length > 0 ? (
            petData.medications.map((medication, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="w-4 h-4 text-red-600" />
                  <Badge variant="destructive">MEDICATION</Badge>
                </div>
                <p className="font-medium">{medication}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Administer as prescribed. Contact vet if missed doses or reactions occur.
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic">No current medications</p>
          )}
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Health Monitoring</h4>
            <ul className="text-sm text-blue-800 space-y-1">
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
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <h4 className="font-medium text-red-900 mb-1">Allergies & Restrictions</h4>
            <p className="text-sm text-red-800">
              {careData?.allergies || (isHorse 
                ? "Sensitive to alfalfa - stick to timothy hay only. No moldy or dusty feed."
                : "Sensitive to chicken - avoid all poultry-based treats and foods."
              )}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-1">Behavioral Notes</h4>
            <p className="text-sm text-yellow-800">
              {careData?.behavioral_notes || (isHorse
                ? "Generally calm but can be anxious during storms. Provide extra hay for comfort."
                : "Friendly with other dogs but needs slow introductions. Afraid of thunderstorms - provide comfort."
              )}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <h4 className="font-medium text-green-900 mb-1">Favorite Activities</h4>
            <p className="text-sm text-green-800">
              {careData?.favorite_activities || (isHorse
                ? "Enjoys trail rides and groundwork. Loves grooming sessions."
                : "Loves swimming, fetch, and puzzle toys. Great with children."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contacts Section - Moved to bottom */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-navy-700" />
            <span className="text-navy-900">Quick Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petData.emergencyContact && (
              <div className="p-3 bg-red-100 rounded-lg border border-red-300">
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
              <div className="p-3 bg-red-100 rounded-lg border border-red-300">
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
              <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                <p className="text-blue-800 text-sm font-semibold tracking-wide mb-1">VETERINARIAN</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.vetContact);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                         aria-label="Call veterinarian"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.vetContact}
                       </a>
                       <p className="text-xs text-blue-700 mt-1 ml-6">Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium text-blue-900">{petData.vetContact}</p>
                   );
                 })()}
              </div>
            )}
            
            {petData.petCaretaker && (
              <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                <p className="text-green-800 text-sm font-semibold tracking-wide mb-1">PET CARETAKER</p>
                 {(() => {
                   const phoneNumber = extractPhoneNumber(petData.petCaretaker);
                   return phoneNumber ? (
                     <div>
                       <a 
                         href={`tel:${formatPhoneForTel(phoneNumber)}`}
                         className="font-medium flex items-center gap-2 text-green-900 hover:text-green-700 transition-colors duration-200 cursor-pointer"
                         aria-label="Call pet caretaker"
                       >
                         <Phone className="w-4 h-4" />
                         {petData.petCaretaker}
                       </a>
                       <p className="text-xs text-green-700 mt-1 ml-6">Tap to call</p>
                     </div>
                   ) : (
                     <p className="font-medium text-green-900">{petData.petCaretaker}</p>
                   );
                 })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Note - Moved below Quick Contacts */}
      <Card className="border-0 shadow-lg bg-blue-50 border-l-4 border-blue-500">
        <CardContent className="p-4">
          <p className="text-blue-800 text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
