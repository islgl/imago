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
        { label: 'Imago', desc: 'Cloudflare Workers + R2', value: 'v0.1.0' },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* TopBar-matching header */}
      <div
        style={{
          height: 52,
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Settings</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 580 }}>

        {/* Account section */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel>Account</SectionLabel>
          <SettingsRow
            label="Session"
            desc="Active for 7 days since login"
            action={<Btn variant="outline" size="sm" onClick={onLogout}>Log out</Btn>}
          />
        </div>

        {sections.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 36 }}>
            <SectionLabel>{section}</SectionLabel>
            {items.map((item) => (
              <SettingsRow
                key={item.label}
                label={item.label}
                desc={item.desc}
                action={
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-2)',
                      background: 'var(--sidebar-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      padding: '4px 10px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.value}
                  </div>
                }
              />
            ))}
          </div>
        ))}
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
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  desc,
  action,
}: {
  label: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{desc}</div>
      </div>
      {action}
    </div>
  );
}
