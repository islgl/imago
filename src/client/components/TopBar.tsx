import { useState } from 'react';
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
  const sorts: { id: SortBy; label: string }[] = [
    { id: 'date', label: 'Upload date' },
    { id: 'name', label: 'Filename' },
    { id: 'size', label: 'File size' },
  ];
  const viewToggles: { icon: string; mode: ViewMode }[] = [
    { icon: 'grid2', mode: 'grid' },
    { icon: 'rows', mode: 'list' },
  ];

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ height: 50, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {count} {count === 1 ? 'image' : 'images'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            padding: 3,
            gap: 2,
            background: 'var(--sidebar-bg)',
            borderRadius: 7,
            border: '1px solid var(--border)',
          }}
        >
          {viewToggles.map(({ icon, mode }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '4px 7px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                background: viewMode === mode ? '#fff' : 'transparent',
                color: viewMode === mode ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                transition: 'all .1s',
              }}
            >
              <Icon name={icon} size={14} />
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: 12,
              color: 'var(--text-2)',
              background: sortOpen ? 'var(--hover-bg)' : 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              cursor: 'pointer',
              transition: 'background .1s',
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
                top: 'calc(100% + 4px)',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-md)',
                padding: 4,
                minWidth: 120,
                zIndex: 50,
                animation: 'fadeIn .1s ease',
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
                    padding: '7px 12px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 5,
                    color: 'var(--text-1)',
                    fontWeight: sortBy === s.id ? 500 : 400,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
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
            height: 40,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--accent-bg)',
            borderTop: '1px solid rgba(35,131,226,.12)',
            animation: 'fadeIn .15s ease',
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--accent)' }}>
            {selected.length} selected
          </span>
          <span
            onClick={onClearSel}
            style={{ fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', marginLeft: 2 }}
          >
            Cancel
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Btn variant="outline" size="sm" icon="link2" onClick={onBulkCopy}>
              Copy link
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
