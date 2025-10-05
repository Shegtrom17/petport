import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FloatingAIButtonProps {
  onClick: () => void;
  label?: string;
  description?: string;
}

export function FloatingAIButton({ onClick, label = "AI Assistant", description = "Get AI-powered suggestions" }: FloatingAIButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-[#5691af] hover:bg-[#4a7d99] hover:scale-110"
          aria-label={label}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-sm">
        <p className="font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
