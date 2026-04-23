import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'ghost' | 'outline' | 'solid' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const STYLES: Record<Variant, CSSProperties> = {
  ghost:   { background: 'transparent', color: 'var(--text-1)', border: 'none' },
  outline: { background: 'transparent', color: 'var(--text-1)', border: '1px solid var(--border-mid)' },
  solid:   { background: 'var(--text-1)', color: 'var(--bg)', border: 'none' },
  accent:  { background: 'var(--accent)', color: '#fff', border: 'none' },
  danger:  { background: 'var(--danger)', color: '#fff', border: 'none' },
};

const HOVER: Record<Variant, string> = {
  ghost:   'var(--hover-bg)',
  outline: 'var(--hover-bg)',
  solid:   'var(--text-2)',
  accent:  'var(--accent-hover)',
  danger:  'var(--danger-hover)',
};

export function Btn({
  children,
  variant = 'ghost',
  size = 'md',
  icon,
  onClick,
  style,
  disabled,
  title,
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  disabled?: boolean;
  title?: string;
}) {
  const pad    = size === 'sm' ? '5px 10px' : size === 'lg' ? '10px 20px' : '7px 13px';
  const fs     = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;
  const ic     = size === 'sm' ? 13 : size === 'lg' ? 15 : 14;
  const base   = STYLES[variant];
  const hovBg  = HOVER[variant];

  return (
    <button
      disabled={disabled}
      title={title}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'solid' || variant === 'accent' || variant === 'danger') {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
        } else {
          (e.currentTarget as HTMLButtonElement).style.background = hovBg;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'solid' || variant === 'accent' || variant === 'danger') {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        } else {
          (e.currentTarget as HTMLButtonElement).style.background = base.background as string;
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: pad,
        fontSize: fs,
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: 'var(--r)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.1s, opacity 0.1s',
        outline: 'none',
        opacity: disabled ? 0.45 : 1,
        letterSpacing: '-0.01em',
        ...base,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={ic} />}
      {children}
    </button>
  );
}
