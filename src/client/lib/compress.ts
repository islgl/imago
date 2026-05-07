export interface CompressionOptions {
  enabled: boolean;
  quality: number;
  maxDimension: number;
}

export interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function compressImageFile(file: File, opts: CompressionOptions): Promise<CompressionResult> {
  if (!opts.enabled || !COMPRESSIBLE_TYPES.has(file.type)) {
    return unchanged(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, opts.maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: file.type !== 'image/jpeg' });
    if (!ctx) {
      bitmap.close();
      return unchanged(file);
    }

    if (file.type === 'image/jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputType = preferredOutputType(file.type);
    const blob = await canvasToBlob(canvas, outputType, opts.quality);
    if (!blob || blob.size >= file.size) return unchanged(file);
    const actualType = blob.type || outputType;

    return {
      file: new File([blob], outputFilename(file.name, actualType), {
        type: actualType,
        lastModified: Date.now(),
      }),
      compressed: true,
      originalSize: file.size,
      finalSize: blob.size,
    };
  } catch {
    return unchanged(file);
  }
}

function preferredOutputType(inputType: string): string {
  if (inputType === 'image/jpeg') return 'image/jpeg';
  return 'image/webp';
}

function outputFilename(name: string, mimeType: string): string {
  const ext = extensionForMime(mimeType);
  if (!ext) return name;
  const base = name.replace(/\.[^.]+$/, '');
  return `${base || 'image'}.${ext}`;
}

function extensionForMime(mimeType: string): string | null {
  if (mimeType === 'image/jpeg') return null;
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/png') return 'png';
  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function unchanged(file: File): CompressionResult {
  return {
    file,
    compressed: false,
    originalSize: file.size,
    finalSize: file.size,
  };
}
