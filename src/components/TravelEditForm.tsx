
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateTravelLocations } from "@/services/petService";
import { Plus, Trash2, MapPin } from "lucide-react";
import { sanitizeText } from "@/utils/inputSanitizer";

interface TravelEditFormProps {
  petData: {
    id: string;
    name: string;
    travel_locations?: Array<{
      id?: string;
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
  mode?: 'edit' | 'add'; // New prop to distinguish between edit and add modes
}

export const TravelEditForm = ({ petData, onSave, onCancel, mode = 'edit' }: TravelEditFormProps) => {
  const getInitialValues = () => {
    if (mode === 'add') {
      // For add mode, start with one empty location
      return {
        locations: [{ 
          name: "", 
          type: "state", 
          code: "", 
          dateVisited: "", 
          photoUrl: "", 
          notes: "" 
        }]
      };
    } else {
      // For edit mode, load existing locations or one empty location
      return {
        locations: petData.travel_locations && petData.travel_locations.length > 0 
          ? petData.travel_locations.map(location => ({
              name: location.name || "", 
              type: location.type || "state", 
              code: location.code || "", 
              dateVisited: location.date_visited || "", 
              photoUrl: location.photo_url || "", 
              notes: location.notes || ""
            }))
          : [{ 
              name: "", 
              type: "state", 
              code: "", 
              dateVisited: "", 
              photoUrl: "", 
              notes: "" 
            }]
      };
    }
  };

  const { control, handleSubmit, register, setValue, watch } = useForm({
    defaultValues: getInitialValues()
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
      // Filter out empty locations and format the data properly
      const formattedLocations = data.locations
        .filter((location: any) => location.name.trim() !== "")
        .map((location: any) => ({
          name: sanitizeText(location.name),
          type: location.type,
          code: sanitizeText(location.code) || null,
          dateVisited: sanitizeText(location.dateVisited) || null,
          photoUrl: sanitizeText(location.photoUrl) || null,
          notes: sanitizeText(location.notes) || null
        }));

      console.log("Saving travel locations:", formattedLocations);
      
      if (mode === 'add') {
        // For add mode, merge with existing locations
        const existingLocations = petData.travel_locations || [];
        const allLocations = [...existingLocations.map(loc => ({
          name: sanitizeText(loc.name),
          type: loc.type,
          code: sanitizeText(loc.code) || null,
          dateVisited: sanitizeText(loc.date_visited) || null,
          photoUrl: sanitizeText(loc.photo_url) || null,
          notes: sanitizeText(loc.notes) || null
        })), ...formattedLocations];
        
        const locationSuccess = await updateTravelLocations(petData.id, allLocations);
        
        if (!locationSuccess) {
          throw new Error("Failed to add travel locations");
        }
      } else {
        // For edit mode, replace all locations
        const locationSuccess = await updateTravelLocations(petData.id, formattedLocations);

        if (!locationSuccess) {
          throw new Error("Failed to update travel locations");
        }
      }

      toast({
        title: "Success",
        description: mode === 'add' ? "Travel locations added successfully!" : "Travel locations updated successfully!",
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

  const formTitle = mode === 'add' ? 'Add Travel Locations' : 'Edit Travel Locations';

  return (
    <div className="space-y-4 sm:space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{formTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationFields.map((field, index) => (
              <div key={field.id} className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Location {index + 1}</Label>
                  {locationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`locations.${index}.name`} className="text-sm">Location Name</Label>
                    <Input
                      {...register(`locations.${index}.name`)}
                      placeholder="e.g., Colorado"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.type`} className="text-sm">Type</Label>
                    <Select
                      value={watch(`locations.${index}.type`)}
                      onValueChange={(value) => setValue(`locations.${index}.type`, value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.code`} className="text-sm">Code</Label>
                    <Input
                      {...register(`locations.${index}.code`)}
                      placeholder="e.g., CO or US"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`locations.${index}.dateVisited`} className="text-sm">Date Visited</Label>
                    <Input
                      {...register(`locations.${index}.dateVisited`)}
                      placeholder="e.g., March 2024"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`locations.${index}.photoUrl`} className="text-sm">Photo URL</Label>
                    <Input
                      {...register(`locations.${index}.photoUrl`)}
                      placeholder="https://example.com/photo.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`locations.${index}.notes`} className="text-sm">Notes</Label>
                  <Textarea
                    {...register(`locations.${index}.notes`)}
                    placeholder="Add notes about this location..."
                    rows={2}
                    className="text-sm"
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
              className="w-full sm:w-auto text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Location
            </Button>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-brand-primary hover:bg-brand-primary-dark text-white border-brand-primary">
            <span className="hidden sm:inline">{isLoading ? "Saving..." : (mode === 'add' ? "Add Locations" : "Save Changes")}</span>
            <span className="sm:hidden">{isLoading ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
