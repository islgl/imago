import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { Image } from '../types';
import { imageFilenameError } from '../lib/utils';

export function RenameModal({
  img,
  onClose,
  onRename,
}: {
  img: Image;
  onClose: () => void;
  onRename: (img: Image, filename: string) => Promise<Image>;
}) {
  const [filename, setFilename] = useState(img.filename);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilename(img.filename);
    setError(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [img]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const save = async () => {
    const next = filename.trim();
    const validationError = imageFilenameError(next);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (next === img.filename) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onRename(img, next);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 260,
        background: 'oklch(0 0 0 / 40%)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-title"
        style={{
          width: 440,
          maxWidth: '100%',
          background: 'var(--bg)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          animation: 'fadeIn 0.18s ease',
        }}
      >
        <div
          style={{
            padding: '18px 20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div id="rename-title" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>
              Rename image
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'none',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              color: 'var(--text-3)',
              padding: 6,
              borderRadius: 'var(--r)',
              display: 'flex',
              transition: 'color 0.1s, background 0.1s',
              opacity: saving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (saving) return;
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 10,
              borderRadius: 'var(--r-md)',
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 58,
                height: 44,
                borderRadius: 'var(--r-sm)',
                overflow: 'hidden',
                background: 'oklch(0.93 0 0)',
                flexShrink: 0,
              }}
            >
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {img.filename}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
                Current name
              </div>
            </div>
          </div>

          <label
            htmlFor="rename-filename"
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-3)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Filename
          </label>
          <input
            id="rename-filename"
            ref={inputRef}
            value={filename}
            disabled={saving}
            onChange={(e) => {
              setFilename(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void save();
            }}
            style={{
              width: '100%',
              padding: '9px 11px',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r)',
              background: 'var(--bg)',
              color: 'var(--text-1)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              outline: 'none',
              letterSpacing: '-0.01em',
              opacity: saving ? 0.65 : 1,
            }}
          />
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, color: 'var(--danger)' }}>
              <Icon name="warning" size={13} />
              <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{error}</div>
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="solid" icon="edit" onClick={() => void save()} disabled={saving}>
              {saving ? 'Renaming...' : 'Rename'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
