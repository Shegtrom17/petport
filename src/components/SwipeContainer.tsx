import React, { PropsWithChildren, useRef } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

interface SwipeContainerProps {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  isOverlayOpen: boolean;
  isPtrActive: boolean;
}

export function SwipeContainer({ 
  enabled, 
  onPrev, 
  onNext, 
  isOverlayOpen, 
  isPtrActive, 
  children 
}: PropsWithChildren<SwipeContainerProps>) {
  const ref = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipeNavigation({
    enabled,
    onPrev,
    onNext,
    isOverlayOpen,
    isPtrActive,
    minDelta: 56,
    maxAngle: 30,
  });

  return (
    <div
      {...swipeHandlers}
      ref={ref}
      data-allow-swipe
      className="h-full w-full relative"
      style={{
        // Let vertical scrolling behave; horizontal swipes are ours
        touchAction: 'pan-y',
        // Contain iOS overscroll so PTR doesn't hijack sideways swipes
        overscrollBehaviorY: 'contain',
        // Keep animations buttery
        willChange: 'transform',
      }}
    >
      {/* Debug indicator for swipe capability */}
      {enabled && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs z-50">
          Swipe Active
        </div>
      )}
      {children}
    </div>
  );
}
