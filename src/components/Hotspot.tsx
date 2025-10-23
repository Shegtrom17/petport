import React, { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HotspotProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Hotspot: React.FC<HotspotProps> = ({ 
  id, 
  title, 
  description,
  position = 'bottom'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const storageKey = `hotspot_dismissed_${id}`;

  useEffect(() => {
    // Only show if tour is completed and hotspot hasn't been dismissed
    const tourCompleted = localStorage.getItem('petport_onboarding_completed');
    const dismissed = localStorage.getItem(storageKey);
    
    if (tourCompleted && !dismissed) {
      // Delay appearance slightly for smoother UX
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="relative z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse hover:animate-none transition-all"
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {showTooltip && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowTooltip(false)}
          />
          <Card className={`absolute z-[9999] w-64 shadow-lg ${positionClasses[position]}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 -mt-1 -mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
