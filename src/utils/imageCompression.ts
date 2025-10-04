// Image compression utility for mobile photo uploads
import * as EXIF from 'exif-js';

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

/**
 * Fixes image orientation by reading EXIF data and rotating the image
 * This "bakes" the orientation into the image pixels, removing the EXIF tag
 * @param file The image file
 * @returns Promise with orientation-corrected file
 */
function fixOrientation(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        // @ts-ignore - EXIF library types
        EXIF.getData(img, function() {
          // @ts-ignore
          const orientation = EXIF.getTag(this, "Orientation") || 1;
          console.log('[fixOrientation] Detected orientation:', orientation);
          
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            console.warn('[fixOrientation] No canvas context, returning original');
            resolve(file);
            return;
          }
          
          const { width, height } = img;
          
          // For orientations 5-8, dimensions are swapped
          if (orientation >= 5 && orientation <= 8) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }
          
          // Apply the transformation based on EXIF orientation
          switch (orientation) {
            case 2: // Flip horizontal
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
              break;
            case 3: // Rotate 180°
              ctx.translate(width, height);
              ctx.rotate(Math.PI);
              break;
            case 4: // Flip vertical
              ctx.translate(0, height);
              ctx.scale(1, -1);
              break;
            case 5: // Rotate 90° CW and flip horizontal
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6: // Rotate 90° CW
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -height);
              break;
            case 7: // Rotate 90° CCW and flip horizontal
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-width, height);
              ctx.scale(1, -1);
              break;
            case 8: // Rotate 90° CCW
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-width, 0);
              break;
            default:
              // Orientation 1 or undefined - no transformation
              break;
          }
          
          // Draw the corrected image
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob and create new file
          canvas.toBlob((blob) => {
            if (blob) {
              const correctedFile = new File([blob], file.name, { type: file.type || 'image/jpeg' });
              console.log('[fixOrientation] Orientation corrected, orientation value was:', orientation);
              resolve(correctedFile);
            } else {
              console.warn('[fixOrientation] Blob creation failed, returning original');
              resolve(file);
            }
          }, file.type || 'image/jpeg');
        });
      };
      
      img.onerror = () => {
        console.warn('[fixOrientation] Image load error, returning original');
        resolve(file);
      };
      
      img.src = e.target!.result as string;
    };
    
    reader.onerror = () => {
      console.warn('[fixOrientation] FileReader error, returning original');
      resolve(file);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file to reduce file size and dimensions
 * Now uses fixOrientation first to normalize the image before compression
 * @param file The original image file
 * @param options Compression options
 * @returns Promise with compressed image result
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  // FIRST: Fix orientation to normalize the image
  const orientationCorrectedFile = await fixOrientation(file);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Image is already orientation-corrected, just resize
        let { width, height } = img;
        const aspectRatio = width / height;

        // Apply max constraints
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Round to avoid sub-pixel issues
        width = Math.round(width);
        height = Math.round(height);

        console.log('[compressImage] Resizing to:', width, 'x', height);

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw the already-corrected image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if we need further compression based on file size
            let finalQuality = quality;
            const targetSize = maxSizeKB * 1024;

            if (blob.size > targetSize && quality > 0.3) {
              // Reduce quality if file is still too large
              finalQuality = Math.max(0.3, quality * (targetSize / blob.size));
              
              canvas.toBlob(
                (secondBlob) => {
                  if (!secondBlob) {
                    reject(new Error('Failed to compress image on second pass'));
                    return;
                  }

                  const compressedFile = new File([secondBlob], orientationCorrectedFile.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });

                  resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: secondBlob.size,
                    compressionRatio: file.size / secondBlob.size,
                  });
                },
                'image/jpeg',
                finalQuality
              );
            } else {
              const compressedFile = new File([blob], orientationCorrectedFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: file.size / blob.size,
              });
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        console.error('[compressImage] Error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the orientation-corrected image
    img.src = URL.createObjectURL(orientationCorrectedFile);
  });
}

/**
 * Compresses multiple images
 * @param files Array of image files
 * @param options Compression options
 * @returns Promise with array of compressed results
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];
  
  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Return original file if compression fails
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
      });
    }
  }
  
  return results;
}

/**
 * Formats file size for display
 * @param bytes File size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}