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
    } catch {
      /* noop */
    }
  };

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
        borderRadius: 8,
        overflow: 'hidden',
        background: '#eeede9',
        cursor: 'pointer',
        outline: selected ? '2px solid var(--accent)' : '2px solid transparent',
        outlineOffset: -2,
        transform: hov && !selected ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'transform .15s, box-shadow .15s, outline .1s',
        aspectRatio: '4/3',
      }}
    >
      <img
        src={img.url}
        alt={img.filename}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(0,0,0,.4) 0%, transparent 35%, transparent 55%, rgba(0,0,0,.55) 100%)',
          opacity: hov || selected ? 1 : 0,
          transition: 'opacity .15s',
        }}
      />

      <div style={{ position: 'absolute', top: 8, left: 8, opacity: hov || selected ? 1 : 0, transition: 'opacity .15s' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(img.id);
          }}
          style={{
            width: 19,
            height: 19,
            borderRadius: 5,
            cursor: 'pointer',
            background: selected ? 'var(--accent)' : 'rgba(255,255,255,.88)',
            border: selected ? 'none' : '1.5px solid rgba(255,255,255,.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all .12s',
          }}
        >
          {selected && <Icon name="check" size={11} color="#fff" />}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
        {img.isStarred && (
          <div
            style={{
              background: 'rgba(255,255,255,.15)',
              backdropFilter: 'blur(6px)',
              borderRadius: 4,
              padding: '2px 5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="star" size={10} color="#f5c542" />
          </div>
        )}
        {img.isPublic && (
          <div
            style={{
              background: 'rgba(255,255,255,.15)',
              backdropFilter: 'blur(6px)',
              borderRadius: 4,
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Icon name="globe" size={9} color="rgba(255,255,255,.9)" />
            <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.9)', fontWeight: 500 }}>Public</span>
          </div>
        )}
      </div>

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
          opacity: hov || selected ? 1 : 0,
          transition: 'opacity .15s',
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
              maxWidth: 120,
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
            background: copied ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.18)',
            backdropFilter: 'blur(8px)',
            color: copied ? 'var(--success)' : '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'all .15s',
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
