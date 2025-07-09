
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";

interface CareInstructionsEditFormProps {
  petData: {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log("Saving care instructions:", formData);
    onSave();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Care Instructions for {petData.name}</span>
          <div className="flex items-center space-x-2">
            <Button onClick={onCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
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
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
