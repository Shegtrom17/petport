import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
}

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryLightbox = ({ photos, initialIndex, isOpen, onClose }: GalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number; distance: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Reset zoom when photo changes
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsZoomed(false);
  }, [currentIndex]);

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isZoomed) goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isZoomed) goToNext();
          break;
      }
    };

    // Focus trap
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isZoomed]);

  const goToNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleDoubleTouch = useCallback(() => {
    if (scale === 1) {
      // Zoom in to 2x
      setScale(2);
      setIsZoomed(true);
    } else {
      // Reset zoom
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      setIsZoomed(false);
    }
  }, [scale]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - handle double tap and pan when zoomed
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        handleDoubleTouch();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }

      if (isZoomed) {
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          distance: 0
        };
      }
    } else if (e.touches.length === 2) {
      // Two-finger pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      lastTouchRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance
      };
    }
  }, [isZoomed, handleDoubleTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!lastTouchRef.current) return;

    if (e.touches.length === 1 && isZoomed) {
      // Pan when zoomed
      const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
      const deltaY = e.touches[0].clientY - lastTouchRef.current.y;
      
      setTranslateX(prev => prev + deltaX);
      setTranslateY(prev => prev + deltaY);
      
      lastTouchRef.current = {
        ...lastTouchRef.current,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scaleChange = distance / lastTouchRef.current.distance;
      const newScale = Math.max(1, Math.min(5, scale * scaleChange));
      
      setScale(newScale);
      setIsZoomed(newScale > 1);
      
      lastTouchRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance
      };
    }
  }, [isZoomed, scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      lastTouchRef.current = null;
    }
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isZoomed) return; // No navigation when zoomed
    
    if (direction === 'left') {
      goToNext();
    } else {
      goToPrevious();
    }
  }, [isZoomed, goToNext, goToPrevious]);

  if (!isOpen) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0 h-12 w-12"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation buttons */}
      {!isZoomed && photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0 h-12 w-12"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0 h-12 w-12"
            onClick={goToNext}
            disabled={currentIndex === photos.length - 1}
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} of {photos.length}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative max-w-full max-h-full overflow-hidden touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={currentPhoto.url}
          alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
            transformOrigin: 'center',
          }}
          draggable={false}
        />
      </div>

      {/* Caption */}
      {currentPhoto.caption && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/50 text-white p-3 rounded-lg text-center">
          {currentPhoto.caption}
        </div>
      )}

      {/* Zoom instruction */}
      {!isZoomed && (
        <div className="absolute bottom-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-70">
          {photos.length > 1 ? 'Swipe • Pinch to zoom • Double tap' : 'Pinch to zoom • Double tap'}
        </div>
      )}
    </div>
  );
};