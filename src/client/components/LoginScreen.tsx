import { useState, useRef, useEffect } from 'react';
import { Btn } from './Btn';

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error === 'invalid password' ? 'Incorrect password' : data.error ?? 'Login failed');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sidebar-bg)',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 360,
          padding: '36px 32px 28px',
          background: '#fff',
          borderRadius: 12,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          animation: 'fadeIn .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            style={{ flexShrink: 0, display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.22))' }}
            aria-label="imago"
          >
            <defs>
              <linearGradient id="ls-imago-shell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2d2d2d" />
                <stop offset="1" stopColor="#1a1a1a" />
              </linearGradient>
              <radialGradient id="ls-imago-glow" cx="0.5" cy="0.5" r="0.42">
                <stop offset="0" stopColor="#f5e6c3" stopOpacity="1" />
                <stop offset="0.55" stopColor="#d7b27a" stopOpacity="0.5" />
                <stop offset="1" stopColor="#a07944" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#ls-imago-shell)" />
            <path
              d="M 9 20 Q 20 9 31 20 Q 20 31 9 20 Z"
              stroke="#e8e6e2"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="20" cy="20" r="4" fill="url(#ls-imago-glow)" />
            <circle cx="20" cy="20" r="1.2" fill="#f5e6c3" />
          </svg>
          <div>
            <div
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: '-.015em',
              }}
            >
              imago
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>sign in to continue</div>
          </div>
        </div>

        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-2)',
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{
            width: '100%',
            padding: '9px 12px',
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'var(--text-1)',
            background: 'var(--sidebar-bg)',
            border: '1px solid ' + (error ? 'var(--danger)' : 'var(--border-mid)'),
            borderRadius: 'var(--r)',
            outline: 'none',
            transition: 'border-color .12s',
          }}
        />

        {error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{error}</div>
        )}

        <div style={{ marginTop: 20 }}>
          <Btn variant="solid" size="lg" disabled={loading || !password} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Btn>
        </div>
      </form>
    </div>
  );
}
