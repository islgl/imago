import { useState } from 'react';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { Album, Image } from '../types';
import { formatBytes, formatDate, makeEmbeds, extFromFilename } from '../lib/utils';

export function DetailPanel({
  img,
  albums,
  onClose,
  onDelete,
  onToggleStar,
  onTogglePublic,
}: {
  img: Image;
  albums: Album[];
  onClose: () => void;
  onDelete: (img: Image) => void;
  onToggleStar: (img: Image) => void;
  onTogglePublic: (img: Image) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'info' | 'link'>('info');
  const linkUrl = img.publicUrl ?? img.url;

  const copyLink = async () => {
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const albumName = albums.find((a) => a.id === img.albumId)?.name ?? '—';

  const meta = [
    { k: 'Filename',   v: img.filename },
    { k: 'Dimensions', v: img.width && img.height ? `${img.width} × ${img.height}` : '—' },
    { k: 'Size',       v: formatBytes(img.sizeBytes) },
    { k: 'Format',     v: extFromFilename(img.filename) },
    { k: 'Uploaded',   v: formatDate(img.createdAt) },
    { k: 'Album',      v: albumName },
  ];

  return (
    <div
      style={{
        width: 'var(--detail)',
        minWidth: 'var(--detail)',
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        animation: 'slideIn 0.18s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 50,
          padding: '0 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, letterSpacing: '-0.01em' }}>Details</span>
        <IconBtn
          icon="star"
          title={img.isStarred ? 'Unstar' : 'Star'}
          onClick={() => onToggleStar(img)}
          style={{ color: img.isStarred ? '#f0c040' : 'var(--text-3)' }}
        />
        <IconBtn icon="close" title="Close" onClick={onClose} />
      </div>

      {/* Preview */}
      <div style={{ aspectRatio: '4/3', background: 'oklch(0.93 0 0)', overflow: 'hidden', flexShrink: 0 }}>
        <img src={img.url} alt={img.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          padding: '6px 12px',
          gap: 2,
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {([['info', 'Info'], ['link', 'Links']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: tab === id ? 500 : 400,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--r-sm)',
              background: tab === id ? 'var(--active-bg)' : 'transparent',
              color: tab === id ? 'var(--text-1)' : 'var(--text-2)',
              letterSpacing: '-0.01em',
              transition: 'background 0.1s, color 0.1s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'info' && (
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                {img.filename}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
                Uploaded {formatDate(img.createdAt)}
              </div>
            </div>

            {/* Public toggle */}
            <button
              onClick={() => onTogglePublic(img)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '10px 12px',
                background: img.isPublic ? 'var(--accent-bg)' : 'var(--sidebar-bg)',
                borderRadius: 'var(--r)',
                marginBottom: 16,
                border: `1px solid ${img.isPublic ? 'oklch(0.56 0.22 263 / 20%)' : 'var(--border)'}`,
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s',
              }}
            >
              <Icon
                name={img.isPublic ? 'globe' : 'lock'}
                size={14}
                color={img.isPublic ? 'var(--accent)' : 'var(--text-3)'}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: img.isPublic ? 'var(--accent)' : 'var(--text-2)' }}>
                  {img.isPublic ? 'Public' : 'Private'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  {img.isPublic ? 'Anyone with the link can view' : 'Click to make public'}
                </div>
              </div>
            </button>

            {/* Meta table */}
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                File info
              </div>
              {meta.map(({ k, v }) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{k}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-2)',
                      maxWidth: 155,
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'link' && (
          <div style={{ padding: 16 }}>
            <SectionLabel>
              Direct URL {!img.isPublic && <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-3)' }}>(private)</span>}
            </SectionLabel>

            <div
              style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                padding: '10px 12px',
                marginBottom: 10,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11.5,
                color: 'var(--text-2)',
                wordBreak: 'break-all',
                lineHeight: 1.5,
              }}
            >
              {linkUrl}
            </div>

            <Btn
              variant={copied ? 'outline' : 'accent'}
              icon={copied ? 'check' : 'copy'}
              onClick={copyLink}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {copied ? 'Copied to clipboard' : 'Copy URL'}
            </Btn>

            <div style={{ marginTop: 20 }}>
              <SectionLabel>Embed</SectionLabel>
              {makeEmbeds(linkUrl).map(({ label, code }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                  <div
                    style={{
                      background: 'var(--sidebar-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      padding: '8px 10px',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                      color: 'var(--text-2)',
                      overflow: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div
        style={{
          padding: '10px 12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 7,
          flexShrink: 0,
        }}
      >
        <Btn
          variant="outline"
          icon="download"
          onClick={() => {
            const a = document.createElement('a');
            a.href = img.url;
            a.download = img.filename;
            a.click();
          }}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Download
        </Btn>
        <Btn
          variant="outline"
          icon="external"
          onClick={() => window.open(img.url, '_blank')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Preview
        </Btn>
        <Btn
          variant="ghost"
          icon="trash"
          onClick={() => onDelete(img)}
          style={{ color: 'var(--danger)' }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: 'var(--text-3)',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  style,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-3)',
        padding: 5,
        borderRadius: 'var(--r-sm)',
        display: 'flex',
        transition: 'color 0.12s, background 0.12s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!style?.color) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover-bg)';
      }}
      onMouseLeave={(e) => {
        if (!style?.color) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)';
        (e.currentTarget as HTMLButtonElement).style.background = 'none';
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}
