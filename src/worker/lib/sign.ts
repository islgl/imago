const ENC = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', ENC.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function toBase64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function msg(key: string, expires: number): ArrayBuffer {
  return ENC.encode(`${key}:${expires}`).buffer as ArrayBuffer;
}

export async function signUrl(key: string, ttlSeconds: number, secret: string): Promise<{ expires: number; sig: string }> {
  const expires = Date.now() + ttlSeconds * 1000;
  const ck = await hmacKey(secret);
  const buf = await crypto.subtle.sign('HMAC', ck, msg(key, expires));
  return { expires, sig: toBase64url(buf) };
}

export async function verifySignature(key: string, expires: number, sig: string, secret: string): Promise<boolean> {
  if (Date.now() > expires) return false;
  const ck = await hmacKey(secret);
  const raw = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)).buffer as ArrayBuffer;
  return crypto.subtle.verify('HMAC', ck, raw, msg(key, expires));
}
