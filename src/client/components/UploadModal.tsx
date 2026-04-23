import { useRef, useState } from 'react';
import { Icon } from './Icon';
import { Btn } from './Btn';
import type { Image } from '../types';
import { uploadImage } from '../lib/api';

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
  const [current, setCurrent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setPhase('uploading');
    try {
      for (const file of list) {
        setCurrent(file.name);
        setProgress(0);
        const img = await uploadImage(file, {}, (pct) => setProgress(pct));
        onUploaded(img);
      }
      setPhase('done');
      setTimeout(onClose, 700);
    } catch (e) {
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
        background: 'rgba(0,0,0,.38)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn .15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 500,
          background: '#fff',
          borderRadius: 14,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'fadeIn .18s ease',
        }}
      >
        <div
          style={{
            padding: '18px 20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Upload images</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              PNG · JPG · WebP · GIF · SVG · Max 20 MB
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
              borderRadius: 6,
              display: 'flex',
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
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDrag(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${drag ? 'var(--accent)' : 'rgba(55,53,47,.22)'}`,
                  borderRadius: 10,
                  padding: '38px 20px',
                  textAlign: 'center',
                  background: drag ? 'var(--accent-bg)' : 'var(--sidebar-bg)',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 13,
                    background: drag ? 'var(--accent-bg)' : 'rgba(55,53,47,.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    border: drag ? '1px solid rgba(35,131,226,.3)' : '1px solid var(--border)',
                  }}
                >
                  <Icon name="upload" size={22} color={drag ? 'var(--accent)' : 'var(--text-2)'} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 5 }}>Drop files here</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                  or <span style={{ color: 'var(--accent)', fontWeight: 500 }}>click to select</span>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Btn variant="ghost" onClick={onClose}>
                  Cancel
                </Btn>
                <Btn variant="solid" icon="upload" onClick={() => fileInputRef.current?.click()}>
                  Select files
                </Btn>
              </div>
            </>
          )}

          {phase === 'uploading' && (
            <div style={{ padding: '10px 0 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>
                Uploading <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{current}</span>…
              </div>
              <div
                style={{
                  height: 4,
                  background: 'rgba(55,53,47,.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--text-1)',
                    borderRadius: 2,
                    transition: 'width .18s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{Math.floor(progress)}%</div>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ padding: '18px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(15,123,108,.12)',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={20} color="var(--success)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Upload complete</div>
            </div>
          )}

          {phase === 'error' && (
            <div style={{ padding: '18px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(212,76,71,.12)',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="warning" size={20} color="var(--danger)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Upload failed</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>{error}</div>
              <Btn variant="outline" onClick={() => setPhase('idle')}>
                Retry
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
