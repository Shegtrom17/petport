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
 * Reads EXIF orientation tag from JPEG (returns 1 if not found or not JPEG)
 */
function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xffd8) return resolve(1);
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xffe1) {
            offset += 2;
            if (view.getUint32(offset, false) !== 0x45786966) return resolve(1);
            const tiffOffset = offset + 6;
            const little = view.getUint16(tiffOffset, false) === 0x4949;
            const firstIFDOffset = view.getUint32(tiffOffset + 4, little);
            const tagCount = view.getUint16(tiffOffset + firstIFDOffset, little);
            for (let i = 0; i < tagCount; i++) {
              const tagOffset = tiffOffset + firstIFDOffset + 2 + i * 12;
              const tag = view.getUint16(tagOffset, little);
              if (tag === 0x0112) {
                const orientation = view.getUint16(tagOffset + 8, little);
                return resolve(orientation || 1);
              }
            }
            break;
          } else {
            if (offset + 2 > length) break;
            offset += view.getUint16(offset, false);
          }
        }
        resolve(1);
      } catch {
        resolve(1);
      }
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Applies corrected EXIF orientation transform to the canvas
 */
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) {
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
    case 5: // 90° CW + flip horizontal
      ctx.translate(0, width);
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // 90° CW (most iPhone portrait)
      ctx.translate(width, 0);
      ctx.rotate(0.5 * Math.PI);
      break;
    case 7: // 90° CCW + flip horizontal
      ctx.translate(height, 0);
      ctx.rotate(-0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 8: // 90° CCW (most Android portrait)
      ctx.translate(0, height);
      ctx.rotate(-0.5 * Math.PI);
      break;
    default:
      break;
  }
}

/**
 * Try native browser EXIF orientation handling (HEIC/HEIF/JPEG)
 */
async function loadWithNativeOrientation(file: File): Promise<ImageBitmap | null> {
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await (createImageBitmap as any)(file, {
        imageOrientation: "from-image",
      });
      return bmp;
    }
  } catch {
    // Fallback if browser doesn’t support it
  }
  return null;
}

/**
 * Compress an image while applying correct orientation
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500,
  } = options;

  const orientedBitmap = await loadWithNativeOrientation(file);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const finalize = async (
      drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
      srcW: number,
      srcH: number
    ) => {
      let finalW = srcW;
      let finalH = srcH;
      const ratio = finalW / finalH;

      if (finalW > maxWidth) {
        finalW = maxWidth;
        finalH = finalW / ratio;
      }
      if (finalH > maxHeight) {
        finalH = maxHeight;
        finalW = finalH * ratio;
      }

      finalW = Math.round(finalW);
      finalH = Math.round(finalH);

      canvas.width = finalW;
      canvas.height = finalH;

      // ✅ Manual fallback if native orientation wasn’t applied
      if (orientedBitmap == null) {
        const orientation = await getImageOrientation(file);
        if (orientation > 1) {
          applyOrientation(ctx, orientation, canvas.width, canvas.height);
        }
      }

      // Draw the image content
      drawFn(ctx, finalW, finalH);

      // Compress to blob
      const targetSize = maxSizeKB * 1024;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }

                   if (blob.size > targetSize && quality > 0.3) {
            const adjustedQuality = Math.max(
              0.3,
              quality * (targetSize / blob.size)
            );
            canvas.toBlob(
              (blob2) => {
                if (!blob2) {
                  reject(new Error("Compression second pass failed"));
                  return;
                }
                const compressedFile = new File([blob2], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve({
                  file: compressedFile,
                  originalSize: file.size,
                  compressedSize: blob2.size,
                  compressionRatio: file.size / blob2.size,
                });
              },
              "image/jpeg",
              adjustedQuality
            );
          } else {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
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
        "image/jpeg",
        quality
      );
    };

    if (orientedBitmap) {
      finalize(
        (ctx, w, h) => ctx.drawImage(orientedBitmap, 0, 0, w, h),
        (orientedBitmap as any).width,
        (orientedBitmap as any).height
      );
    } else {
      const img = new Image();
      img.onload = () =>
        finalize(
          (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
          img.width,
          img.height
        );
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * Compress multiple images sequentially
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];
  for (const f of files) {
    try {
      const r = await compressImage(f, options);
      results.push(r);
    } catch (err) {
      console.error("Compression failed for", f.name, err);
      results.push({
        file: f,
        originalSize: f.size,
        compressedSize: f.size,
        compressionRatio: 1,
      });
    }
  }
  return results;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

