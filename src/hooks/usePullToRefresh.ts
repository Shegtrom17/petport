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
    
    // Enhanced iOS Safari specific handling
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if ((isIOSSafari || isIOS) && window.scrollY === 0) {
      // More aggressive prevention of iOS native pull-to-refresh
      e.preventDefault();
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
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
    
    // Enhanced iOS Safari specific handling
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (distance > 0) {
      // More aggressive prevention on iOS
      if (isIOSSafari || isIOS) {
        e.preventDefault();
        e.stopPropagation();
        // Reduce sensitivity for iOS to make it feel more responsive
        setPullDistance(Math.min(distance * 0.7, threshold * 1.5));
      } else {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
      }
    }
  }, [disabled, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    // Reset iOS overscroll behavior
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    }
    
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