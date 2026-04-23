import { useState } from 'react';
import { Icon } from './Icon';
import type { Album, NavView, Storage } from '../types';
import { formatBytes } from '../lib/utils';

export function Sidebar({
  view,
  activeAlbumId,
  albums,
  allCount,
  starredCount,
  recentCount,
  trashCount,
  storage,
  searchQuery,
  onSearch,
  onNav,
  onUpload,
  onCreateAlbum,
}: {
  view: NavView;
  activeAlbumId: string | null;
  albums: Album[];
  allCount: number;
  starredCount: number;
  recentCount: number;
  trashCount: number;
  storage: Storage | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  onNav: (view: NavView, albumId?: string) => void;
  onUpload: () => void;
  onCreateAlbum: () => void;
}) {
  const [hov, setHov] = useState<string | null>(null);
  const totalBytes = 10 * 1024 * 1024 * 1024;
  const used = storage?.usedBytes ?? 0;
  const usedPct = Math.min((used / totalBytes) * 100, 100);

  const sections: { id: NavView; label: string; icon: string; count: number }[] = [
    { id: 'all',     label: 'All images', icon: 'image',   count: allCount },
    { id: 'starred', label: 'Starred',    icon: 'star',    count: starredCount },
    { id: 'recent',  label: 'Recent',     icon: 'sparkle', count: recentCount },
    { id: 'trash',   label: 'Trash',      icon: 'trash',   count: trashCount },
  ];

  const isActive = (id: string) => view === id || activeAlbumId === id;

  return (
    <aside
      style={{
        width: 'var(--sidebar)',
        minWidth: 'var(--sidebar)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '16px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ImagoLogo size={28} />
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--text-1)',
          }}
        >
          imago
        </div>
        <button
          onClick={() => onNav('settings')}
          title="Settings"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-3)',
            padding: 5,
            borderRadius: 'var(--r-sm)',
            display: 'flex',
            transition: 'color 0.12s, background 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)';
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)';
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}
        >
          <Icon name="settings" size={14} />
        </button>
      </div>

      {/* Upload CTA */}
      <div style={{ padding: '0 10px 10px' }}>
        <button
          onClick={onUpload}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '8px 12px',
            background: 'var(--text-1)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.86')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          <Icon name="upload" size={14} />
          Upload
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 10px 8px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '6px 10px',
            cursor: 'text',
            transition: 'border-color 0.12s',
          }}
        >
          <Icon name="search" size={13} color="var(--text-3)" />
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search…"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12.5,
              color: 'var(--text-1)',
              width: '100%',
            }}
          />
        </label>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 12px 6px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 0' }}>
        <SectionLabel>Browse</SectionLabel>
        {sections.map((item) => (
          <NavRow
            key={item.id}
            active={isActive(item.id)}
            hovered={hov === item.id}
            onEnter={() => setHov(item.id)}
            onLeave={() => setHov(null)}
            onClick={() => onNav(item.id)}
            icon={item.icon}
            count={item.count}
          >
            {item.label}
          </NavRow>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '2px 8px 4px',
          }}
        >
          <SectionLabel style={{ margin: 0, flex: 1 }}>Albums</SectionLabel>
          <button
            onClick={onCreateAlbum}
            title="New album"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              padding: '3px 4px',
              borderRadius: 'var(--r-xs)',
              display: 'flex',
              transition: 'color 0.12s, background 0.12s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <Icon name="plus" size={13} />
          </button>
        </div>

        {albums.map((alb) => (
          <NavRow
            key={alb.id}
            active={isActive(alb.id)}
            hovered={hov === alb.id}
            onEnter={() => setHov(alb.id)}
            onLeave={() => setHov(null)}
            onClick={() => onNav('album', alb.id)}
            icon="folder"
            count={alb.imageCount}
          >
            {alb.name}
          </NavRow>
        ))}
      </nav>

      {/* Storage footer */}
      <div
        style={{
          padding: '12px 14px 16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Storage</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {formatBytes(used)} <span style={{ color: 'var(--border-mid)' }}>/</span> 10 GB
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--border-mid)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              width: `${usedPct}%`,
              height: '100%',
              background: usedPct > 85 ? 'var(--danger)' : 'var(--text-1)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text-3)' }}>
          {storage?.imageCount ?? 0} {storage?.imageCount === 1 ? 'image' : 'images'}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: 'var(--text-3)',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        padding: '6px 8px 3px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function NavRow({
  children,
  active,
  hovered,
  onEnter,
  onLeave,
  onClick,
  icon,
  count,
}: {
  children: React.ReactNode;
  active: boolean;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
  icon: string;
  count?: number;
}) {
  return (
    <button
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        background: active ? 'var(--active-bg)' : hovered ? 'var(--hover-bg)' : 'transparent',
        border: 'none',
        textAlign: 'left',
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        letterSpacing: '-0.005em',
        transition: 'background 0.08s',
      }}
    >
      <Icon name={icon} size={14} />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      )}
    </button>
  );
}

function ImagoLogo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      style={{ flexShrink: 0, display: 'block', filter: 'drop-shadow(0 2px 4px oklch(0 0 0 / 24%))' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sb-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#323232" />
          <stop offset="1" stopColor="#1c1c1c" />
        </linearGradient>
      </defs>
      <rect width="30" height="30" rx="7" fill="url(#sb-shell)" />
      <path
        d="M 6.5 15 Q 15 6.5 23.5 15 Q 15 23.5 6.5 15 Z"
        stroke="#e8e4da"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="15" cy="15" r="2" fill="#e8e4da" opacity="0.95" />
    </svg>
  );
}
