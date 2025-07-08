
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { updateTravelLocations } from "@/services/petService";
import { Plus, Trash2, MapPin } from "lucide-react";

interface TravelEditFormProps {
  petData: {
    id: string;
    name: string;
    travel_locations?: Array<{
      name: string;
      type: string;
      code?: string;
      date_visited?: string;
      photo_url?: string;
      notes?: string;
    }>;
  };
  onSave: () => void;
  onCancel: () => void;
}

export const TravelEditForm = ({ petData, onSave, onCancel }: TravelEditFormProps) => {
  const { control, handleSubmit, register, setValue, watch } = useForm({
    defaultValues: {
      locations: petData.travel_locations || [{ 
        name: "", 
        type: "state", 
        code: "", 
        dateVisited: "", 
        photoUrl: "", 
        notes: "" 
      }]
    }
  });

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: "locations"
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      const locationSuccess = await updateTravelLocations(
        petData.id,
        data.locations.filter((location: any) => location.name.trim() !== "")
      );

      if (!locationSuccess) {
        throw new Error("Failed to update travel locations");
      }

      toast({
        title: "Success",
        description: "Travel locations updated successfully!",
      });

      onSave();
    } catch (error) {
      console.error("Error updating travel locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update travel locations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Travel Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Location {index + 1}</Label>
                  {locationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`locations.${index}.name`}>Location Name</Label>
                    <Input
                      {...register(`locations.${index}.name`)}
                      placeholder="e.g., Colorado"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.type`}>Type</Label>
                    <Select
                      value={watch(`locations.${index}.type`)}
                      onValueChange={(value) => setValue(`locations.${index}.type`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.code`}>Code</Label>
                    <Input
                      {...register(`locations.${index}.code`)}
                      placeholder="e.g., CO or US"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`locations.${index}.dateVisited`}>Date Visited</Label>
                    <Input
                      {...register(`locations.${index}.dateVisited`)}
                      placeholder="e.g., March 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.photoUrl`}>Photo URL</Label>
                    <Input
                      {...register(`locations.${index}.photoUrl`)}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`locations.${index}.notes`}>Notes</Label>
                  <Textarea
                    {...register(`locations.${index}.notes`)}
                    placeholder="Add notes about this location..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendLocation({ 
                name: "", 
                type: "state", 
                code: "", 
                dateVisited: "", 
                photoUrl: "", 
                notes: "" 
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
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
