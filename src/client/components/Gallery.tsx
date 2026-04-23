import { ImageCard } from './ImageCard';
import { ListRow } from './ListRow';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { Image, ViewMode } from '../types';

export function Gallery({
  imgs,
  viewMode,
  selected,
  onSelect,
  onOpen,
  onCopy,
  onContextMenu,
  onUpload,
  loading,
}: {
  imgs: Image[];
  viewMode: ViewMode;
  selected: string[];
  onSelect: (id: string) => void;
  onOpen: (img: Image) => void;
  onCopy: (img: Image) => Promise<void>;
  onContextMenu: (img: Image, x: number, y: number) => void;
  onUpload: () => void;
  loading: boolean;
}) {
  if (loading && imgs.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  if (imgs.length === 0) {
    return (
      <EmptyState
        title="No images yet"
        desc="Upload your first image to get started"
        action="Upload"
        onAction={onUpload}
      />
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {imgs.map((img) => (
            <ImageCard
              key={img.id}
              img={img}
              selected={selected.includes(img.id)}
              onSelect={onSelect}
              onOpen={onOpen}
              onCopy={onCopy}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              padding: '0 12px 6px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1, paddingLeft: 54 }}>Filename</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 80, textAlign: 'right' }}>Uploaded</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 80, textAlign: 'center' }}>Status</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 60 }} />
          </div>
          {imgs.map((img) => (
            <ListRow
              key={img.id}
              img={img}
              selected={selected.includes(img.id)}
              onSelect={onSelect}
              onOpen={onOpen}
              onCopy={onCopy}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  desc,
  action,
  onAction,
}: {
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 12,
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'var(--sidebar-bg)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="image" size={22} color="var(--text-3)" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 240 }}>{desc}</div>
      </div>
      {action && onAction && (
        <Btn variant="outline" icon="upload" onClick={onAction}>
          {action}
        </Btn>
      )}
    </div>
  );
}
