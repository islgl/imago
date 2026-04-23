import { Hono } from 'hono';
import type { Env, ImageRow } from '../types';
import { toImageDTO } from '../types';
import { imageId } from '../lib/ids';
import { extractDimensions, extensionFromMime } from '../lib/image-meta';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(png|jpeg|webp|gif|svg\+xml|avif)$/;

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const view = c.req.query('view') ?? 'all';
  const album = c.req.query('album');
  const sort = c.req.query('sort') ?? 'date';
  const q = c.req.query('q');

  const where: string[] = [];
  const params: unknown[] = [];

  if (view === 'trash') {
    where.push('deleted_at IS NOT NULL');
  } else {
    where.push('deleted_at IS NULL');
    if (view === 'starred') where.push('is_starred = 1');
    if (view === 'recent') where.push('created_at >= ?'), params.push(Date.now() - 7 * 24 * 3600 * 1000);
    if (album) where.push('album_id = ?'), params.push(album);
  }
  if (q) {
    where.push('filename LIKE ?');
    params.push(`%${q}%`);
  }

  const orderBy =
    sort === 'name' ? 'filename ASC' : sort === 'size' ? 'size_bytes DESC' : 'created_at DESC';
  const sql = `SELECT * FROM images WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT 500`;
  const { results } = await c.env.DB.prepare(sql).bind(...params).all<ImageRow>();

  const origin = new URL(c.req.url).origin;
  return c.json({ items: results.map((r) => toImageDTO(r, origin)) });
});

app.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!(file instanceof File)) return c.json({ error: 'file required' }, 400);
  if (file.size > MAX_SIZE) return c.json({ error: 'file too large (max 20 MB)' }, 413);
  if (!ALLOWED_MIME.test(file.type)) return c.json({ error: `unsupported type: ${file.type}` }, 415);

  const albumIdRaw = body.album_id;
  const albumId = typeof albumIdRaw === 'string' && albumIdRaw.length > 0 ? albumIdRaw : null;
  const isPublic = body.is_public === '1' || body.is_public === 'true' ? 1 : 0;

  const buf = new Uint8Array(await file.arrayBuffer());
  const { width, height } = extractDimensions(buf.slice(0, Math.min(buf.length, 4096)));

  const ext = extensionFromMime(file.type);
  const key = `${crypto.randomUUID()}.${ext}`;

  await c.env.R2.put(key, buf, {
    httpMetadata: { contentType: file.type },
  });

  const id = imageId();
  const now = Date.now();
  await c.env.DB.prepare(
    `INSERT INTO images (id, key, filename, mime_type, size_bytes, width, height, album_id, is_public, is_starred, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  )
    .bind(id, key, file.name, file.type, file.size, width, height, albumId, isPublic, now)
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?').bind(id).first<ImageRow>();
  const origin = new URL(c.req.url).origin;
  return c.json(toImageDTO(row!, origin), 201);
});

app.get('/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
    .bind(c.req.param('id'))
    .first<ImageRow>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const origin = new URL(c.req.url).origin;
  return c.json(toImageDTO(row, origin));
});

app.get('/:id/raw', async (c) => {
  const row = await c.env.DB.prepare('SELECT key, mime_type FROM images WHERE id = ? AND deleted_at IS NULL')
    .bind(c.req.param('id'))
    .first<{ key: string; mime_type: string }>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const obj = await c.env.R2.get(row.key);
  if (!obj) return c.json({ error: 'not found in storage' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime_type,
      'Cache-Control': 'private, max-age=3600',
    },
  });
});

app.patch('/:id', async (c) => {
  const body = await c.req.json<{
    is_starred?: boolean;
    is_public?: boolean;
    album_id?: string | null;
    filename?: string;
  }>();
  const fields: string[] = [];
  const params: unknown[] = [];
  if (body.is_starred !== undefined) fields.push('is_starred = ?'), params.push(body.is_starred ? 1 : 0);
  if (body.is_public !== undefined) fields.push('is_public = ?'), params.push(body.is_public ? 1 : 0);
  if (body.album_id !== undefined) fields.push('album_id = ?'), params.push(body.album_id);
  if (body.filename !== undefined) fields.push('filename = ?'), params.push(body.filename);
  if (fields.length === 0) return c.json({ error: 'no fields to update' }, 400);
  params.push(c.req.param('id'));

  await c.env.DB.prepare(`UPDATE images SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();

  const row = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
    .bind(c.req.param('id'))
    .first<ImageRow>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const origin = new URL(c.req.url).origin;
  return c.json(toImageDTO(row, origin));
});

app.delete('/:id', async (c) => {
  await c.env.DB.prepare('UPDATE images SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL')
    .bind(Date.now(), c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

app.post('/:id/restore', async (c) => {
  await c.env.DB.prepare('UPDATE images SET deleted_at = NULL WHERE id = ?')
    .bind(c.req.param('id'))
    .run();
  const row = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
    .bind(c.req.param('id'))
    .first<ImageRow>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const origin = new URL(c.req.url).origin;
  return c.json(toImageDTO(row, origin));
});

app.delete('/:id/permanent', async (c) => {
  const row = await c.env.DB.prepare('SELECT key FROM images WHERE id = ?')
    .bind(c.req.param('id'))
    .first<{ key: string }>();
  if (!row) return c.json({ error: 'not found' }, 404);
  await c.env.R2.delete(row.key);
  await c.env.DB.prepare('DELETE FROM images WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

export default app;
