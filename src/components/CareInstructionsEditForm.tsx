import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateCareInstructions } from "@/services/careInstructionsService";
import { Clock, Heart, AlertTriangle, Activity, Pill, Loader2 } from "lucide-react";
import { sanitizeText } from "@/utils/inputSanitizer";
import { VoiceRecorder } from "@/components/VoiceRecorder";

interface CareInstructionsEditFormProps {
  petData: any;
  onSave: () => void;
  onCancel: () => void;
}

export const CareInstructionsEditForm = ({ petData, onSave, onCancel }: CareInstructionsEditFormProps) => {
  console.log("CareInstructionsEditForm petData:", petData);
  console.log("CareInstructionsEditForm medications:", petData.medications);
  
  const { register, handleSubmit, formState: { isDirty }, setValue, watch } = useForm({
    defaultValues: {
      feedingSchedule: petData.careInstructions?.feedingSchedule || "",
      morningRoutine: petData.careInstructions?.morningRoutine || "",
      eveningRoutine: petData.careInstructions?.eveningRoutine || "",
      allergies: petData.careInstructions?.allergies || "",
      behavioralNotes: petData.careInstructions?.behavioralNotes || "",
      favoriteActivities: petData.careInstructions?.favoriteActivities || "",
      medications: Array.isArray(petData.medications) ? petData.medications.join(", ") : (petData.medications || ""),
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  type FormFieldName = 'feedingSchedule' | 'morningRoutine' | 'eveningRoutine' | 'allergies' | 'behavioralNotes' | 'favoriteActivities' | 'medications';
  
  const handleVoiceInput = (fieldName: FormFieldName, text: string) => {
    const currentValue = watch(fieldName);
    const newValue = currentValue ? `${currentValue} ${text}` : text;
    setValue(fieldName, newValue, { shouldDirty: true });
  };

  console.log("CareInstructionsEditForm initial data:", petData);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      console.log("Submitting care instructions form with data:", data);

      const success = await updateCareInstructions(petData.id, {
        feedingSchedule: sanitizeText(data.feedingSchedule),
        morningRoutine: sanitizeText(data.morningRoutine),
        eveningRoutine: sanitizeText(data.eveningRoutine),
        allergies: sanitizeText(data.allergies),
        behavioralNotes: sanitizeText(data.behavioralNotes),
        favoriteActivities: sanitizeText(data.favoriteActivities),
        medications: sanitizeText(data.medications),
      });

      if (success) {
        toast({
          title: "Success",
          description: "Care instructions updated successfully!",
        });
        onSave();
      } else {
        throw new Error("Failed to update care instructions");
      }
    } catch (error) {
      console.error("Error updating care instructions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update care instructions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Daily Routines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Daily Routines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
                <VoiceRecorder 
                  onTranscription={(text) => handleVoiceInput('feedingSchedule', text)}
                  disabled={isLoading}
                />
              </div>
              <Textarea
                id="feedingSchedule"
                {...register("feedingSchedule")}
                placeholder="e.g., 7 AM - 1 cup dry food, 6 PM - 1 cup dry food"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="morningRoutine">Morning Routine</Label>
                  <VoiceRecorder 
                    onTranscription={(text) => handleVoiceInput('morningRoutine', text)}
                    disabled={isLoading}
                  />
                </div>
                <Textarea
                  id="morningRoutine"
                  {...register("morningRoutine")}
                  placeholder="Morning walk, breakfast, medications..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="eveningRoutine">Evening Routine</Label>
                  <VoiceRecorder 
                    onTranscription={(text) => handleVoiceInput('eveningRoutine', text)}
                    disabled={isLoading}
                  />
                </div>
                <Textarea
                  id="eveningRoutine"
                  {...register("eveningRoutine")}
                  placeholder="Evening walk, dinner, bedtime..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5" />
              <span>Medication & Supplements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="medications">Current Medication & Supplements</Label>
                <VoiceRecorder 
                  onTranscription={(text) => handleVoiceInput('medications', text)}
                  disabled={isLoading}
                />
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md mb-2 border border-amber-200">
                ⚠️ Providing accurate medical details is highly recommended for emergencies.
              </div>
              <Textarea
                id="medications"
                {...register("medications")}
                placeholder="Medication/Supplement 1, Medication/Supplement 2, ..."
                rows={3}
                disabled={isLoading}
              />
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-semibold text-blue-800">
                  💡 Use commas to create separate medication & supplement entries
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Example: "Heartgard, Fish Oil, Gabapentin 100mg" will create individual cards
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="allergies">Allergies & Dietary Restrictions</Label>
                <VoiceRecorder 
                  onTranscription={(text) => handleVoiceInput('allergies', text)}
                  disabled={isLoading}
                />
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md mb-2 border border-amber-200">
                ⚠️ Allergy information is crucial for emergency responders. Even "None" is helpful.
              </div>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="Food allergies, environmental allergies, restrictions..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Behavior & Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Behavior & Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
                <VoiceRecorder 
                  onTranscription={(text) => handleVoiceInput('behavioralNotes', text)}
                  disabled={isLoading}
                />
              </div>
              <Textarea
                id="behavioralNotes"
                {...register("behavioralNotes")}
                placeholder="Personality traits, quirks, things to watch for..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="favoriteActivities">Favorite Activities</Label>
                <VoiceRecorder 
                  onTranscription={(text) => handleVoiceInput('favoriteActivities', text)}
                  disabled={isLoading}
                />
              </div>
              <Textarea
                id="favoriteActivities"
                {...register("favoriteActivities")}
                placeholder="Playing fetch, going to the park, swimming..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="text-white">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
