// Inline SVG icon set. Add new shapes here; pass `name` from components.
import type { CSSProperties } from 'react';

const PATHS: Record<string, JSX.Element> = {
  home:        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
      <path d="M14 19c.4-2 2.2-3.5 4.5-3.5S22 17 22 19" />
    </>
  ),
  heart:       <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z" />,
  school: (
    <>
      <path d="M3 9 12 5l9 4-9 4-9-4z" />
      <path d="M7 11v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  chevron:     <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrow:       <path d="M5 12h14M13 6l6 6-6 6" />,
  plus:        <path d="M12 5v14M5 12h14" />,
  filter:      <path d="M4 5h16l-6 8v6l-4-2v-4z" />,
  download: (
    <>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  more: (
    <>
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 1 2-2h12" />
    </>
  ),
  check: <path d="M5 12l4 4 10-10" />,
  x:     <path d="M6 6l12 12M18 6L6 18" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
};

export interface IconProps {
  name: keyof typeof PATHS | string;
  size?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}
