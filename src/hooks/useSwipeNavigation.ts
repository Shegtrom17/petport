import { useSwipeable } from 'react-swipeable';
import { useCallback, useRef } from 'react';

interface SwipeNavigationOptions {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  isOverlayOpen?: boolean;
  isPtrActive?: boolean;
  minDelta?: number;
  maxAngle?: number;
}

export function useSwipeNavigation({
  enabled,
  onPrev,
  onNext,
  isOverlayOpen = false,
  isPtrActive = false,
  minDelta = 56,
  maxAngle = 30,
}: SwipeNavigationOptions) {
  const handlersRef = useRef({});

  const shouldBlockSwipe = useCallback(() => {
    return !enabled || isOverlayOpen || isPtrActive;
  }, [enabled, isOverlayOpen, isPtrActive]);

  const handleSwipedLeft = useCallback(() => {
    if (shouldBlockSwipe()) return;
    console.log('Swipe left detected - going to next tab');
    onNext();
  }, [shouldBlockSwipe, onNext]);

  const handleSwipedRight = useCallback(() => {
    if (shouldBlockSwipe()) return;
    console.log('Swipe right detected - going to previous tab');
    onPrev();
  }, [shouldBlockSwipe, onPrev]);

  const handleSwiping = useCallback((e: any) => {
    if (shouldBlockSwipe()) return;

    // prefer vertical scroll: if mostly vertical, ignore
    const angle = Math.abs(e.dir === 'Left' || e.dir === 'Right'
      ? Math.atan2(e.deltaY, e.deltaX) * (180 / Math.PI)
      : 90);
    
    if (angle > maxAngle) {
      console.log(`Swipe blocked - angle too steep: ${angle}°`);
      return;
    }
    
    console.log(`Swipe detected - direction: ${e.dir}, angle: ${angle}°`);
  }, [shouldBlockSwipe, maxAngle]);

  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: false,
    delta: minDelta,
    preventScrollOnSwipe: false, // let vertical scroll win
    onSwiping: handleSwiping,
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
  });

  // Only return handlers when swipe should be active
  if (!enabled || isOverlayOpen) {
    console.log('Swipe handlers disabled:', { enabled, isOverlayOpen, isPtrActive });
    return {};
  }

  console.log('Swipe handlers active:', { enabled, isOverlayOpen, isPtrActive });
  return handlers;
}