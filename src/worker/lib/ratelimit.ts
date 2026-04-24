export async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
  limitPerMinute: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const window = Math.floor(Date.now() / 60_000);
  const key = `rl:${ip}:${window}`;

  const current = Number((await kv.get(key)) ?? '0');
  if (current >= limitPerMinute) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(key, String(current + 1), { expirationTtl: 120 });
  return { allowed: true, remaining: limitPerMinute - current - 1 };
}

export function isRefererAllowed(referer: string | null, allowlist: string): boolean {
  if (!allowlist) return true;
  if (!referer) return true;

  const allowed = allowlist.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  let host: string;
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return false;
  }

  return allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
}
