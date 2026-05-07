import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { Image } from '../types';
import { uploadImage } from '../lib/api';
import { compressImageFile, type CompressionOptions } from '../lib/compress';
import { formatBytes } from '../lib/utils';

type Phase = 'idle' | 'uploading' | 'done' | 'error';

export function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (img: Image) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [current, setCurrent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [compression, setCompression] = useState<CompressionOptions>({
    enabled: true,
    quality: 0.82,
    maxDimension: 2560,
  });
  const [compressionNote, setCompressionNote] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setPhase('uploading');
    setCompressionNote('');
    try {
      for (const file of list) {
        setCurrent(file.name);
        setProgress(0);
        setPreparing(true);
        const result = await compressImageFile(file, compression);
        setCompressionNote(
          result.compressed
            ? `${formatBytes(result.originalSize)} → ${formatBytes(result.finalSize)}`
            : '',
        );
        if (result.file.name !== file.name) setCurrent(result.file.name);
        setPreparing(false);
        const img = await uploadImage(result.file, {}, (pct) => setProgress(pct));
        onUploaded(img);
      }
      setPhase('done');
      setTimeout(onClose, 700);
    } catch (e) {
      setPreparing(false);
      setError(e instanceof Error ? e.message : 'Upload failed');
      setPhase('error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'oklch(0 0 0 / 40%)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 480,
          maxHeight: 'calc(100vh - 32px)',
          background: 'var(--bg)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          overflowX: 'hidden',
          overflowY: 'auto',
          animation: 'fadeIn 0.18s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>Upload images</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              PNG · JPG · WebP · GIF · SVG · AVIF · Max 20 MB
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              padding: 6,
              borderRadius: 'var(--r)',
              display: 'flex',
              transition: 'color 0.1s, background 0.1s',
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
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {phase === 'idle' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
              />

              <div
                onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
                onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${drag ? 'var(--accent)' : 'var(--border-mid)'}`,
                  borderRadius: 'var(--r-md)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: drag ? 'var(--accent-bg)' : 'var(--sidebar-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--r-lg)',
                    background: drag ? 'var(--accent-bg)' : 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    border: drag ? '1px solid oklch(0.56 0.22 263 / 30%)' : '1px solid var(--border)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon name="upload" size={22} color={drag ? 'var(--accent)' : 'var(--text-2)'} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' }}>Drop files here</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  or <span style={{ color: 'var(--accent)', fontWeight: 500 }}>click to select</span>
                </div>
              </div>

              <CompressionControls compression={compression} setCompression={setCompression} />

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="solid" icon="upload" onClick={() => fileInputRef.current?.click()}>Select files</Btn>
              </div>
            </>
          )}

          {phase === 'uploading' && (
            <div style={{ padding: '10px 0 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>
                {preparing ? 'Preparing' : 'Uploading'} <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{current}</span>…
              </div>
              <div
                style={{
                  height: 3,
                  background: 'var(--border-mid)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 4,
                    transition: 'width 0.18s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{Math.floor(progress)}%</div>
              {compressionNote && (
                <div style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 8 }}>{compressionNote}</div>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-lg)',
                  background: 'oklch(0.52 0.13 160 / 12%)',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={20} color="var(--success)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>Upload complete</div>
            </div>
          )}

          {phase === 'error' && (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-lg)',
                  background: 'oklch(0.52 0.20 25 / 10%)',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="warning" size={20} color="var(--danger)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' }}>Upload failed</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 16 }}>{error}</div>
              <Btn variant="outline" onClick={() => setPhase('idle')}>Try again</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompressionControls({
  compression,
  setCompression,
}: {
  compression: CompressionOptions;
  setCompression: Dispatch<SetStateAction<CompressionOptions>>;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        background: 'var(--sidebar-bg)',
      }}
    >
      <button
        type="button"
        onClick={() => setCompression((prev) => ({ ...prev, enabled: !prev.enabled }))}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: 'none',
          background: 'transparent',
          color: 'var(--text-1)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: compression.enabled ? 'var(--accent)' : 'var(--bg)',
            border: compression.enabled ? 'none' : '1px solid var(--border-mid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {compression.enabled && <Icon name="check" size={10} color="#fff" />}
        </span>
        <Icon name="sliders" size={14} color={compression.enabled ? 'var(--accent)' : 'var(--text-3)'} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>Compress images</span>
        <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
          {compression.enabled ? `${Math.round(compression.quality * 100)}%` : 'Off'}
        </span>
      </button>

      {compression.enabled && (
        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Quality</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 500 }}>
                {Math.round(compression.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.55"
              max="0.92"
              step="0.01"
              value={compression.quality}
              onChange={(e) => setCompression((prev) => ({ ...prev, quality: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              { label: 'Small', quality: 0.72, maxDimension: 1920 },
              { label: 'Balanced', quality: 0.82, maxDimension: 2560 },
              { label: 'Large', quality: 0.88, maxDimension: 4096 },
            ] as const).map(({ label, quality, maxDimension }) => {
              const active = compression.quality === quality && compression.maxDimension === maxDimension;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCompression((prev) => ({ ...prev, quality, maxDimension }))}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    background: active ? 'var(--active-bg)' : 'var(--bg)',
                    color: active ? 'var(--text-1)' : 'var(--text-2)',
                    cursor: 'pointer',
                    fontSize: 11.5,
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
