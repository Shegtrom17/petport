// src/hooks/useSwipeNavigation.ts
import { useSwipeable } from "react-swipeable";
import { useMemo } from "react";

type Opts = {
  enabled: boolean;          // gate with isTouchDevice() && feature flag
  onPrev: () => void;
  onNext: () => void;
  isOverlayOpen?: boolean;   // dialogs/sheets open?
  isPtrActive?: boolean;     // pull-to-refresh active?
  minDelta?: number;         // ~56
  maxAngle?: number;         // ~30
  debug?: boolean;
};

export function useSwipeNavigation({
  enabled,
  onPrev,
  onNext,
  isOverlayOpen = false,
  isPtrActive = false,
  minDelta = 56,
  maxAngle = 30,
  debug = false,
}: Opts) {
  const cfg = useMemo(
    () => ({
      trackTouch: true,
      trackMouse: false,         // prevents desktop trackpad/mouse swipes
      delta: minDelta,
      preventScrollOnSwipe: false, // vertical scroll should win
      onSwiping: (e: any) => {
        if (!enabled || isOverlayOpen || isPtrActive) return;
        
        // Ignore multi-touch (pinch gestures)
        if (e.event?.touches && e.event.touches.length > 1) return;
        
        // Check if touch originated from interactive/touch-safe element
        const target = e.event?.target as HTMLElement;
        if (target) {
          // Check for touch-safe attribute on element or parents
          let el: HTMLElement | null = target;
          while (el) {
            if (el.hasAttribute?.('data-touch-safe')) {
              if (debug) console.log("[swipe] ignoring - touch-safe element");
              return;
            }
            // Check for interactive elements
            const tagName = el.tagName?.toLowerCase();
            if (tagName === 'button' || tagName === 'a' || tagName === 'input' || tagName === 'textarea') {
              if (debug) console.log("[swipe] ignoring - interactive element:", tagName);
              return;
            }
            el = el.parentElement;
          }
        }
        
        if (debug) console.log("[swipe] swiping", { dir: e.dir, dx: e.deltaX, dy: e.deltaY });
        const angle = Math.abs((Math.atan2(e.deltaY, e.deltaX) * 180) / Math.PI);
        if (angle > maxAngle) return; // mostly vertical → ignore
      },
      onSwipedLeft: () => {
        if (debug) console.log("[swipe] left", { enabled, isOverlayOpen, isPtrActive });
        if (!enabled || isOverlayOpen || isPtrActive) return;
        onNext();
      },
      onSwipedRight: () => {
        if (debug) console.log("[swipe] right", { enabled, isOverlayOpen, isPtrActive });
        if (!enabled || isOverlayOpen || isPtrActive) return;
        onPrev();
      },
    }),
    [enabled, isOverlayOpen, isPtrActive, minDelta, maxAngle, onPrev, onNext, debug]
  );

  const handlers = useSwipeable(cfg);
  // Return undefined when disabled; consumer should spread only when defined.
  return enabled && !isOverlayOpen && !isPtrActive ? handlers : undefined;
}