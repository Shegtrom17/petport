import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddReviewFormProps {
  petId: string;
  petName: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddReviewForm = ({ petId, petName, onClose, onSuccess }: AddReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    reviewer_name: '',
    reviewer_contact: '',
    text: '',
    type: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reviewer_name.trim() || !formData.text.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and review text.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          pet_id: petId,
          reviewer_name: formData.reviewer_name.trim(),
          reviewer_contact: formData.reviewer_contact.trim() || null,
          text: formData.text.trim(),
          rating: rating,
          type: formData.type || null,
          location: formData.location.trim() || null,
          date: formData.date || null
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast({
          title: "Error",
          description: "Failed to submit review. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Review Submitted!",
        description: `Thank you for your review of ${petName}!`,
      });

      // Reset form
      setFormData({
        reviewer_name: '',
        reviewer_contact: '',
        text: '',
        type: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
      });
      setRating(5);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          className={`text-2xl transition-colors ${
            starValue <= (hoverRating || rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      );
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Leave a Review for {petName}</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating *
            </label>
            <div className="flex space-x-1">
              {renderStars()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <Input
              value={formData.reviewer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewer_name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Contact (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact (Phone or Email) - Optional
            </label>
            <Input
              value={formData.reviewer_contact}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewer_contact: e.target.value }))}
              placeholder="Phone number or email (optional)"
            />
          </div>

          {/* Review Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select review type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="boarding">Pet Boarding</SelectItem>
                <SelectItem value="sitting">Pet Sitting</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="grooming">Grooming</SelectItem>
                <SelectItem value="veterinary">Veterinary</SelectItem>
                <SelectItem value="daycare">Daycare</SelectItem>
                <SelectItem value="walker">Dog Walking</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="therapy">Therapy Work</SelectItem>
                <SelectItem value="service">Service Work</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State (optional)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Service Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review *
            </label>
            <Textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder={`Share your experience with ${petName}. What was their behavior like? Any special moments or recommendations?`}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            {onClose && (
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: '#5691af' }}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};