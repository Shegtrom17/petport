
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardAwareLayout } from "@/hooks/useKeyboardAwareLayout";
import { 
  updatePetExperience, 
  updatePetAchievements, 
  updatePetTraining 
} from "@/services/petService";
import { Plus, Trash2, Activity, Trophy, GraduationCap, Loader2 } from "lucide-react";


interface PetResumeEditFormProps {
  petData: {
    id: string;
    name: string;
    experiences?: Array<{
      activity: string;
      contact?: string;
      description?: string;
    }>;
    achievements?: Array<{
      title: string;
      description?: string;
    }>;
    training?: Array<{
      course: string;
      facility?: string;
      phone?: string;
      completed?: string;
    }>;
  };
  onSave: () => void;
  onCancel: () => void;
}

export const PetResumeEditForm = ({ petData, onSave, onCancel }: PetResumeEditFormProps) => {
  const { control, handleSubmit, register, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      experiences: petData.experiences && petData.experiences.length > 0 ? petData.experiences : [{ activity: "", contact: "", description: "" }],
      achievements: petData.achievements && petData.achievements.length > 0 ? petData.achievements : [{ title: "", description: "" }],
      training: petData.training && petData.training.length > 0 ? petData.training : [{ course: "", facility: "", phone: "", completed: "" }]
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experiences"
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: "achievements"
  });

  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({
    control,
    name: "training"
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bottomOffset, useNativePositioning } = useKeyboardAwareLayout();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      console.log("Submitting resume data:", data);

      // Update experiences
      const validExperiences = data.experiences.filter((exp: any) => exp.activity.trim() !== "");
      console.log("Valid experiences to save:", validExperiences);
      
      const experienceSuccess = await updatePetExperience(petData.id, validExperiences);

      if (!experienceSuccess) {
        throw new Error("Failed to update experience information");
      }

      // Update achievements
      const validAchievements = data.achievements.filter((ach: any) => ach.title.trim() !== "");
      console.log("Valid achievements to save:", validAchievements);
      
      const achievementSuccess = await updatePetAchievements(petData.id, validAchievements);

      if (!achievementSuccess) {
        throw new Error("Failed to update achievement information");
      }

      // Update training
      const validTraining = data.training.filter((tr: any) => tr.course.trim() !== "");
      console.log("Valid training to save:", validTraining);
      
      const trainingSuccess = await updatePetTraining(petData.id, validTraining);

      if (!trainingSuccess) {
        throw new Error("Failed to update training information");
      }

      toast({
        title: "Success",
        description: "Pet resume updated successfully!",
      });

      onSave();
    } catch (error) {
      console.error("Error updating pet resume:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update pet resume",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Experience & Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experienceFields.map((field, index) => (
              <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Experience {index + 1}</Label>
                  {experienceFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`experiences.${index}.activity`}>Activity *</Label>
                    <Input
                      {...register(`experiences.${index}.activity`, { required: true })}
                      placeholder="e.g., Therapy visits at nursing home"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`experiences.${index}.contact`}>Contact</Label>
                    <Input
                      {...register(`experiences.${index}.contact`)}
                      placeholder="Contact information"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`experiences.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`experiences.${index}.description`)}
                    placeholder="Describe the experience..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendExperience({ activity: "", contact: "", description: "" })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievementFields.map((field, index) => (
              <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Achievement {index + 1}</Label>
                  {achievementFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`achievements.${index}.title`}>Title *</Label>
                  <Input
                    {...register(`achievements.${index}.title`, { required: true })}
                    placeholder="e.g., Outstanding Therapy Dog Award 2024"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`achievements.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`achievements.${index}.description`)}
                    placeholder="Describe the achievement..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendAchievement({ title: "", description: "" })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </CardContent>
        </Card>

        {/* Training Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Training</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainingFields.map((field, index) => (
              <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Training {index + 1}</Label>
                  {trainingFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTraining(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`training.${index}.course`}>Course *</Label>
                    <Input
                      {...register(`training.${index}.course`, { required: true })}
                      placeholder="e.g., Advanced Obedience Training"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.facility`}>Facility</Label>
                    <Input
                      {...register(`training.${index}.facility`)}
                      placeholder="Training facility name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.phone`}>Phone</Label>
                    <Input
                      {...register(`training.${index}.phone`)}
                      placeholder="Facility phone number"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.completed`}>Completed</Label>
                    <Input
                      {...register(`training.${index}.completed`)}
                      placeholder="e.g., January 2024"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendTraining({ course: "", facility: "", phone: "", completed: "" })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Training
            </Button>
          </CardContent>
        </Card>

        {/* Form Actions - Keyboard-aware sticky positioning */}
        <div 
          id="form-actions"
          className={`${useNativePositioning ? 'keyboard-native-positioning' : 'sticky bottom-0'} z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 -mb-4 border-t pb-0`}
        >
          <div
            className={useNativePositioning ? 'flex justify-end space-x-4' : 'keyboard-aware-transform flex justify-end space-x-4'}
            style={useNativePositioning ? {} : { 
              transform: bottomOffset > 0 ? `translateY(-${bottomOffset}px)` : 'none',
              transition: 'transform 0.15s ease-out'
            }}
          >
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting} className="bg-brand-primary hover:bg-brand-primary-dark text-white">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
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
