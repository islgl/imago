import { Hono } from 'hono';
import type { Env } from '../types';
import {
  clearSessionCookieHeader,
  constantTimeEqual,
  createSession,
  readCookie,
  SESSION_COOKIE,
  sessionCookieHeader,
  verifySession,
} from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

app.post('/login', async (c) => {
  const body = await c.req
    .json<{ password?: string }>()
    .catch(() => ({}) as { password?: string });
  const password = body.password ?? '';
  const expected = c.env.IMAGO_PASSWORD ?? '';
  if (!expected) return c.json({ error: 'server not configured' }, 500);
  if (!password || !constantTimeEqual(password, expected)) {
    // Add a tiny delay to slow brute force
    await new Promise((r) => setTimeout(r, 250));
    return c.json({ error: 'invalid password' }, 401);
  }
  const token = await createSession(expected);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookieHeader(token),
    },
  });
});

app.post('/logout', async (c) => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookieHeader(),
    },
  });
});

app.get('/me', async (c) => {
  const token = readCookie(c.req.raw, SESSION_COOKIE);
  const authed = token ? await verifySession(token, c.env.IMAGO_PASSWORD ?? '') : false;
  return c.json({ authed });
});

export default app;
