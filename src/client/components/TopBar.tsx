import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { ViewMode, SortBy } from '../types';

export function TopBar({
  title,
  count,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  selected,
  onClearSel,
  onBulkDelete,
  onBulkCopy,
}: {
  title: string;
  count: number;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  selected: string[];
  onClearSel: () => void;
  onBulkDelete: () => void;
  onBulkCopy: () => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  const sorts: { id: SortBy; label: string }[] = [
    { id: 'date', label: 'Upload date' },
    { id: 'name', label: 'Filename' },
    { id: 'size', label: 'File size' },
  ];
  const viewToggles: { icon: string; mode: ViewMode }[] = [
    { icon: 'grid2', mode: 'grid' },
    { icon: 'rows',  mode: 'list' },
  ];

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {count} {count === 1 ? 'image' : 'images'}
          </div>
        </div>

        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            padding: 3,
            gap: 2,
            background: 'var(--sidebar-bg)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--border)',
          }}
        >
          {viewToggles.map(({ icon, mode }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={mode === 'grid' ? 'Grid view' : 'List view'}
              style={{
                padding: '4px 7px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                background: viewMode === mode ? 'var(--bg)' : 'transparent',
                color: viewMode === mode ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              <Icon name={icon} size={14} />
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative' }} ref={sortRef}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: 12.5,
              color: 'var(--text-2)',
              background: sortOpen ? 'var(--hover-bg)' : 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              cursor: 'pointer',
              transition: 'background 0.1s',
              letterSpacing: '-0.01em',
            }}
          >
            <span>{sorts.find((s) => s.id === sortBy)?.label}</span>
            <Icon name="chevronD" size={12} />
          </button>
          {sortOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 5px)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-md)',
                padding: 4,
                minWidth: 130,
                zIndex: 50,
                animation: 'fadeInDown 0.1s ease',
              }}
            >
              {sorts.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSortBy(s.id);
                    setSortOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text-1)',
                    fontWeight: sortBy === s.id ? 500 : 400,
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--hover-bg)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                >
                  {s.label}
                  {sortBy === s.id && <Icon name="check" size={13} color="var(--accent)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div
          style={{
            height: 42,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--accent-bg)',
            borderTop: '1px solid oklch(0.56 0.22 263 / 14%)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--accent)' }}>
            {selected.length} selected
          </span>
          <button
            onClick={onClearSel}
            style={{
              fontSize: 12,
              color: 'var(--text-3)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '2px 4px',
              borderRadius: 'var(--r-xs)',
              transition: 'color 0.1s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)')}
          >
            Cancel
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
            <Btn variant="outline" size="sm" icon="link2" onClick={onBulkCopy}>
              Copy links
            </Btn>
            <Btn variant="danger" size="sm" icon="trash" onClick={onBulkDelete}>
              Delete
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
