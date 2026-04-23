import { Hono } from 'hono';
import type { Env, AlbumRow } from '../types';
import { albumId } from '../lib/ids';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT a.id, a.name, a.created_at,
            (SELECT COUNT(*) FROM images i WHERE i.album_id = a.id AND i.deleted_at IS NULL) AS image_count
     FROM albums a
     ORDER BY a.created_at DESC`,
  ).all<AlbumRow & { image_count: number }>();
  return c.json({
    items: results.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.created_at,
      imageCount: r.image_count,
    })),
  });
});

app.post('/', async (c) => {
  const body = await c.req.json<{ name: string }>();
  if (!body.name || body.name.trim().length === 0) return c.json({ error: 'name required' }, 400);
  const id = albumId();
  const now = Date.now();
  await c.env.DB.prepare('INSERT INTO albums (id, name, created_at) VALUES (?, ?, ?)')
    .bind(id, body.name.trim(), now)
    .run();
  return c.json({ id, name: body.name.trim(), createdAt: now, imageCount: 0 }, 201);
});

app.patch('/:id', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  if (!body.name) return c.json({ error: 'name required' }, 400);
  await c.env.DB.prepare('UPDATE albums SET name = ? WHERE id = ?')
    .bind(body.name.trim(), c.req.param('id'))
    .run();
  const row = await c.env.DB.prepare('SELECT * FROM albums WHERE id = ?')
    .bind(c.req.param('id'))
    .first<AlbumRow>();
  if (!row) return c.json({ error: 'not found' }, 404);
  return c.json({ id: row.id, name: row.name, createdAt: row.created_at });
});

app.delete('/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM albums WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

export default app;
