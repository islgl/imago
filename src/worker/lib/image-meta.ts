// Extract image dimensions from magic bytes without Canvas/Image API.
// Supports PNG, JPEG, WebP, GIF.
// Returns null fields if format not recognized or header truncated.

export function extractDimensions(bytes: Uint8Array): { width: number | null; height: number | null } {
  if (bytes.length < 10) return { width: null, height: null };

  // PNG: 89 50 4E 47 0D 0A 1A 0A ... IHDR
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    if (bytes.length < 24) return { width: null, height: null };
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }

  // GIF: 47 49 46 38 (GIF8)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  }

  // WebP: RIFF ... WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    // VP8 lossy: VP8_ at offset 12, dimensions at 26/28 (little-endian 14-bit)
    // VP8L lossless: VP8L at offset 12, dimensions in 14-bit at offset 21
    // VP8X extended: dimensions at 24/27 (24-bit little-endian, +1)
    const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (chunk === 'VP8 ' && bytes.length >= 30) {
      return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
    }
    if (chunk === 'VP8L' && bytes.length >= 25) {
      const b0 = bytes[21], b1 = bytes[22], b2 = bytes[23], b3 = bytes[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width: w, height: h };
    }
    if (chunk === 'VP8X' && bytes.length >= 30) {
      const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { width: w, height: h };
    }
    return { width: null, height: null };
  }

  // JPEG: FF D8 ... scan for SOF markers
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length - 9) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      // SOF0, SOF1, SOF2, SOF3, SOF5-7, SOF9-11, SOF13-15
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return { width: dv.getUint16(i + 7), height: dv.getUint16(i + 5) };
      }
      // skip segment: length at i+2 (2 bytes, includes length bytes themselves)
      const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const segLen = dv.getUint16(i + 2);
      i += 2 + segLen;
    }
    return { width: null, height: null };
  }

  return { width: null, height: null };
}

export function extensionFromMime(mime: string): string {
  switch (mime.toLowerCase()) {
    case 'image/png': return 'png';
    case 'image/jpeg': return 'jpg';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    case 'image/svg+xml': return 'svg';
    case 'image/avif': return 'avif';
    default:
      const m = mime.match(/image\/(\w+)/);
      return m ? m[1] : 'bin';
  }
}
