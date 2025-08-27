import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";

interface CoachOverlayProps {
  isActive: boolean;
  step: {
    title: string;
    description: string;
  } | null;
  stepNumber: number;
  totalSteps: number;
  targetElement: HTMLElement | null;
  onNext: () => void;
  onSkip: () => void;
}

export const CoachOverlay: React.FC<CoachOverlayProps> = ({
  isActive,
  step,
  stepNumber,
  totalSteps,
  targetElement,
  onNext,
  onSkip
}) => {
  if (!isActive || !step) return null;

  const getCardPosition = () => {
    if (!targetElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const cardHeight = 120; // Approximate card height
    const spacing = 16;

    // Position below target if there's space, otherwise above
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= cardHeight + spacing) {
      return {
        top: rect.bottom + spacing,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 320)),
      };
    } else if (spaceAbove >= cardHeight + spacing) {
      return {
        top: rect.top - cardHeight - spacing,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 320)),
      };
    } else {
      // Fallback to center if no good position
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }
  };

  const getSpotlightStyle = () => {
    if (!targetElement) return {};
    
    const rect = targetElement.getBoundingClientRect();
    return {
      clipPath: `circle(${Math.max(rect.width, rect.height) / 2 + 8}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px)`
    };
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with spotlight */}
      <div 
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        style={getSpotlightStyle()}
        onClick={onSkip}
      />
      
      {/* Coach card */}
      <Card 
        className="absolute w-80 shadow-xl border-border bg-background"
        style={getCardPosition()}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-muted-foreground text-xs mt-1">{step.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="p-1 h-6 w-6 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {stepNumber} of {totalSteps}
            </span>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSkip}>
                Skip
              </Button>
              <Button size="sm" onClick={onNext}>
                {stepNumber === totalSteps ? 'Done' : 'Next'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};