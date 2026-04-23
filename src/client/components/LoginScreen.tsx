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
          background: 'var(--bg)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 32 }}>
          <ImagoLogoLg />
          <div>
            <div
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-1)',
                lineHeight: 1,
              }}
            >
              imago
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>sign in to continue</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-2)',
              marginBottom: 7,
              letterSpacing: '-0.005em',
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
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: 14,
              fontFamily: 'inherit',
              color: 'var(--text-1)',
              background: 'var(--sidebar-bg)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--border-mid)'}`,
              borderRadius: 'var(--r)',
              outline: 'none',
              transition: 'border-color 0.12s, box-shadow 0.12s',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
              (e.currentTarget as HTMLInputElement).style.boxShadow = error
                ? '0 0 0 3px oklch(0.52 0.20 25 / 10%)'
                : '0 0 0 3px oklch(0.56 0.22 263 / 10%)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = error ? 'var(--danger)' : 'var(--border-mid)';
              (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 7 }}>{error}</div>
          )}
        </div>

        <Btn
          variant="solid"
          size="lg"
          disabled={loading || !password}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Btn>
      </form>
    </div>
  );
}

function ImagoLogoLg() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px oklch(0 0 0 / 26%))' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ls-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#323232" />
          <stop offset="1" stopColor="#1c1c1c" />
        </linearGradient>
        <radialGradient id="ls-glow" cx="0.5" cy="0.5" r="0.42">
          <stop offset="0" stopColor="#e8e4da" stopOpacity="1" />
          <stop offset="0.55" stopColor="#c4b89a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#998060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="44" height="44" rx="11" fill="url(#ls-shell)" />
      <path
        d="M 11 22 Q 22 11 33 22 Q 22 33 11 22 Z"
        stroke="#e0dcd2"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="22" cy="22" r="5" fill="url(#ls-glow)" />
      <circle cx="22" cy="22" r="1.5" fill="#e8e4da" opacity="0.95" />
    </svg>
  );
}
