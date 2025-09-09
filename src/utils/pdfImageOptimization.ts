import { GALLERY_CONFIG } from '@/config/featureFlags';

/**
 * Optimizes images for PDF generation by downscaling and compressing them
 * This reduces memory usage and file size without affecting display quality significantly
 */
export const optimizeImageForPDF = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Optimizing image for PDF:', imageUrl);
    
    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const { maxWidth, maxHeight, quality } = {
            maxWidth: GALLERY_CONFIG.PDF_MAX_IMAGE_WIDTH,
            maxHeight: GALLERY_CONFIG.PDF_MAX_IMAGE_HEIGHT,
            quality: GALLERY_CONFIG.PDF_IMAGE_QUALITY
          };
          
          // Calculate optimized dimensions
          let { width, height } = img;
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          console.log(`Image optimization: ${img.width}x${img.height} -> ${Math.round(width)}x${Math.round(height)}`);
          
          // Create canvas with optimized dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          
          // Set white background to avoid transparency issues
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw downscaled image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          console.log('Image optimization complete');
          resolve(optimizedBase64);
        } catch (error) {
          console.error('Canvas operation failed:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Image failed to load for optimization:', error);
        reject(new Error('Failed to load image for PDF optimization'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Failed to optimize image for PDF:', error);
    // Return original URL as fallback
    return imageUrl;
  }
};

/**
 * Batch optimize multiple images for PDF generation
 */
export const optimizeImagesForPDF = async (imageUrls: string[]): Promise<string[]> => {
  console.log(`Optimizing ${imageUrls.length} images for PDF generation`);
  
  const optimizationPromises = imageUrls.map(async (url) => {
    try {
      return await optimizeImageForPDF(url);
    } catch (error) {
      console.error('Failed to optimize image, using original:', url, error);
      return url; // Fallback to original URL
    }
  });
  
  const optimizedImages = await Promise.all(optimizationPromises);
  console.log('Batch image optimization complete');
  
  return optimizedImages;
};