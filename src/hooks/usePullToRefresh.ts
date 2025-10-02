import { useEffect, useState, useCallback, useRef } from 'react';
import { isIOSDevice } from '@/utils/iosDetection';
import { useIOSResilience } from './useIOSResilience';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  containerId?: string;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 80, 
  disabled = false,
  containerId = 'app-scroll-container'
}: PullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const { safeAsync } = useIOSResilience({ timeoutMs: 8000 });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isIOSDevice() || e.touches.length > 1) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    // Expanded safe zones - don't trigger PTR on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-gallery-area]') || 
      target.closest('[role="dialog"]') ||
      target.closest('[data-swiper]') ||
      target.closest('.leaflet-container') ||
      target.closest('[data-carousel]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select')
    ) {
      return;
    }
    
    setStartY(e.touches[0].clientY);
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !isIOSDevice() || startY === 0 || e.touches.length > 1) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    // Expanded safe zones
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-gallery-area]') || 
      target.closest('[role="dialog"]') ||
      target.closest('[data-swiper]') ||
      target.closest('.leaflet-container') ||
      target.closest('[data-carousel]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select')
    ) {
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      e.stopPropagation();
      // iOS-tuned sensitivity
      setPullDistance(Math.min(distance * 0.6, threshold * 1.5));
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
      // Use resilience wrapper with timeout
      await safeAsync(
        async () => await onRefresh(),
        undefined,
        'pull-to-refresh'
      );
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setStartY(0);
    }
  }, [disabled, pullDistance, threshold, onRefresh, safeAsync]);

  useEffect(() => {
    // Only run on iOS devices
    if (!isIOSDevice()) return;

    // Get or wait for the scroll container
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`PTR: Container #${containerId} not found`);
      return;
    }
    
    containerRef.current = container;

    // Attach listeners to the scroll container, not document
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, containerId]);

  return {
    isRefreshing,
    pullDistance,
    isThresholdReached: pullDistance >= threshold,
    isPtrActive: pullDistance > 0 || isRefreshing,
  };
};