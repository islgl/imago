import { useState } from 'react';
import { Icon } from './Icon';
import type { Image } from '../types';

export function ImageCard({
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onCopy(img);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const showOverlay = hov || selected;

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
        position: 'relative',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        background: 'oklch(0.93 0 0)',
        cursor: 'pointer',
        outline: selected ? '2px solid var(--accent)' : '2px solid transparent',
        outlineOffset: -2,
        transform: hov && !selected ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'transform 0.18s, box-shadow 0.18s, outline 0.1s',
        aspectRatio: '4/3',
      }}
    >
      <img
        src={img.url}
        alt={img.filename}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Overlay gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, oklch(0 0 0 / 42%) 0%, transparent 35%, transparent 52%, oklch(0 0 0 / 58%) 100%)',
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      />

      {/* Select checkbox */}
      <div style={{ position: 'absolute', top: 8, left: 8, opacity: showOverlay ? 1 : 0, transition: 'opacity 0.15s' }}>
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(img.id); }}
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            cursor: 'pointer',
            background: selected ? 'var(--accent)' : 'oklch(1 0 0 / 88%)',
            border: selected ? 'none' : '1.5px solid oklch(1 0 0 / 50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.12s',
          }}
        >
          {selected && <Icon name="check" size={10} color="#fff" />}
        </div>
      </div>

      {/* Badges */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
        {img.isStarred && (
          <div
            style={{
              background: 'oklch(0 0 0 / 30%)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-xs)',
              padding: '2px 5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="star" size={10} color="#f0c040" />
          </div>
        )}
        {img.isPublic && (
          <div
            style={{
              background: 'oklch(0 0 0 / 30%)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-xs)',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Icon name="globe" size={9} color="oklch(1 0 0 / 90%)" />
            <span style={{ fontSize: 9.5, color: 'oklch(1 0 0 / 90%)', fontWeight: 500 }}>Public</span>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '6px 8px 8px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: '#fff',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 110,
              lineHeight: 1.3,
            }}
          >
            {img.filename}
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'inherit',
            background: copied ? 'oklch(1 0 0 / 92%)' : 'oklch(0 0 0 / 30%)',
            backdropFilter: 'blur(10px)',
            color: copied ? 'var(--success)' : '#fff',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={10} color={copied ? 'var(--success)' : '#fff'} />
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
