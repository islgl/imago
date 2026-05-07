import type { Image } from '../types';
import { compressImageFile, type CompressionOptions, type CompressionResult } from './compress';

const DEFAULT_DOWNLOAD_COMPRESSION: CompressionOptions = {
  enabled: true,
  quality: 0.82,
  maxDimension: 2560,
};

export type DownloadResult = CompressionResult;

export async function downloadCompressedImage(
  img: Image,
  opts: CompressionOptions = DEFAULT_DOWNLOAD_COMPRESSION,
): Promise<DownloadResult> {
  const res = await fetch(img.url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  const blob = await res.blob();
  const source = new File([blob], img.filename, {
    type: blob.type || img.mimeType,
    lastModified: Date.now(),
  });
  const result = await compressImageFile(source, opts);
  saveFile(result.file);
  return result;
}

function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
