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
        padding: '8px 12px',
        borderRadius: 7,
        cursor: 'pointer',
        background: selected ? 'var(--accent-bg)' : hov ? 'var(--hover-bg)' : 'transparent',
        transition: 'background .08s',
        outline: selected ? '1px solid rgba(35,131,226,.25)' : 'none',
      }}
    >
      <div
        style={{
          width: 42,
          height: 32,
          borderRadius: 5,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#eeede9',
          position: 'relative',
        }}
      >
        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(img.id);
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: hov || selected ? 'rgba(0,0,0,.35)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all .12s',
          }}
        >
          {(hov || selected) && (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: selected ? 'var(--accent)' : 'rgba(255,255,255,.88)',
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {img.filename}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {dim}
          {formatBytes(img.sizeBytes)}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0, width: 80, textAlign: 'right' }}>
        {formatDate(img.createdAt)}
      </div>

      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
        {img.isPublic && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-2)',
              background: 'var(--hover-bg)',
              padding: '2px 7px',
              borderRadius: 100,
            }}
          >
            Public
          </span>
        )}
      </div>

      <button
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await onCopy(img);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* noop */
          }
        }}
        style={{
          padding: '4px 10px',
          fontSize: 11.5,
          fontWeight: 500,
          fontFamily: 'inherit',
          background: copied ? 'rgba(15,123,108,.12)' : hov ? 'var(--active-bg)' : 'transparent',
          color: copied ? 'var(--success)' : 'var(--text-2)',
          border: '1px solid ' + (hov ? 'var(--border-mid)' : 'transparent'),
          borderRadius: 5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          transition: 'all .12s',
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
