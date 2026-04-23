import type { CSSProperties } from 'react';

const PATHS: Record<string, string[]> = {
  upload:   ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  grid2:    ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z'],
  rows:     ['M3 5h18','M3 10h18','M3 15h18','M3 20h18'],
  search:   ['M21 21l-5.2-5.2','circle:cx=10cy=10r=7'],
  copy:     ['M8 4v12a1 1 0 001 1h9a1 1 0 001-1V8l-5-4H8z','M11 4v4h5'],
  download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M7 10l5 5 5-5','M12 15V3'],
  trash:    ['M3 6h18','M8 6V4h8v2','M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6'],
  star:     ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'],
  link2:    ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  settings: ['circle:cx=12cy=12r=3','M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'],
  close:    ['M18 6L6 18','M6 6l12 12'],
  check:    ['M20 6L9 17l-5-5'],
  plus:     ['M12 5v14','M5 12h14'],
  folder:   ['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z'],
  image:    ['rect:x=3y=3w=18h=18rx=2ry=2','circle:cx=8.5cy=8.5r=1.5','M21 15l-5-5L5 21'],
  globe:    ['circle:cx=12cy=12r=10','M2 12h20','M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'],
  lock:     ['rect:x=3y=11w=18h=11rx=2ry=2','M7 11V7a5 5 0 0110 0v4'],
  external: ['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6','M15 3h6v6','M10 14L21 3'],
  chevronR: ['M9 18l6-6-6-6'],
  chevronD: ['M6 9l6 6 6-6'],
  ellipsis: ['circle:cx=5cy=12r=1','circle:cx=12cy=12r=1','circle:cx=19cy=12r=1'],
  warning:  ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4','M12 17h.01'],
  sparkle:  ['M12 3l1.09 3.36L16.5 7.5l-3.41 1.14L12 12l-1.09-3.36L7.5 7.5l3.41-1.14z','M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z','M19 11l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z'],
};

function parseAttrs(s: string): Record<string, number> {
  const attrs: Record<string, number> = {};
  for (const m of s.matchAll(/([a-z]+)=(-?[\d.]+)/g)) attrs[m[1]] = +m[2];
  return attrs;
}

export function Icon({
  name,
  size = 16,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const els = (PATHS[name] ?? []).map((d, i) => {
    if (d.startsWith('circle:')) {
      const p = parseAttrs(d.slice(7));
      return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />;
    }
    if (d.startsWith('rect:')) {
      const p = parseAttrs(d.slice(5));
      return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} ry={p.ry} />;
    }
    return <path key={i} d={d} />;
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {els}
    </svg>
  );
}
