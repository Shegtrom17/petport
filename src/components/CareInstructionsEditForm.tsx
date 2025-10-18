
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardAwareLayout } from "@/hooks/useKeyboardAwareLayout";
import { updateCareInstructions } from "@/services/careInstructionsService";
import { Clock, Heart, AlertTriangle, Activity, Pill, Loader2 } from "lucide-react";
import { sanitizeText } from "@/utils/inputSanitizer";
import { isOldIOS } from "@/utils/iosDetection";
import { smoothScrollIntoViewIfNeeded } from "@/utils/smoothScroll";


interface CareInstructionsEditFormProps {
  petData: any;
  onSave: () => void;
  onCancel: () => void;
}

export const CareInstructionsEditForm = ({ petData, onSave, onCancel }: CareInstructionsEditFormProps) => {
  console.log("CareInstructionsEditForm petData:", petData);
  console.log("CareInstructionsEditForm medications:", petData.medications);
  
  const { register, handleSubmit, formState: { isDirty }, setValue } = useForm({
    defaultValues: {
      feedingSchedule: petData.careInstructions?.feedingSchedule || "",
      morningRoutine: petData.careInstructions?.morningRoutine || "",
      eveningRoutine: petData.careInstructions?.eveningRoutine || "",
      allergies: petData.careInstructions?.allergies || "",
      behavioralNotes: petData.careInstructions?.behavioralNotes || "",
      favoriteActivities: petData.careInstructions?.favoriteActivities || "",
      caretakerNotes: petData.careInstructions?.caretakerNotes || "",
      medications: Array.isArray(petData.medications) ? petData.medications.join(", ") : (petData.medications || ""),
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bottomOffset, useNativePositioning } = useKeyboardAwareLayout();
  const isOldiOS = isOldIOS();

  console.log("CareInstructionsEditForm initial data:", petData);
  
  const handleFieldFocus = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (isOldiOS) {
      setTimeout(() => {
        smoothScrollIntoViewIfNeeded(e.target as HTMLElement, { margin: 20 });
      }, 300);
    }
  };

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
        caretakerNotes: sanitizeText(data.caretakerNotes),
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
              <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
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
                <Label htmlFor="morningRoutine">Morning Routine</Label>
                <Textarea
                  id="morningRoutine"
                  {...register("morningRoutine")}
                  placeholder="Morning walk, breakfast, medications..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="eveningRoutine">Evening Routine</Label>
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
              <Label htmlFor="medications">Current Medication & Supplements</Label>
              <div className="mt-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-semibold text-blue-800">
                  💡 Use commas to create separate medication & supplement entries
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Example: "Heartgard, Fish Oil, Gabapentin 100mg" will create individual cards
                </p>
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
            </div>
            <div>
              <Label htmlFor="allergies">Allergies & Dietary Restrictions</Label>
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
              <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
              <Textarea
                id="behavioralNotes"
                {...register("behavioralNotes")}
                placeholder="Personality traits, quirks, things to watch for..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="favoriteActivities">Favorite Activities</Label>
              <Textarea
                id="favoriteActivities"
                {...register("favoriteActivities")}
                placeholder="Playing fetch, going to the park, swimming..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="caretakerNotes">Notes for Sitter</Label>
              <Textarea
                id="caretakerNotes"
                {...register("caretakerNotes")}
                onFocus={handleFieldFocus}
                placeholder="Additional instructions or important notes for the pet sitter..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Extra padding for iOS to ensure last field is scrollable above keyboard */}
        {isOldiOS && <div className="pb-[60vh]" />}

        {/* Form Actions - iOS-aware positioning */}
        <div 
          id="form-actions"
          className={isOldiOS 
            ? 'relative bg-background border-t p-4 -mx-4 mt-6' 
            : `${useNativePositioning ? 'keyboard-native-positioning' : 'sticky bottom-0'} z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 -mb-4 border-t pb-0`
          }
        >
          <div
            className={isOldiOS ? 'flex justify-end space-x-4' : (useNativePositioning ? 'flex justify-end space-x-4' : 'keyboard-aware-transform flex justify-end space-x-4')}
            style={isOldiOS || useNativePositioning ? {} : { 
              transform: bottomOffset > 0 ? `translateY(-${bottomOffset}px)` : 'none',
              transition: 'transform 0.15s ease-out'
            }}
          >
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
        </div>
      </form>
    </div>
  );
};
