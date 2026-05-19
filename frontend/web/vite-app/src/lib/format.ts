import { t } from './i18n';

export function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function fmtMinutes(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function lastActiveStr(hours: number) {
  if (hours < 1) return t('just now');
  if (hours < 24) return t('{n}h ago', { n: Math.round(hours) });
  const d = Math.round(hours / 24);
  return t('{n}d ago', { n: d });
}

export function pct(x: number) {
  return Math.round(x * 100);
}

// Convert hex (#2f5cff) to a soft rgba string for tints.
export function hexToSoft(hex: string, alpha: number) {
  const h = String(hex).replace('#', '');
  const x =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.padEnd(6, '0').slice(0, 6);
  const n = parseInt(x, 16);
  if (Number.isNaN(n)) return `rgba(47,92,255,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
