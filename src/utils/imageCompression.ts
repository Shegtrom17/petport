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
          offset += 2;
          
          if (view.getUint32(offset, false) !== 0x45786966) {
            resolve(1); // Invalid EXIF
            return;
          }
          
          const tiffOffset = offset + 6;
          const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
          const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
          const tagCount = view.getUint16(tiffOffset + firstIFDOffset, littleEndian);
          
          for (let i = 0; i < tagCount; i++) {
            const tagOffset = tiffOffset + firstIFDOffset + 2 + i * 12;
            const tag = view.getUint16(tagOffset, littleEndian);
            
            if (tag === 0x0112) { // Orientation tag
              const orientation = view.getUint16(tagOffset + 8, littleEndian);
              resolve(orientation);
              return;
            }
          }
          break;
        } else {
          if (offset + 2 > length) break;
          offset += view.getUint16(offset, false);
        }
      }
      
      resolve(1); // Default orientation
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Applies orientation transformation to canvas context
 * @param ctx Canvas 2D context
 * @param orientation EXIF orientation value
 * @param width Image width BEFORE rotation
 * @param height Image height BEFORE rotation
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
    case 5: // Rotate 90° CW and flip horizontal
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // Rotate 90° CW (most common iPhone portrait)
      ctx.translate(width, 0);
      ctx.rotate(0.5 * Math.PI);
      break;
    case 7: // Rotate 90° CCW and flip horizontal
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, height);
      ctx.scale(1, -1);
      break;
    case 8: // Rotate 90° CCW
      ctx.translate(0, height);
      ctx.rotate(-0.5 * Math.PI);
      break;
    default:
      // No transformation needed
      break;
  }
}
/**
 * Compresses an image file to reduce file size and dimensions
 * EXIF orientation is read and applied during compression to "bake" the correct orientation
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

  // Read EXIF orientation first
  const orientation = await getImageOrientation(file);
  console.log('[compressImage] EXIF orientation detected:', orientation);

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
        // Get original dimensions
        let { width, height } = img;
        
        // For orientations 5-8, dimensions are swapped after rotation
        const needsDimensionSwap = orientation >= 5 && orientation <= 8;
        
        // Calculate final dimensions after rotation
        let finalWidth = needsDimensionSwap ? height : width;
        let finalHeight = needsDimensionSwap ? width : height;
        const aspectRatio = finalWidth / finalHeight;

        // Apply max constraints
        if (finalWidth > maxWidth) {
          finalWidth = maxWidth;
          finalHeight = finalWidth / aspectRatio;
        }

        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight * aspectRatio;
        }

        // Round to avoid sub-pixel issues
        finalWidth = Math.round(finalWidth);
        finalHeight = Math.round(finalHeight);

        console.log('[compressImage] Original:', width, 'x', height, '| Orientation:', orientation, '| Final:', finalWidth, 'x', finalHeight);

        // Set canvas to final dimensions (AFTER rotation)
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Apply orientation transformation using canvas dimensions
        applyOrientation(ctx, orientation, canvas.width, canvas.height);

        // Draw using pre-swap dimensions so rotation works correctly
        const drawWidth = needsDimensionSwap ? canvas.height : canvas.width;
        const drawHeight = needsDimensionSwap ? canvas.width : canvas.height;
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

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
        console.error('[compressImage] Error:', error);
        reject(error);
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