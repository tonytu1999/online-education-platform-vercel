// Reusable visual primitives: Card, Avatar, ProgressBar, Pill, Badge, Tabs…
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { MasteryLevel, RiskLevel, Subject, SubjectTone } from '../types';
import { classNames, initials } from '../lib/format';
import { t } from '../lib/i18n';
import { Icon } from './Icon';

// Hue-stable swatch for subjects.
const SUBJECT_TONES: Record<SubjectTone, { bg: string; fg: string }> = {
  blue:   { bg: 'oklch(0.96 0.018 250)', fg: 'oklch(0.45 0.14 255)' },
  amber:  { bg: 'oklch(0.96 0.04 75)',   fg: 'oklch(0.5  0.13 60)'  },
  green:  { bg: 'oklch(0.95 0.04 155)',  fg: 'oklch(0.45 0.10 160)' },
  rose:   { bg: 'oklch(0.96 0.03 20)',   fg: 'oklch(0.5  0.13 20)'  },
  violet: { bg: 'oklch(0.95 0.04 305)',  fg: 'oklch(0.46 0.13 305)' },
};

export function SubjectChip({ subject, size = 'md' }: { subject: Subject; size?: 'sm' | 'md' | 'lg' }) {
  const tones = SUBJECT_TONES[subject.tone] || SUBJECT_TONES.blue;
  const dims =
    size === 'sm' ? { w: 22, h: 22, f: 12 }
    : size === 'lg' ? { w: 40, h: 40, f: 20 }
    : { w: 28, h: 28, f: 14 };
  return (
    <span
      aria-hidden="true"
      className="subj-chip"
      style={{ width: dims.w, height: dims.h, fontSize: dims.f, background: tones.bg, color: tones.fg }}
    >
      {subject.glyph}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 17 + (name.charCodeAt(1) || 0) * 31) % 360;
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `oklch(0.92 0.04 ${hue})`,
        color: `oklch(0.36 0.12 ${hue})`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export interface CardProps {
  children?: ReactNode;
  padded?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hover?: boolean;
}

export function Card({ children, padded = true, className, style, onClick, hover }: CardProps) {
  return (
    <div
      className={classNames('card', padded && 'card--padded', hover && 'card--hover', className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatTile({
  label, value, hint, trend, accent,
}: { label: ReactNode; value: ReactNode; hint?: ReactNode; trend?: number; accent?: string }) {
  return (
    <Card className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value" style={{ color: accent }}>{value}</div>
      {hint && (
        <div className="stat__hint">
          {trend != null && (
            <span className={classNames('trend', trend >= 0 ? 'trend--up' : 'trend--down')}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
          <span>{hint}</span>
        </div>
      )}
    </Card>
  );
}

export function ProgressBar({
  value, height = 6, tone = 'accent',
}: { value: number; height?: number; tone?: 'accent' | 'positive' | 'warn' | 'risk' }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="progress" style={{ height }}>
      <div className={classNames('progress__bar', `progress__bar--${tone}`)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function RiskBadge({ level, dot = false }: { level: RiskLevel; dot?: boolean }) {
  const labels: Record<RiskLevel, string> = { low: t('Low'), medium: t('Medium'), high: t('High') };
  return (
    <span className={classNames('risk', `risk--${level}`, dot && 'risk--dot')}>
      <i className="risk__bullet" />
      {!dot && labels[level]}
    </span>
  );
}

export function MasteryDot({ level }: { level: MasteryLevel }) {
  return <span className={classNames('mast-dot', `mast-dot--${level}`)} aria-label={level} />;
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'positive' }) {
  return <span className={classNames('pill', `pill--${tone}`)}>{children}</span>;
}

export interface Tab { id: string; label: string; count?: number; }

export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          className={classNames('tabs__btn', tab.id === active && 'tabs__btn--active')}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null && <span className="tabs__count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="search">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || t('Search…')} />
    </div>
  );
}

export function EmptyState({ title, body, kind = 'info' }: { title: string; body: string; kind?: string }) {
  return (
    <div className={classNames('empty', `empty--${kind}`)}>
      <div className="empty__title">{title}</div>
      <div className="empty__body">{body}</div>
    </div>
  );
}

export function ReservedBanner({ children }: { children: ReactNode }) {
  return (
    <div className="reserved-banner">
      <span className="reserved-banner__dot" />
      <div>
        <b>{t('Reserved interface')}</b>
        <span> — {children}</span>
      </div>
    </div>
  );
}

export interface FilterOption { id: string; label: string }

export function FilterSelect({
  label, value, options, onChange,
}: { label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }) {
  return (
    <label className="filter">
      <span className="filter__label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

export { Icon };
