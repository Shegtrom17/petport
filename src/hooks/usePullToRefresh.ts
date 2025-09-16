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
    if (disabled || window.scrollY > 0 || e.touches.length > 1) return;
    
    // Don't trigger PTR when interacting with gallery or lightbox
    const target = e.target as HTMLElement;
    if (target.closest('[data-gallery-area]') || target.closest('[role="dialog"]')) {
      return;
    }
    
    // iOS Safari specific handling
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOSSafari && window.scrollY === 0) {
      // Prevent iOS native pull-to-refresh
      e.preventDefault();
    }
    
    setStartY(e.touches[0].clientY);
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0 || startY === 0 || e.touches.length > 1) return;
    
    // Don't trigger PTR when interacting with gallery or lightbox
    const target = e.target as HTMLElement;
    if (target.closest('[data-gallery-area]') || target.closest('[role="dialog"]')) {
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    // iOS Safari specific handling
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (distance > 0) {
      if (isIOSSafari) {
        // Always prevent default on iOS to override native behavior
        e.preventDefault();
      } else {
        e.preventDefault();
      }
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5)); // Reduce sensitivity for iOS
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