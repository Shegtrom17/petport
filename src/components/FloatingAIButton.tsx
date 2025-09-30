import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FloatingAIButtonProps {
  onClick: () => void;
}

export function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-gradient-to-br from-primary to-primary/80 hover:scale-110"
            aria-label="AI Travel Assistant"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-sm">
          <p>AI Travel Assistant</p>
          <p className="text-xs text-muted-foreground">Get pet-friendly suggestions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
