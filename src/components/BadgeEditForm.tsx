
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateProfessionalData } from "@/services/petService";
import { Award, Shield, Heart, Star, Zap, Trophy, Medal, Crown } from "lucide-react";

interface BadgeEditFormProps {
  petData: any;
  onSave: () => void;
  onCancel: () => void;
}

const availableBadges = [
  { id: "good-behavior", label: "Good Behavior", icon: Heart },
  { id: "therapy-animal", label: "Therapy Animal", icon: Shield },
  { id: "service-animal", label: "Service Animal", icon: Star },
  { id: "well-trained", label: "Well Trained", icon: Award },
  { id: "social", label: "Social Pet", icon: Zap },
  { id: "competition-winner", label: "Competition Winner", icon: Trophy },
  { id: "certified", label: "Certified", icon: Medal },
  { id: "champion", label: "Champion", icon: Crown },
];

const supportAnimalOptions = [
  { value: "", label: "Not a support animal" },
  { value: "emotional-support", label: "Emotional Support Animal (ESA)" },
  { value: "service-animal", label: "Service Animal" },
  { value: "therapy-animal", label: "Therapy Animal" },
];

export const BadgeEditForm = ({ petData, onSave, onCancel }: BadgeEditFormProps) => {
  const [selectedBadges, setSelectedBadges] = useState<string[]>(petData.badges || []);
  const [supportAnimalStatus, setSupportAnimalStatus] = useState(petData.supportAnimalStatus || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  console.log("BadgeEditForm initial data:", { 
    badges: petData.badges, 
    supportAnimalStatus: petData.supportAnimalStatus,
    selectedBadges,
    supportAnimalStatusState: supportAnimalStatus
  });

  const handleBadgeChange = (badgeId: string, checked: boolean) => {
    console.log("Badge change:", badgeId, checked);
    setSelectedBadges(prev => {
      if (checked) {
        const newBadges = [...prev, badgeId];
        console.log("Adding badge, new badges:", newBadges);
        return newBadges;
      } else {
        const newBadges = prev.filter(id => id !== badgeId);
        console.log("Removing badge, new badges:", newBadges);
        return newBadges;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting badge form with:", {
        badges: selectedBadges,
        supportAnimalStatus: supportAnimalStatus
      });

      const success = await updateProfessionalData(petData.id, {
        badges: selectedBadges,
        supportAnimalStatus: supportAnimalStatus || null,
      });

      if (success) {
        toast({
          title: "Success",
          description: "Badge information updated successfully!",
        });
        onSave();
      } else {
        throw new Error("Failed to update badge information");
      }
    } catch (error) {
      console.error("Error updating badges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update badge information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Pet Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBadges.map((badge) => {
              const IconComponent = badge.icon;
              const isChecked = selectedBadges.includes(badge.id);
              
              return (
                <div key={badge.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={badge.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleBadgeChange(badge.id, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={badge.id} className="flex items-center space-x-2 cursor-pointer">
                    <IconComponent className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Support Animal Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={supportAnimalStatus} onValueChange={setSupportAnimalStatus} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select support animal status" />
            </SelectTrigger>
            <SelectContent>
              {supportAnimalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
