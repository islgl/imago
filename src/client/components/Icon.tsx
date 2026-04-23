import type { CSSProperties } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Folder,
  Globe,
  Grid2x2,
  Image,
  Link2,
  List,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  upload:    Upload,
  grid2:     Grid2x2,
  rows:      List,
  search:    Search,
  copy:      Copy,
  download:  Download,
  trash:     Trash2,
  star:      Star,
  link2:     Link2,
  settings:  Settings,
  close:     X,
  check:     Check,
  plus:      Plus,
  folder:    Folder,
  image:     Image,
  globe:     Globe,
  lock:      Lock,
  external:  ExternalLink,
  chevronR:  ChevronRight,
  chevronD:  ChevronDown,
  ellipsis:  MoreHorizontal,
  warning:   AlertTriangle,
  sparkle:   Sparkles,
};

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
  const LucideComp = ICONS[name];
  if (!LucideComp) return null;
  return (
    <LucideComp
      width={size}
      height={size}
      style={{ flexShrink: 0, display: 'block', color: color ?? 'currentColor', ...style }}
      strokeWidth={1.75}
    />
  );
}
