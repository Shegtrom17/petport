// Image compression utility for mobile photo uploads
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
 * Gets the EXIF orientation of an image file
 * @param file The image file
 * @returns Promise with orientation value (1-8)
 */
function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1); // Not a JPEG, default orientation
        return;
      }
      
      const length = view.byteLength;
      let offset = 2;
      
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        
        if (marker === 0xFFE1) { // EXIF marker
          const exifLength = view.getUint16(offset, false);
          offset += 2;
          
          if (view.getUint32(offset, false) !== 0x45786966) {
            resolve(1); // Invalid EXIF
            return;
          }
          
          const tiffOffset = offset + 6;
          const firstIFDOffset = view.getUint32(tiffOffset + 4, view.getUint16(tiffOffset, false) === 0x4949);
          const tagCount = view.getUint16(tiffOffset + firstIFDOffset, view.getUint16(tiffOffset, false) === 0x4949);
          
          for (let i = 0; i < tagCount; i++) {
            const tagOffset = tiffOffset + firstIFDOffset + 2 + i * 12;
            const tag = view.getUint16(tagOffset, view.getUint16(tiffOffset, false) === 0x4949);
            
            if (tag === 0x0112) { // Orientation tag
              const orientation = view.getUint16(tagOffset + 8, view.getUint16(tiffOffset, false) === 0x4949);
              resolve(orientation);
              return;
            }
          }
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      
      resolve(1); // Default orientation
    };
    reader.readAsArrayBuffer(file.slice(0, 512 * 1024)); // Read first 512KB (more robust for EXIF)
  });
}

/**
 * Applies orientation transformation to canvas context
 * @param ctx Canvas 2D context
 * @param orientation EXIF orientation value
 * @param width Canvas width
 * @param height Canvas height
 */
function applyOrientation(ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) {
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
    case 5: // Transpose: vertical flip + 90° CW
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // Rotate 90° CW
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7: // Transverse: horizontal flip + 90° CW
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8: // Rotate 90° CCW
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      // No transformation needed
      break;
  }
}

/**
 * Compresses an image file to reduce file size and dimensions
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

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = async () => {
      try {
        // Get EXIF orientation
        const orientation = await getImageOrientation(file);
        console.log('[Image Compression] EXIF orientation:', orientation, 'Original dimensions:', img.width, 'x', img.height);
        
        // Get original dimensions
        let { width, height } = img;
        
        // For orientations 5-8, the image needs to be rotated 90/270 degrees
        // This means width and height are swapped in the final display
        const needsDimensionSwap = orientation >= 5 && orientation <= 8;
        
        // Calculate the aspect ratio based on the ORIGINAL image dimensions
        const originalAspectRatio = width / height;
        
        // Determine final display dimensions (after rotation is applied)
        let finalWidth = needsDimensionSwap ? height : width;
        let finalHeight = needsDimensionSwap ? width : height;
        
        // Calculate the aspect ratio of the FINAL rotated image
        const finalAspectRatio = finalWidth / finalHeight;
        
        // Apply max constraints to the FINAL dimensions
        if (finalWidth > maxWidth) {
          finalWidth = maxWidth;
          finalHeight = finalWidth / finalAspectRatio;
        }
        
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight * finalAspectRatio;
        }
        
        // Round to avoid sub-pixel rendering issues
        finalWidth = Math.round(finalWidth);
        finalHeight = Math.round(finalHeight);
        
        console.log('[Image Compression] Final dimensions:', finalWidth, 'x', finalHeight, 'Swap needed:', needsDimensionSwap);
        
        // Set canvas to the FINAL dimensions (what the user will see)
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        // Apply the orientation transformation
        // The transformation will handle the rotation/flipping
        applyOrientation(ctx, orientation, finalWidth, finalHeight);
        
        // Draw the image scaled to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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

                  const compressedFile = new File([secondBlob], file.name, {
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
              const compressedFile = new File([blob], file.name, {
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
        // If orientation reading fails, use fallback without rotation
        console.warn('Failed to read EXIF orientation, using fallback:', error);
        
        // Calculate new dimensions while maintaining aspect ratio
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

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw image without orientation correction
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: file.size / blob.size,
            });
          },
          'image/jpeg',
          quality
        );
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
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