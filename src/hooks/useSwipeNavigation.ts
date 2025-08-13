import { useSwipeable } from 'react-swipeable';
import { useMemo } from 'react';

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
  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: false,
    delta: minDelta,
    preventScrollOnSwipe: false, // let vertical scroll win
    onSwiping: (e) => {
      // block if any overlay/pull-to-refresh active
      if (!enabled || isOverlayOpen || isPtrActive) return;

      // prefer vertical scroll: if mostly vertical, ignore
      const angle = Math.abs(e.dir === 'Left' || e.dir === 'Right'
        ? Math.atan2(e.deltaY, e.deltaX) * (180 / Math.PI)
        : 90);
      if (angle > maxAngle) return;
    },
    onSwipedLeft: () => {
      if (!enabled || isOverlayOpen || isPtrActive) return;
      onNext();
    },
    onSwipedRight: () => {
      if (!enabled || isOverlayOpen || isPtrActive) return;
      onPrev();
    },
  });

  // Only attach when enabled to avoid global interference
  return useMemo(() => (enabled && !isOverlayOpen ? handlers : {}), [enabled, isOverlayOpen, handlers]);
}