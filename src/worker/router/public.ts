import { Hono } from 'hono';
import type { Env } from '../types';
import { verifySignature } from '../lib/sign';
import { checkRateLimit, isRefererAllowed } from '../lib/ratelimit';

const app = new Hono<{ Bindings: Env }>();

app.get('/:key', async (c) => {
  const key = c.req.param('key');
  const expiresRaw = c.req.query('expires');
  const sig = c.req.query('sig');

  const row = await c.env.DB.prepare(
    'SELECT mime_type, is_public FROM images WHERE key = ? AND deleted_at IS NULL',
  )
    .bind(key)
    .first<{ mime_type: string; is_public: number }>();
  if (!row) return c.json({ error: 'not found' }, 404);

  if (!row.is_public) {
    if (!expiresRaw || !sig) return c.json({ error: 'forbidden' }, 403);
    const expires = Number(expiresRaw);
    const valid = await verifySignature(key, expires, sig, c.env.IMAGO_PASSWORD ?? '');
    if (!valid) return c.json({ error: 'invalid or expired signature' }, 403);
  } else {
    // Referer check — only enforce when ALLOWED_REFERERS is configured
    const allowlist = c.env.ALLOWED_REFERERS ?? '';
    const referer = c.req.header('Referer') ?? null;
    if (!isRefererAllowed(referer, allowlist)) {
      return c.json({ error: 'forbidden' }, 403);
    }

    // IP rate limiting — only enforce when RL_KV is bound and RATE_LIMIT_RPM > 0
    const rpm = Number(c.env.RATE_LIMIT_RPM ?? '0');
    if (rpm > 0 && c.env.RL_KV) {
      const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
      const { allowed, remaining } = await checkRateLimit(c.env.RL_KV, ip, rpm);
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'rate limit exceeded' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(rpm),
            'X-RateLimit-Remaining': '0',
          },
        });
      }
      c.header('X-RateLimit-Limit', String(rpm));
      c.header('X-RateLimit-Remaining', String(remaining));
    }
  }

  const obj = await c.env.R2.get(key);
  if (!obj) return c.json({ error: 'not found in storage' }, 404);

  const isPublic = row.is_public === 1;
  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime_type,
      'Cache-Control': isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
    },
  });
});

export default app;
