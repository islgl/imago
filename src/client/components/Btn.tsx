import { useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'ghost' | 'outline' | 'solid' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

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
  const [hov, setHov] = useState(false);
  const pad = size === 'sm' ? '5px 10px' : size === 'lg' ? '9px 18px' : '6px 13px';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;
  const ic = size === 'sm' ? 13 : 14;

  const bases: Record<Variant, { bg: string; clr: string; border: string }> = {
    ghost:   { bg: hov ? 'var(--hover-bg)' : 'transparent', clr: 'var(--text-1)', border: 'none' },
    outline: { bg: hov ? 'var(--hover-bg)' : 'transparent', clr: 'var(--text-1)', border: '1px solid var(--border-mid)' },
    solid:   { bg: hov ? '#1a1a1a' : '#2d2d2d', clr: '#fff', border: 'none' },
    accent:  { bg: hov ? '#1870c8' : 'var(--accent)', clr: '#fff', border: 'none' },
    danger:  { bg: hov ? '#b83330' : 'var(--danger)', clr: '#fff', border: 'none' },
  };
  const v = bases[variant];

  return (
    <button
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
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
        background: v.bg,
        color: v.clr,
        border: v.border,
        transition: 'background .1s, color .1s',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={ic} />}
      {children}
    </button>
  );
}
