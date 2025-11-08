import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Input } from "@/components/ui/input";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle, Edit, Loader2, Sparkles, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CareInstructionsEditForm } from "@/components/CareInstructionsEditForm";
import { fetchCareInstructions } from "@/services/careInstructionsService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { AICareAssistantModal } from "@/components/AICareAssistantModal";
import { AIMedicalAssistantModal } from "@/components/AIMedicalAssistantModal";
import { QuickShareHub } from "@/components/QuickShareHub";
import { Button } from "@/components/ui/button";
import { CareUpdatesModerationBoard } from "@/components/CareUpdatesModerationBoard";
import { ServiceProviderNotesBoard } from "@/components/ServiceProviderNotesBoard";
import { AddServiceProviderNoteForm } from "@/components/AddServiceProviderNoteForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";

interface CareInstructionsSectionProps {
  petData: any;
  onUpdate?: () => void;
  handlePetUpdate?: () => Promise<void>;
}


export const CareInstructionsSection = ({ petData, onUpdate, handlePetUpdate }: CareInstructionsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [careData, setCareData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAICareModalOpen, setIsAICareModalOpen] = useState(false);
  const [isAIMedicalModalOpen, setIsAIMedicalModalOpen] = useState(false);
  const [isAddingProviderNote, setIsAddingProviderNote] = useState(false);
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


      {/* Care & Handling Management Hub */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-4">
          {/* Hub Title */}
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-[#5691af]" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Care & Handling</h2>
              <p className="text-muted-foreground">Manage {petData.name}'s care instructions</p>
            </div>
          </div>

          {/* Guidance Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Care Management Hub:</strong> Add and manage feeding schedules, daily routines, 
              medications, and important care notes. All information displays below for easy review and sharing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setIsEditing(true)}
              className="w-full h-14 text-lg text-white"
              size="lg"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Care & Handling
            </Button>
            
            <Button
              onClick={() => window.open(`/care/${petData.id}?returnTo=care`, '_blank')}
              variant="azure"
              className="w-full h-14 text-lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Care & Handling LiveLink
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Care Updates Moderation Board */}
      <CareUpdatesModerationBoard petId={petData.id} petName={petData.name} />

      {/* Add Service Provider Note Form - Collapsible */}
      <Collapsible open={isAddingProviderNote} onOpenChange={setIsAddingProviderNote}>
        <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 text-lg justify-between"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Add Service Provider Note</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isAddingProviderNote ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <AddServiceProviderNoteForm
              petId={petData.id}
              petName={petData.name}
              onSuccess={() => {
                setIsAddingProviderNote(false);
                toast({
                  title: "Success",
                  description: "Service provider note added successfully"
                });
              }}
              onCancel={() => setIsAddingProviderNote(false)}
            />
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Service Provider Notes Board */}
      <ServiceProviderNotesBoard petId={petData.id} petName={petData.name} />

      {/* Feeding Schedule */}
      {/* Mobile Safety: This component uses text truncation and responsive sizing */}
      {/* for optimal mobile display. Do not remove 'break-words', 'overflow-wrap-anywhere', or */}
      {/* 'min-w-0' classes without testing on mobile devices. */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-[#5691af]" />
            <span>{isHorse ? 'Feeding & Turnout Schedule' : 'Feeding Schedule'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedingScheduleItems.map((feeding, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4 p-4 rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#5691af] flex-shrink-0" />
                  <Badge variant="outline" className="text-[#5691af] border-[#5691af]/30">
                    {feeding.time}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 break-words overflow-wrap-anywhere">{feeding.meal}</p>
                  <p className="text-sm text-gray-600 mt-1 break-words">{feeding.notes}</p>
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
                <p className="text-sm text-gray-700 break-words">{careData.morning_routine}</p>
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
                <p className="text-sm text-gray-700 break-words">{careData.evening_routine}</p>
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

      {/* Documentation Note */}
      <Card className="border-0 shadow-lg border-l-4 border-l-[#5691af]">
        <CardContent className="p-4">
          <p className="text-[#5691af] text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>

      {/* Quick Share Hub for Care */}
      <QuickShareHub petData={petData} isLost={false} handlePetUpdate={handlePetUpdate} />

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
              variant="azure"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all opacity-60 hover:opacity-90 hover:scale-110 backdrop-blur-sm"
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
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-red-500/60 hover:bg-red-500/90 hover:scale-110 backdrop-blur-sm"
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
