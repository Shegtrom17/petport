import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle, Edit, Loader2, FileText, Download, QrCode, Share2, ExternalLink, Eye, Phone } from "lucide-react";
import { CareInstructionsEditForm } from "@/components/CareInstructionsEditForm";
import { fetchCareInstructions } from "@/services/careInstructionsService";
import { generatePetPDF, generateQRCodeUrl, downloadPDFBlob, shareProfile, shareProfileOptimized } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

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
  };
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

export const CareInstructionsSection = ({ petData }: CareInstructionsSectionProps) => {
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
    
    // Reload the data after saving
    try {
      const data = await fetchCareInstructions(petData.id);
      setCareData(data);
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
      
      const result = await generatePetPDF(petData.id, 'full');
      
      if (result.success && result.pdfBlob) {
        setCarePdfBlob(result.pdfBlob);
        // Create a temporary URL for the QR code
        const tempUrl = URL.createObjectURL(result.pdfBlob);
        setCareQrCodeUrl(generateQRCodeUrl(tempUrl));
        setCareShareDialogOpen(true);
        
        toast({
          title: "Care Instructions PDF Generated",
          description: `${petData.name}'s care instructions PDF is ready to download and share.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate care instructions PDF');
      }
    } catch (error) {
      console.error('Care PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate care instructions PDF. Please try again.",
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
      {/* Quick Contacts Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-gold-400" />
            <span>Quick Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petData.emergencyContact && (
              <div className="p-3 bg-red-600/30 rounded-lg border border-red-500/30">
                <p className="text-red-100 text-sm font-semibold tracking-wide mb-1">PRIMARY EMERGENCY</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.emergencyContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="font-medium flex items-center gap-2 hover:text-red-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {petData.emergencyContact}
                    </a>
                  ) : (
                    <p className="font-medium">{petData.emergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.secondEmergencyContact && (
              <div className="p-3 bg-red-600/30 rounded-lg border border-red-500/30">
                <p className="text-red-100 text-sm font-semibold tracking-wide mb-1">SECONDARY EMERGENCY</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.secondEmergencyContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="font-medium flex items-center gap-2 hover:text-red-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {petData.secondEmergencyContact}
                    </a>
                  ) : (
                    <p className="font-medium">{petData.secondEmergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.vetContact && (
              <div className="p-3 bg-blue-600/30 rounded-lg border border-blue-500/30">
                <p className="text-blue-100 text-sm font-semibold tracking-wide mb-1">VETERINARIAN</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.vetContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="font-medium flex items-center gap-2 hover:text-blue-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {petData.vetContact}
                    </a>
                  ) : (
                    <p className="font-medium">{petData.vetContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.petCaretaker && (
              <div className="p-3 bg-green-600/30 rounded-lg border border-green-500/30">
                <p className="text-green-100 text-sm font-semibold tracking-wide mb-1">PET CARETAKER</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.petCaretaker);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="font-medium flex items-center gap-2 hover:text-green-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {petData.petCaretaker}
                    </a>
                  ) : (
                    <p className="font-medium">{petData.petCaretaker}</p>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Note */}
      <Card className="border-0 shadow-lg bg-blue-50 border-l-4 border-blue-500">
        <CardContent className="p-4">
          <p className="text-blue-800 text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>

      {/* Care Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Care Instructions for {petData.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={() => setIsEditing(true)}
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Instructions</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                onClick={handleGenerateCarePDF}
                disabled={isGeneratingPDF}
                variant="secondary"
                className="bg-sage-600 hover:bg-sage-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Download Care PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Dialog open={careShareDialogOpen} onOpenChange={setCareShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleShareCareLink}
                    disabled={isSharing}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  >
                    {isSharing ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Share Care Plan</span>
                    <span className="sm:hidden">Share</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-[#f8f8f8]">
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
                      <p className="text-sm text-navy-600 mb-3">Share detailed daily care info with pet sitters and caregivers</p>
                      <Button
                        onClick={handleShareCareLink}
                        disabled={isSharing}
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
                    </div>

                    {/* Care PDF */}
                    {carePdfBlob && careQrCodeUrl && (
                      <div className="bg-white p-4 rounded-lg border border-sage-500/30 shadow-sm">
                        <h4 className="font-bold text-navy-900 mb-3">🌿 Care Instructions PDF</h4>
                        <div className="text-center mb-3">
                          <img 
                            src={careQrCodeUrl} 
                            alt="Care Instructions QR Code" 
                            className="border-2 border-sage-500/30 rounded-lg mx-auto"
                            style={{width: '120px', height: '120px'}}
                          />
                          <p className="text-xs text-sage-600 mt-2">Scan to view real-time care updates</p>
                        </div>
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
                            onClick={handleShareCarePDF}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-100">
            {careData ? "Custom care instructions have been provided." : "Complete care guide for pet sitters, boarding facilities, and emergency caregivers."}
            All instructions are current as of the last update.
          </p>
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
              <div key={index} className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center space-x-2 min-w-0">
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

      {/* Emergency & Important Notes */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm border-l-4 border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency & Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <h4 className="font-medium text-red-900 mb-1">Allergies & Sensitivities</h4>
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
    </div>
  );
};
