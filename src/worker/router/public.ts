import { Hono } from 'hono';
import type { Env } from '../types';
import { verifySignature } from '../lib/sign';

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
