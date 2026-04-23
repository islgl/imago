import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/:key', async (c) => {
  const key = c.req.param('key');
  const row = await c.env.DB.prepare(
    'SELECT mime_type FROM images WHERE key = ? AND is_public = 1 AND deleted_at IS NULL',
  )
    .bind(key)
    .first<{ mime_type: string }>();
  if (!row) return c.json({ error: 'not found' }, 404);

  const obj = await c.env.R2.get(key);
  if (!obj) return c.json({ error: 'not found in storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
});

export default app;
