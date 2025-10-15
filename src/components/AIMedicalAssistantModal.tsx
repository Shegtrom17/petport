import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Stethoscope, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIMedicalAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petData?: any;
}

const SUGGESTED_TOPICS = [
  "Vaccination schedule guidelines",
  "Common health symptoms to watch for",
  "Preventive care tips",
  "When to call the vet",
  "Medication tracking tips",
];

export function AIMedicalAssistantModal({ open, onOpenChange, petData }: AIMedicalAssistantModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a health-related question",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke('medical-assistant', {
        body: { 
          question: question.trim(),
          petData
        }
      });

      if (error) throw error;

      if (data?.answer) {
        setAnswer(data.answer);
      } else {
        throw new Error("No answer received");
      }

    } catch (error: any) {
      console.error("Error getting medical information:", error);
      
      let errorMessage = "Failed to get information. Please try again.";
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

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const handleReset = () => {
    setAnswer("");
    setQuestion("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto with-keyboard-padding">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Medical AI Assistant
          </DialogTitle>
          <DialogDescription>
            General health information and preventive care guidance
          </DialogDescription>
        </DialogHeader>

        {/* Critical Medical Disclaimer */}
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Important:</strong> This AI provides general educational information only. 
            It is NOT a substitute for professional veterinary care. For any medical concerns, 
            symptoms, or emergencies, please consult a licensed veterinarian immediately.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Ask About Pet Health
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., What are general vaccination guidelines for dogs?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Suggested Topics */}
          {!answer && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Suggested Topics:</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TOPICS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <AzureButton 
              onClick={handleAskQuestion} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Information...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Health Information
                </>
              )}
            </AzureButton>
            
            {answer && (
              <Button 
                onClick={handleReset} 
                variant="outline"
                disabled={loading}
              >
                New Question
              </Button>
            )}
          </div>

          {/* AI Answer Display */}
          {answer && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {answer}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-red-600 dark:text-red-400 pt-4 border-t font-medium">
                ⚠️ Always consult your veterinarian for medical advice, diagnosis, or treatment.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
