import { useEffect, useState, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 80, 
  disabled = false 
}: PullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0 || startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [disabled, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || pullDistance < threshold) {
      setPullDistance(0);
      setStartY(0);
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setStartY(0);
    }
  }, [disabled, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    isThresholdReached: pullDistance >= threshold,
    isPtrActive: pullDistance > 0 || isRefreshing,
  };
};