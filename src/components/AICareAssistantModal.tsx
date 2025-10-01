import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AICareAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petData?: any;
}

const SUGGESTED_QUESTIONS = [
  "How much should I feed my pet?",
  "What's a good daily routine?",
  "How do I handle separation anxiety?",
  "What are signs of stress in pets?",
  "Best practices for crate training?",
];

export function AICareAssistantModal({ open, onOpenChange, petData }: AICareAssistantModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question about pet care",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke('care-assistant', {
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
      console.error("Error getting answer:", error);
      
      let errorMessage = "Failed to get answer. Please try again.";
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Care & Handling AI Assistant
          </DialogTitle>
          <DialogDescription>
            Get advice on feeding, routines, behavior, and daily care
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Ask a Question
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., What's a good feeding schedule for my dog?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Suggested Questions */}
          {!answer && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Suggested Questions:</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((suggestion, index) => (
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
            <Button 
              onClick={handleAskQuestion} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask AI Assistant
                </>
              )}
            </Button>
            
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
              
              <div className="text-xs text-muted-foreground pt-4 border-t">
                💡 This is general advice. For specific health concerns, always consult your veterinarian.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
