import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AITravelAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petSpecies?: string;
  defaultLocation?: string;
}

export function AITravelAssistantModal({ 
  open, 
  onOpenChange, 
  petSpecies,
  defaultLocation 
}: AITravelAssistantModalProps) {
  const [location, setLocation] = useState(defaultLocation || "");
  const [customQuery, setCustomQuery] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a city, state, or destination",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuggestions("");

    try {
      const { data, error } = await supabase.functions.invoke('travel-assistant', {
        body: { 
          location: location.trim(),
          petSpecies,
          query: customQuery.trim() || undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error("No suggestions received");
      }

    } catch (error: any) {
      console.error("Error getting AI suggestions:", error);
      
      let errorMessage = "Failed to get suggestions. Please try again.";
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes("credits")) {
        errorMessage = "AI usage limit reached. Please contact support.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuggestions("");
    setCustomQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto with-keyboard-padding">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Travel Assistant
          </DialogTitle>
          <DialogDescription>
            Get personalized suggestions for pet-friendly places at your destination
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Destination
            </Label>
            <Input
              id="location"
              placeholder="e.g., Seattle, WA or Austin, Texas"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Optional Custom Query */}
          <div className="space-y-2">
            <Label htmlFor="query">
              What are you looking for? (Optional)
            </Label>
            <Textarea
              id="query"
              placeholder="e.g., dog-friendly beaches, emergency vets, hiking trails"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <AzureButton 
              onClick={handleGetSuggestions} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Suggestions
                </>
              )}
            </AzureButton>
            
            {suggestions && (
              <Button 
                onClick={handleReset} 
                variant="outline"
                disabled={loading}
              >
                New Search
              </Button>
            )}
          </div>

          {/* AI Suggestions Display */}
          {suggestions && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {suggestions}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground pt-4 border-t">
                💡 Tip: These are AI-generated suggestions. Always verify locations and details before visiting.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
