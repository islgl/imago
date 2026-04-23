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
  const totalBytes = 10 * 1024 * 1024 * 1024; // 10 GB free plan reference
  const used = storage?.usedBytes ?? 0;
  const usedPct = Math.min((used / totalBytes) * 100, 100);

  const sections: { id: NavView; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'All', icon: 'image', count: allCount },
    { id: 'starred', label: 'Starred', icon: 'star', count: starredCount },
    { id: 'recent', label: 'Recent', icon: 'sparkle', count: recentCount },
    { id: 'trash', label: 'Trash', icon: 'trash', count: trashCount },
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
      {/* Brand · B · Aperture logo */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          style={{ flexShrink: 0, display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.22))' }}
          aria-label="imago"
        >
          <defs>
            <linearGradient id="sb-imago-shell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2d2d2d" />
              <stop offset="1" stopColor="#1a1a1a" />
            </linearGradient>
          </defs>
          <rect width="30" height="30" rx="7" fill="url(#sb-imago-shell)" />
          <path
            d="M 6 15 Q 15 6 24 15 Q 15 24 6 15 Z"
            stroke="#f5e6c3"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="15" cy="15" r="2" fill="#f5e6c3" />
        </svg>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '-.015em',
          }}
        >
          imago
        </div>
        <button
          onClick={() => onNav('settings')}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-3)',
            padding: 5,
            borderRadius: 5,
            display: 'flex',
          }}
          title="Settings"
        >
          <Icon name="settings" size={14} />
        </button>
      </div>

      {/* Upload CTA */}
      <div style={{ padding: '2px 12px 8px' }}>
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
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'opacity .12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Icon name="upload" size={14} color="#fff" />
          Upload
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 10px 6px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(255,255,255,.7)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '6px 10px',
            cursor: 'text',
          }}
        >
          <Icon name="search" size={13} color="var(--text-3)" />
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12,
              color: 'var(--text-1)',
              width: '100%',
            }}
          />
        </label>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '2px 12px 6px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
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
            justifyContent: 'space-between',
            padding: '6px 8px 2px',
          }}
        >
          <SectionLabel style={{ margin: 0 }}>Albums</SectionLabel>
          <button
            onClick={onCreateAlbum}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              padding: 3,
              borderRadius: 4,
              display: 'flex',
            }}
            title="New album"
          >
            <Icon name="plus" size={12} />
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

      {/* Storage */}
      <div style={{ padding: '12px 16px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>Storage</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {formatBytes(used)} / 10 GB
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(55,53,47,.12)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${usedPct}%`,
              height: '100%',
              background: 'var(--text-1)',
              borderRadius: 2,
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
        letterSpacing: '.06em',
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
        borderRadius: 5,
        cursor: 'pointer',
        background: active ? 'var(--active-bg)' : hovered ? 'var(--hover-bg)' : 'transparent',
        border: 'none',
        textAlign: 'left',
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        transition: 'background .08s',
      }}
    >
      <Icon name={icon} size={14} />
      <span style={{ flex: 1 }}>{children}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{count}</span>}
    </button>
  );
}
