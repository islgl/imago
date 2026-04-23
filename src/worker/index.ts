import { Hono } from 'hono';
import type { Env } from './types';
import images from './router/images';
import albums from './router/albums';
import publicRoute from './router/public';
import auth from './router/auth';
import { readCookie, SESSION_COOKIE, verifySession } from './lib/auth';

const app = new Hono<{ Bindings: Env }>();

// Auth routes (no auth required)
app.route('/api/auth', auth);

// Public image proxy (no auth required; /p/:key handler checks is_public itself)
app.route('/p', publicRoute);

// Guard all other /api/* routes
app.use('/api/*', async (c, next) => {
  const token = readCookie(c.req.raw, SESSION_COOKIE);
  if (!token || !(await verifySession(token, c.env.IMAGO_PASSWORD ?? ''))) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  return next();
});

// Authenticated API routes
app.get('/api/me/storage', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(size_bytes), 0) AS used, COUNT(*) AS count FROM images WHERE deleted_at IS NULL',
  ).first<{ used: number; count: number }>();
  return c.json({ usedBytes: row?.used ?? 0, imageCount: row?.count ?? 0 });
});

app.route('/api/images', images);
app.route('/api/albums', albums);

export default app;
