import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, FileText, Award, Briefcase, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface AIBioAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petData?: any;
}

export function AIBioAssistantModal({ open, onOpenChange, petData }: AIBioAssistantModalProps) {
  const [activeTab, setActiveTab] = useState("bio");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (task: string) => {
    setLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke('bio-assistant', {
        body: { 
          task,
          petData,
          customPrompt: customPrompt.trim() || undefined
        }
      });

      if (error) throw error;

      if (data?.result) {
        setResult(data.result);
      } else {
        throw new Error("No result received");
      }

    } catch (error: any) {
      console.error("Error generating content:", error);
      
      let errorMessage = "Failed to generate content. Please try again.";
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

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto native-scroll hide-scrollbar overscroll-y-contain touch-pan-y">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Bio & Resume AI Assistant
          </DialogTitle>
          <DialogDescription>
            Generate professional pet bios, experiences, and achievements
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="bio" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1" />
              Bio
            </TabsTrigger>
            <TabsTrigger value="experience" className="text-xs sm:text-sm">
              <Briefcase className="h-4 w-4 mr-1" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="achievement" className="text-xs sm:text-sm">
              <Award className="h-4 w-4 mr-1" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="polish" className="text-xs sm:text-sm">
              <Wand2 className="h-4 w-4 mr-1" />
              Polish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bio" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Instructions (Optional)</Label>
              </div>
              <Textarea
                placeholder="e.g., Focus on their playful personality and love of swimming..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <AzureButton onClick={() => handleGenerate('bio')} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Bio
            </AzureButton>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Instructions (Optional)</Label>
              </div>
              <Textarea
                placeholder="e.g., Include therapy dog work and agility training..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <AzureButton onClick={() => handleGenerate('experience')} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Experiences
            </AzureButton>
          </TabsContent>

          <TabsContent value="achievement" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Instructions (Optional)</Label>
              </div>
              <Textarea
                placeholder="e.g., Focus on training milestones and certifications..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <AzureButton onClick={() => handleGenerate('achievement')} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Achievements
            </AzureButton>
          </TabsContent>

          <TabsContent value="polish" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Text to Polish</Label>
              </div>
              <Textarea
                placeholder="Paste your existing text here to improve it..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>
            <AzureButton onClick={() => handleGenerate('polish')} disabled={loading || !customPrompt} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Polish Text
            </AzureButton>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {result}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                Copy to Clipboard
              </Button>
              <Button onClick={() => setResult("")} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
