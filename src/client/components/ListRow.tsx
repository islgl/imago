import { useState } from 'react';
import { Icon } from './Icon';
import type { Image } from '../types';
import { formatBytes, formatDate } from '../lib/utils';

export function ListRow({
  img,
  selected,
  onSelect,
  onOpen,
  onCopy,
  onContextMenu,
}: {
  img: Image;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (img: Image) => void;
  onCopy: (img: Image) => Promise<void>;
  onContextMenu: (img: Image, x: number, y: number) => void;
}) {
  const [hov, setHov] = useState(false);
  const [copied, setCopied] = useState(false);

  const dim = img.width && img.height ? `${img.width}×${img.height} · ` : '';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(img)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(img, e.clientX, e.clientY);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '7px 10px',
        borderRadius: 'var(--r)',
        cursor: 'pointer',
        background: selected ? 'var(--accent-bg)' : hov ? 'var(--hover-bg)' : 'transparent',
        transition: 'background 0.08s',
        outline: selected ? '1px solid oklch(0.56 0.22 263 / 22%)' : 'none',
        outlineOffset: -1,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 42,
          height: 32,
          borderRadius: 'var(--r-sm)',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'oklch(0.93 0 0)',
          position: 'relative',
        }}
      >
        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(img.id); }}
          style={{
            position: 'absolute',
            inset: 0,
            background: hov || selected ? 'oklch(0 0 0 / 34%)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.12s',
            cursor: 'pointer',
          }}
        >
          {(hov || selected) && (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: selected ? 'var(--accent)' : 'oklch(1 0 0 / 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected && <Icon name="check" size={9} color="#fff" />}
            </div>
          )}
        </div>
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {img.filename}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {dim}
          {formatBytes(img.sizeBytes)}
        </div>
      </div>

      {/* Date */}
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', flexShrink: 0, width: 80, textAlign: 'right' }}>
        {formatDate(img.createdAt)}
      </div>

      {/* Public badge */}
      <div style={{ display: 'flex', gap: 5, flexShrink: 0, width: 56, justifyContent: 'center' }}>
        {img.isPublic && (
          <span
            style={{
              fontSize: 10.5,
              color: 'var(--text-2)',
              background: 'var(--active-bg)',
              padding: '2px 7px',
              borderRadius: 100,
              letterSpacing: '0.01em',
            }}
          >
            Public
          </span>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await onCopy(img);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch { /* noop */ }
        }}
        style={{
          padding: '4px 10px',
          fontSize: 11.5,
          fontWeight: 500,
          fontFamily: 'inherit',
          background: copied ? 'oklch(0.52 0.13 160 / 12%)' : hov ? 'var(--active-bg)' : 'transparent',
          color: copied ? 'var(--success)' : 'var(--text-2)',
          border: '1px solid ' + (hov ? 'var(--border)' : 'transparent'),
          borderRadius: 'var(--r-sm)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          transition: 'all 0.12s',
          flexShrink: 0,
          opacity: hov || copied ? 1 : 0,
        }}
      >
        <Icon name={copied ? 'check' : 'copy'} size={12} />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
