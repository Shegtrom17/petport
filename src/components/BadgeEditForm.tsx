
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { updateProfessionalData } from "@/services/petService";
import { Shield, Plus, X } from "lucide-react";

interface BadgeEditFormProps {
  petData: {
    id: string;
    name: string;
    badges?: string[];
    supportAnimalStatus?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

export const BadgeEditForm = ({ petData, onSave, onCancel }: BadgeEditFormProps) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      badges: petData.badges || [],
      supportAnimalStatus: petData.supportAnimalStatus || "",
      customBadge: ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentBadges = watch("badges") || [];
  const customBadge = watch("customBadge");

  const availableBadges = [
    "Well-Behaved",
    "Good with Kids",
    "House Trained",
    "Therapy Certified",
    "Service Animal",
    "Emotional Support",
    "Obedience Trained",
    "Socialized",
    "Vaccinated",
    "Microchipped",
    "Spayed/Neutered",
    "Good with Dogs",
    "Good with Cats",
    "Leash Trained",
    "Crate Trained",
    "Travel Ready"
  ];

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      const success = await updateProfessionalData(petData.id, {
        badges: data.badges,
        supportAnimalStatus: data.supportAnimalStatus
      });

      if (!success) {
        throw new Error("Failed to update badges and professional data");
      }

      toast({
        title: "Success",
        description: "Badges updated successfully!",
      });

      onSave();
    } catch (error) {
      console.error("Error updating badges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update badges",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadge = (badge: string) => {
    const current = currentBadges || [];
    const updated = current.includes(badge)
      ? current.filter(b => b !== badge)
      : [...current, badge];
    setValue("badges", updated);
  };

  const addCustomBadge = () => {
    if (customBadge.trim() && !currentBadges.includes(customBadge.trim())) {
      setValue("badges", [...currentBadges, customBadge.trim()]);
      setValue("customBadge", "");
    }
  };

  const removeBadge = (badge: string) => {
    setValue("badges", currentBadges.filter(b => b !== badge));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Professional Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="supportAnimalStatus">Support Animal Status</Label>
              <Input
                {...register("supportAnimalStatus")}
                placeholder="e.g., Certified Therapy Dog"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Badges</CardTitle>
            <p className="text-sm text-gray-600">Select badges that apply to your pet</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableBadges.map((badge) => (
                <div key={badge} className="flex items-center space-x-2">
                  <Checkbox
                    id={badge}
                    checked={currentBadges.includes(badge)}
                    onCheckedChange={() => toggleBadge(badge)}
                  />
                  <Label htmlFor={badge} className="text-sm font-medium cursor-pointer">
                    {badge}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                {...register("customBadge")}
                placeholder="Add custom badge"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomBadge}
                disabled={!customBadge.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentBadges.map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{badge}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeBadge(badge)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
              {currentBadges.length === 0 && (
                <p className="text-sm text-gray-500">No badges selected</p>
              )}
            </div>
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
