import { useEffect, useState, useCallback } from 'react';
import { isIOSDevice } from '@/utils/iosDetection';

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
  
  // iOS-only feature - return no-op for Android
  const isiOS = isIOSDevice();
  
  if (!isiOS) {
    return {
      isRefreshing: false,
      pullDistance: 0,
      isThresholdReached: false,
      isPtrActive: false,
    };
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0 || e.touches.length > 1) return;
    
    // Extended safe zones - don't trigger PTR on these elements
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-gallery-area]') || 
      target.closest('[role="dialog"]') ||
      target.closest('.leaflet-container') || // Maps
      target.closest('[data-carousel]') || // Carousels
      target.closest('[data-swiper]') // Swiper elements
    ) {
      return;
    }
    
    // Start tracking but don't block native scroll yet; wait for small pull
    if (window.scrollY === 0) {
      // activate PTR control after small threshold in touchmove
    }

    setStartY(e.touches[0].clientY);
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0 || startY === 0 || e.touches.length > 1) return;
    
    // Extended safe zones
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-gallery-area]') || 
      target.closest('[role="dialog"]') ||
      target.closest('.leaflet-container') ||
      target.closest('[data-carousel]') ||
      target.closest('[data-swiper]')
    ) {
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      // Only take over once user has pulled a bit to avoid conflicts
      if (distance > 12) {
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        e.preventDefault();
        e.stopPropagation();
      }
      // iOS-optimized sensitivity
      setPullDistance(Math.min(distance * 0.7, threshold * 1.5));
    }
  }, [disabled, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    // Reset iOS overscroll behavior
    document.body.style.overscrollBehavior = '';
    document.documentElement.style.overscrollBehavior = '';
    
    if (disabled || pullDistance < threshold) {
      setPullDistance(0);
      setStartY(0);
      return;
    }

    // Trigger refresh immediately on release
    setIsRefreshing(true);
    setPullDistance(0); // Reset distance to trigger bar animation
    setStartY(0);
    
    try {
      await onRefresh();
    } finally {
      // Keep refreshing state for bar visibility
      setTimeout(() => {
        setIsRefreshing(false);
      }, 3000); // Bar stays visible for 3s
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