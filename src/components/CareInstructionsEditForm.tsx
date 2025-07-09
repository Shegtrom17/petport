
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, X, Loader2 } from "lucide-react";
import { saveCareInstructions, fetchCareInstructions } from "@/services/careInstructionsService";
import { useToast } from "@/hooks/use-toast";

interface CareInstructionsEditFormProps {
  petData: {
    id: string;
    name: string;
    species?: string;
    medications: string[];
  };
  onSave: () => void;
  onCancel: () => void;
}

export const CareInstructionsEditForm = ({ petData, onSave, onCancel }: CareInstructionsEditFormProps) => {
  const [formData, setFormData] = useState({
    feedingSchedule: "",
    medications: petData.medications.join(", "),
    morningRoutine: "",
    eveningRoutine: "",
    allergies: "",
    behavioralNotes: "",
    favoriteActivities: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  // Load existing care instructions when component mounts
  useEffect(() => {
    const loadCareInstructions = async () => {
      try {
        console.log("Loading care instructions for pet:", petData.id);
        const careData = await fetchCareInstructions(petData.id);
        
        if (careData) {
          setFormData({
            feedingSchedule: careData.feeding_schedule || "",
            medications: petData.medications.join(", "),
            morningRoutine: careData.morning_routine || "",
            eveningRoutine: careData.evening_routine || "",
            allergies: careData.allergies || "",
            behavioralNotes: careData.behavioral_notes || "",
            favoriteActivities: careData.favorite_activities || "",
          });
        }
      } catch (error) {
        console.error("Error loading care instructions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load care instructions."
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCareInstructions();
  }, [petData.id, petData.medications, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Submitting care instructions:", formData);
      
      const success = await saveCareInstructions(petData.id, {
        feeding_schedule: formData.feedingSchedule,
        morning_routine: formData.morningRoutine,
        evening_routine: formData.eveningRoutine,
        allergies: formData.allergies,
        behavioral_notes: formData.behavioralNotes,
        favorite_activities: formData.favoriteActivities
      });

      if (success) {
        toast({
          title: "Success",
          description: "Care instructions saved successfully!"
        });
        onSave();
      } else {
        throw new Error("Failed to save care instructions");
      }
    } catch (error) {
      console.error("Error saving care instructions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save care instructions. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading care instructions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Care Instructions for {petData.name}</span>
          <div className="flex items-center space-x-2">
            <Button onClick={onCancel} variant="outline" size="sm" disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
            <Textarea
              id="feedingSchedule"
              placeholder="Enter feeding times and instructions..."
              value={formData.feedingSchedule}
              onChange={(e) => setFormData({ ...formData, feedingSchedule: e.target.value })}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              placeholder="List current medications and dosages..."
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="morningRoutine">Morning Routine</Label>
              <Textarea
                id="morningRoutine"
                placeholder="Describe morning routine..."
                value={formData.morningRoutine}
                onChange={(e) => setFormData({ ...formData, morningRoutine: e.target.value })}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eveningRoutine">Evening Routine</Label>
              <Textarea
                id="eveningRoutine"
                placeholder="Describe evening routine..."
                value={formData.eveningRoutine}
                onChange={(e) => setFormData({ ...formData, eveningRoutine: e.target.value })}
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies & Sensitivities</Label>
            <Textarea
              id="allergies"
              placeholder="List any allergies or sensitivities..."
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
            <Textarea
              id="behavioralNotes"
              placeholder="Describe behavioral traits and preferences..."
              value={formData.behavioralNotes}
              onChange={(e) => setFormData({ ...formData, behavioralNotes: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteActivities">Favorite Activities</Label>
            <Textarea
              id="favoriteActivities"
              placeholder="List favorite activities and preferences..."
              value={formData.favoriteActivities}
              onChange={(e) => setFormData({ ...formData, favoriteActivities: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
