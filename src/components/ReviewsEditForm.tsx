
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updatePetReviews } from "@/services/petService";
import { Plus, Trash2, Star, Loader2 } from "lucide-react";

interface ReviewsEditFormProps {
  petData: {
    id: string;
    name: string;
    reviews?: Array<{
      reviewerName: string;
      reviewerContact?: string;
      rating: number;
      text?: string;
      date?: string;
      location?: string;
      type?: string;
    }>;
  };
  onSave: () => void;
  onCancel: () => void;
}

export const ReviewsEditForm = ({ petData, onSave, onCancel }: ReviewsEditFormProps) => {
  const { control, handleSubmit, register, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      reviews: petData.reviews && petData.reviews.length > 0 ? petData.reviews : [{ 
        reviewerName: "", 
        reviewerContact: "", 
        rating: 5, 
        text: "", 
        date: "", 
        location: "", 
        type: "boarding" 
      }]
    }
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control,
    name: "reviews"
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      console.log("Submitting reviews data:", data);
      
      // Filter out empty reviews and ensure required fields
      const validReviews = data.reviews.filter((review: any) => 
        review.reviewerName.trim() !== "" && review.rating
      );

      console.log("Valid reviews to save:", validReviews);

      const reviewSuccess = await updatePetReviews(petData.id, validReviews);

      if (!reviewSuccess) {
        throw new Error("Failed to update reviews");
      }

      toast({
        title: "Success",
        description: "Reviews updated successfully!",
      });

      onSave();
    } catch (error) {
      console.error("Error updating reviews:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reviews",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reviewTypes = [
    { value: "boarding", label: "Boarding" },
    { value: "sitting", label: "Pet Sitting" },
    { value: "veterinary", label: "Veterinary" },
    { value: "training", label: "Training" },
    { value: "grooming", label: "Grooming" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Reviews & References</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Review {index + 1}</Label>
                  {reviewFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeReview(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`reviews.${index}.reviewerName`}>Reviewer Name *</Label>
                    <Input
                      {...register(`reviews.${index}.reviewerName`, { required: true })}
                      placeholder="e.g., Sarah Johnson"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reviews.${index}.reviewerContact`}>Contact</Label>
                    <Input
                      {...register(`reviews.${index}.reviewerContact`)}
                      placeholder="Email or phone"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reviews.${index}.rating`}>Rating *</Label>
                    <Select
                      value={watch(`reviews.${index}.rating`)?.toString()}
                      onValueChange={(value) => setValue(`reviews.${index}.rating`, parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} Star{rating !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`reviews.${index}.type`}>Type</Label>
                    <Select
                      value={watch(`reviews.${index}.type`)}
                      onValueChange={(value) => setValue(`reviews.${index}.type`, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`reviews.${index}.date`}>Date</Label>
                    <Input
                      {...register(`reviews.${index}.date`)}
                      placeholder="e.g., March 2024"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reviews.${index}.location`}>Location</Label>
                    <Input
                      {...register(`reviews.${index}.location`)}
                      placeholder="e.g., Denver, CO"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`reviews.${index}.text`}>Review Text</Label>
                  <Textarea
                    {...register(`reviews.${index}.text`)}
                    placeholder="Write the review..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendReview({ 
                reviewerName: "", 
                reviewerContact: "", 
                rating: 5, 
                text: "", 
                date: "", 
                location: "", 
                type: "boarding" 
              })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
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
