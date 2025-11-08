import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, X } from "lucide-react";

interface ReviewResponseFormProps {
  reviewId: string;
  petName: string;
  existingResponse?: {
    id: string;
    response_text: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewResponseForm = ({ reviewId, petName, existingResponse, onSuccess, onCancel }: ReviewResponseFormProps) => {
  const [responseText, setResponseText] = useState(existingResponse?.response_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!existingResponse;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from('review_responses')
          .update({ response_text: responseText.trim() })
          .eq('id', existingResponse.id);

        if (error) throw error;

        toast({
          title: "Response updated!",
          description: "Your response has been updated.",
        });
      } else {
        // Insert new response
        const { error } = await supabase
          .from('review_responses')
          .insert({
            review_id: reviewId,
            response_text: responseText.trim(),
          });

        if (error) throw error;

        toast({
          title: "Response posted!",
          description: "Your response has been added to the review.",
        });
      }

      setResponseText("");
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to post response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {isEditing ? 'Edit Response' : `Respond as ${petName}'s Owner`}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Thank you for your review! Write your response here..."
          className="min-h-[100px] bg-background"
          disabled={isSubmitting}
        />
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={isSubmitting}
            className="bg-azure hover:bg-azure/90 text-white"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                {isEditing ? 'Update Response' : 'Post Response'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};