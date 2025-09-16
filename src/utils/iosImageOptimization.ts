/**
 * iOS-specific image optimization utilities to prevent Safari memory crashes
 * Limits image dimensions and manages memory usage for iOS devices
 */

const MAX_IOS_IMAGE_DIMENSION = 2048; // iOS Safari limit
const MAX_IOS_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB limit for iOS
const IOS_MEMORY_WARNING_THRESHOLD = 0.8; // 80% memory usage warning

/**
 * Detects if the current device is iOS
 */
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Estimates image memory usage based on dimensions
 */
export const estimateImageMemoryUsage = (width: number, height: number): number => {
  // 4 bytes per pixel (RGBA) approximation
  return width * height * 4;
};

/**
 * Checks if an image exceeds iOS memory limits
 */
export const exceedsIOSMemoryLimits = (width: number, height: number): boolean => {
  if (!isIOSDevice()) return false;
  
  const memoryUsage = estimateImageMemoryUsage(width, height);
  return width > MAX_IOS_IMAGE_DIMENSION || 
         height > MAX_IOS_IMAGE_DIMENSION || 
         memoryUsage > MAX_IOS_IMAGE_SIZE;
};

/**
 * Calculates optimal dimensions for iOS display
 */
export const calculateIOSOptimalDimensions = (
  originalWidth: number, 
  originalHeight: number
): { width: number; height: number } => {
  if (!exceedsIOSMemoryLimits(originalWidth, originalHeight)) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // Scale down to fit within iOS limits
  if (originalWidth > MAX_IOS_IMAGE_DIMENSION) {
    newWidth = MAX_IOS_IMAGE_DIMENSION;
    newHeight = newWidth / aspectRatio;
  }

  if (newHeight > MAX_IOS_IMAGE_DIMENSION) {
    newHeight = MAX_IOS_IMAGE_DIMENSION;
    newWidth = newHeight * aspectRatio;
  }

  return { width: Math.floor(newWidth), height: Math.floor(newHeight) };
};

/**
 * Optimizes an image for iOS Safari display
 */
export const optimizeImageForIOS = async (imageUrl: string): Promise<string> => {
  if (!isIOSDevice()) return imageUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const { width, height } = calculateIOSOptimalDimensions(img.width, img.height);
        
        // If no optimization needed, return original
        if (width === img.width && height === img.height) {
          resolve(imageUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use higher quality for iOS optimization
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimizedDataUrl);
      } catch (error) {
        console.warn('iOS image optimization failed:', error);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

/**
 * Preloads and optimizes multiple images for iOS
 */
export const optimizeImagesForIOS = async (imageUrls: string[]): Promise<string[]> => {
  if (!isIOSDevice() || imageUrls.length === 0) return imageUrls;

  const optimizationPromises = imageUrls.map(url => optimizeImageForIOS(url));
  return Promise.all(optimizationPromises);
};

/**
 * Monitors memory usage and provides warnings for iOS
 */
export const checkIOSMemoryPressure = (): { isHigh: boolean; recommendation: string } => {
  if (!isIOSDevice()) return { isHigh: false, recommendation: '' };

  // Use performance memory API if available (limited on iOS)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.totalJSHeapSize;
    
    if (usageRatio > IOS_MEMORY_WARNING_THRESHOLD) {
      return {
        isHigh: true,
        recommendation: 'High memory usage detected. Consider reducing image quality or quantity.'
      };
    }
  }

  return { isHigh: false, recommendation: '' };
};

/**
 * Progressive image loading strategy for iOS
 */
export const createIOSProgressiveLoader = (
  imageUrls: string[],
  onImageLoaded: (url: string, index: number) => void,
  onError: (error: Error, index: number) => void
) => {
  if (!isIOSDevice()) {
    // Standard loading for non-iOS
    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.onload = () => onImageLoaded(url, index);
      img.onerror = () => onError(new Error(`Failed to load image ${index}`), index);
      img.src = url;
    });
    return;
  }

  // Progressive loading for iOS - load one at a time to manage memory
  let currentIndex = 0;

  const loadNext = () => {
    if (currentIndex >= imageUrls.length) return;

    const url = imageUrls[currentIndex];
    const index = currentIndex;
    currentIndex++;

    optimizeImageForIOS(url)
      .then(optimizedUrl => {
        onImageLoaded(optimizedUrl, index);
        // Add delay to prevent overwhelming iOS Safari
        setTimeout(loadNext, 100);
      })
      .catch(error => {
        onError(error, index);
        setTimeout(loadNext, 100);
      });
  };

  loadNext();
};