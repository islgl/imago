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
    { k: 'Filename', v: img.filename },
    { k: 'Dimensions', v: img.width && img.height ? `${img.width} × ${img.height} px` : '—' },
    { k: 'Size', v: formatBytes(img.sizeBytes) },
    { k: 'Format', v: extFromFilename(img.filename) },
    { k: 'Uploaded', v: formatDate(img.createdAt) },
    { k: 'Album', v: albumName },
  ];

  return (
    <div
      style={{
        width: 'var(--detail)',
        minWidth: 'var(--detail)',
        borderLeft: '1px solid var(--border)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        animation: 'slideIn .18s ease',
      }}
    >
      <div
        style={{
          height: 50,
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Details</span>
        <button
          onClick={() => onToggleStar(img)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: img.isStarred ? '#f5c542' : 'var(--text-3)',
            padding: 5,
            borderRadius: 4,
            display: 'flex',
          }}
          title={img.isStarred ? 'Unstar' : 'Star'}
        >
          <Icon name="star" size={14} />
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-3)',
            padding: 5,
            borderRadius: 4,
            display: 'flex',
          }}
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      <div style={{ aspectRatio: '4/3', background: '#eeede9', overflow: 'hidden', flexShrink: 0 }}>
        <img src={img.url} alt={img.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

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
              padding: '4px 12px',
              fontSize: 12.5,
              fontWeight: tab === id ? 500 : 400,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 5,
              background: tab === id ? 'var(--active-bg)' : 'transparent',
              color: tab === id ? 'var(--text-1)' : 'var(--text-2)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'info' && (
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all', lineHeight: 1.5 }}>
                {img.filename}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
                Uploaded {formatDate(img.createdAt)}
              </div>
            </div>

            <button
              onClick={() => onTogglePublic(img)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                background: img.isPublic ? 'rgba(35,131,226,.07)' : 'var(--sidebar-bg)',
                borderRadius: 8,
                marginBottom: 16,
                border: `1px solid ${img.isPublic ? 'rgba(35,131,226,.18)' : 'var(--border)'}`,
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Icon
                name={img.isPublic ? 'globe' : 'lock'}
                size={14}
                color={img.isPublic ? 'var(--accent)' : 'var(--text-3)'}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: img.isPublic ? 'var(--accent)' : 'var(--text-2)',
                  }}
                >
                  {img.isPublic ? 'Public' : 'Private'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  {img.isPublic ? 'Anyone with the link can view' : 'Click to make public'}
                </div>
              </div>
            </button>

            <div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  letterSpacing: '.06em',
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
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-3)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Direct URL {!img.isPublic && <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-3)' }}>(private)</span>}
            </div>

            <div
              style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
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
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  letterSpacing: '.05em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Embed
              </div>
              {makeEmbeds(linkUrl).map(({ label, code }) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                  <div
                    style={{
                      background: 'var(--sidebar-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 5,
                      padding: '7px 10px',
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

      <div
        style={{
          padding: '10px 14px 14px',
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
