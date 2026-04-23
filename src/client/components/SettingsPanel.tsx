import { Btn } from './Btn';
import type { Storage } from '../types';
import { formatBytes } from '../lib/utils';

export function SettingsPanel({
  storage,
  onLogout,
}: {
  storage: Storage | null;
  onLogout: () => void;
}) {
  const sections = [
    {
      section: 'Storage',
      items: [
        {
          label: 'Used',
          desc: `${storage?.imageCount ?? 0} ${storage?.imageCount === 1 ? 'image' : 'images'}`,
          value: formatBytes(storage?.usedBytes ?? 0),
        },
        { label: 'Backend', desc: 'Cloudflare R2', value: 'imago-images' },
      ],
    },
    {
      section: 'About',
      items: [
        { label: 'Imago', desc: 'Cloudflare Workers + R2', value: 'v0.1.0 MVP' },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          height: 50,
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>Settings</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 600 }}>
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-3)',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Account
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Session</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                Active for 7 days since login
              </div>
            </div>
            <Btn variant="outline" size="sm" onClick={onLogout}>
              Log out
            </Btn>
          </div>
        </div>
        {sections.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-3)',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {section}
            </div>
            {items.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-2)',
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '4px 10px',
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
