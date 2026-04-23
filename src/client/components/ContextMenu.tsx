import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import type { Image } from '../types';

export function ContextMenu({
  img,
  x,
  y,
  onClose,
  onOpen,
  onCopy,
  onDownload,
  onToggleStar,
  onTogglePublic,
  onDelete,
}: {
  img: Image;
  x: number;
  y: number;
  onClose: () => void;
  onOpen: (img: Image) => void;
  onCopy: (img: Image) => Promise<void>;
  onDownload: (img: Image) => void;
  onToggleStar: (img: Image) => void;
  onTogglePublic: (img: Image) => void;
  onDelete: (img: Image) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [onClose]);

  const menuWidth = 210;
  const menuHeight = 290;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const left = Math.max(8, Math.min(x, vw - menuWidth - 8));
  const top  = Math.max(8, Math.min(y, vh - menuHeight - 8));

  type Item =
    | { kind: 'item'; label: string; icon: string; onClick: () => void | Promise<void>; danger?: boolean }
    | { kind: 'divider' };

  const items: Item[] = [
    { kind: 'item', label: 'Open details',                                     icon: 'image',    onClick: () => { onOpen(img); onClose(); } },
    { kind: 'divider' },
    { kind: 'item', label: 'Copy link',                                         icon: 'link2',    onClick: async () => { await onCopy(img); onClose(); } },
    { kind: 'item', label: 'Download',                                          icon: 'download', onClick: () => { onDownload(img); onClose(); } },
    { kind: 'divider' },
    { kind: 'item', label: img.isStarred ? 'Unstar' : 'Star',                  icon: 'star',     onClick: () => { onToggleStar(img); onClose(); } },
    { kind: 'item', label: img.isPublic  ? 'Make private' : 'Make public',     icon: img.isPublic ? 'lock' : 'globe', onClick: () => { onTogglePublic(img); onClose(); } },
    { kind: 'divider' },
    { kind: 'item', label: 'Delete',                                            icon: 'trash',    onClick: () => { onDelete(img); onClose(); }, danger: true },
  ];

  return (
    <div
      ref={ref}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        left,
        top,
        minWidth: menuWidth,
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: 4,
        zIndex: 300,
        animation: 'fadeIn 0.08s ease',
      }}
    >
      {items.map((item, i) =>
        item.kind === 'divider' ? (
          <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        ) : (
          <button
            key={i}
            onClick={() => { void item.onClick(); }}
            style={{
              width: '100%',
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--r-sm)',
              fontSize: 13,
              color: item.danger ? 'var(--danger)' : 'var(--text-1)',
              textAlign: 'left',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              transition: 'background 0.08s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'oklch(0.52 0.20 25 / 8%)' : 'var(--hover-bg)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
          >
            <Icon name={item.icon} size={14} />
            <span>{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
