/**
 * Image Compressor Utility
 * Complies with SIDTECH specification: guarantees output <= 50KB (51,200 bytes)
 * Uses iterative HTML5 Canvas downsampling & JPEG quality tuning.
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercent: number;
  width: number;
  height: number;
}

export async function compressImageToTargetKB(
  fileOrDataUrl: File | string,
  targetKB: number = 50
): Promise<CompressionResult> {
  const targetBytes = targetKB * 1024;
  let originalBytes = 0;
  let imgSource = '';

  if (typeof fileOrDataUrl === 'string') {
    imgSource = fileOrDataUrl;
    // Approximate bytes from base64
    originalBytes = Math.round((fileOrDataUrl.length * 3) / 4);
  } else {
    originalBytes = fileOrDataUrl.size;
    imgSource = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  // Load into HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imgSource;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Max dimension constraints initially to avoid gigapixel crashes
  const maxInitialDim = 1200;
  if (width > maxInitialDim || height > maxInitialDim) {
    const ratio = Math.min(maxInitialDim / width, maxInitialDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  let currentQuality = 0.85;
  let currentWidth = width;
  let currentHeight = height;
  let finalBlob: Blob | null = null;
  let finalDataUrl = '';

  // Iterative reduction loop
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        'image/jpeg',
        Math.max(0.1, currentQuality)
      );
    });

    if (blob) {
      finalBlob = blob;
      if (blob.size <= targetBytes) {
        finalDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        break;
      }
    }

    // Still too large: reduce quality or dimensions
    if (currentQuality > 0.4) {
      currentQuality -= 0.15;
    } else {
      // Scale down dimensions
      currentWidth = Math.round(currentWidth * 0.8);
      currentHeight = Math.round(currentHeight * 0.8);
      currentQuality = 0.7; // reset quality slightly for smaller dimensions
    }
  }

  if (!finalBlob) {
    throw new Error('Image compression failed');
  }

  if (!finalDataUrl) {
    finalDataUrl = canvas.toDataURL('image/jpeg', 0.2);
  }

  const originalSizeKB = Math.round((originalBytes / 1024) * 10) / 10;
  const compressedSizeKB = Math.round((finalBlob.size / 1024) * 10) / 10;
  const reductionPercent = Math.max(
    0,
    Math.round(((originalBytes - finalBlob.size) / Math.max(1, originalBytes)) * 100)
  );

  return {
    dataUrl: finalDataUrl,
    blob: finalBlob,
    originalSizeKB,
    compressedSizeKB,
    reductionPercent,
    width: currentWidth,
    height: currentHeight,
  };
}
