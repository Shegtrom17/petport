
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  updatePetExperience, 
  updatePetAchievements, 
  updatePetTraining 
} from "@/services/petService";
import { Plus, Trash2, Activity, Trophy, GraduationCap } from "lucide-react";

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
  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      experiences: petData.experiences || [{ activity: "", contact: "", description: "" }],
      achievements: petData.achievements || [{ title: "", description: "" }],
      training: petData.training || [{ course: "", facility: "", phone: "", completed: "" }]
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Update experiences
      const experienceSuccess = await updatePetExperience(
        petData.id,
        data.experiences.filter((exp: any) => exp.activity.trim() !== "")
      );

      if (!experienceSuccess) {
        throw new Error("Failed to update experience information");
      }

      // Update achievements
      const achievementSuccess = await updatePetAchievements(
        petData.id,
        data.achievements.filter((ach: any) => ach.title.trim() !== "")
      );

      if (!achievementSuccess) {
        throw new Error("Failed to update achievement information");
      }

      // Update training
      const trainingSuccess = await updatePetTraining(
        petData.id,
        data.training.filter((tr: any) => tr.course.trim() !== "")
      );

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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`experiences.${index}.activity`}>Activity</Label>
                    <Input
                      {...register(`experiences.${index}.activity`)}
                      placeholder="e.g., Therapy visits at nursing home"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`experiences.${index}.contact`}>Contact</Label>
                    <Input
                      {...register(`experiences.${index}.contact`)}
                      placeholder="Contact information"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`experiences.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`experiences.${index}.description`)}
                    placeholder="Describe the experience..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendExperience({ activity: "", contact: "", description: "" })}
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`achievements.${index}.title`}>Title</Label>
                  <Input
                    {...register(`achievements.${index}.title`)}
                    placeholder="e.g., Outstanding Therapy Dog Award 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`achievements.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`achievements.${index}.description`)}
                    placeholder="Describe the achievement..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendAchievement({ title: "", description: "" })}
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
              <span>Training & Certifications</span>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`training.${index}.course`}>Course</Label>
                    <Input
                      {...register(`training.${index}.course`)}
                      placeholder="e.g., Advanced Obedience Training"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.facility`}>Facility</Label>
                    <Input
                      {...register(`training.${index}.facility`)}
                      placeholder="Training facility name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.phone`}>Phone</Label>
                    <Input
                      {...register(`training.${index}.phone`)}
                      placeholder="Facility phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`training.${index}.completed`}>Completed</Label>
                    <Input
                      {...register(`training.${index}.completed`)}
                      placeholder="e.g., January 2024"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendTraining({ course: "", facility: "", phone: "", completed: "" })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Training
            </Button>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
