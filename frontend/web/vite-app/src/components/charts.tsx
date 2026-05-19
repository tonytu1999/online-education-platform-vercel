// Bespoke SVG / div chart primitives. Replace with Recharts equivalents once
// the design is settled — the call shapes are intentionally minimal.

import type { ReactNode } from 'react';
import type { Klass, KnowledgePoint, Student } from '../types';
import { classNames } from '../lib/format';
import type { MasteryDist } from '../lib/mastery';
import { Avatar } from './primitives';

export function Sparkline({
  data, width = 120, height = 32, stroke = 'var(--accent)', fill, strokeWidth = 1.5,
}: { data: number[]; width?: number; height?: number; stroke?: string; fill?: string; strokeWidth?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(0.001, max - min);
  const stepX = width / (data.length - 1);
  const points = data.map((v, i): [number, number] => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="spark">
      {fill && <path d={area} fill={fill} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StackedMasteryBar({ dist, height = 8 }: { dist: MasteryDist; height?: number }) {
  return (
    <div className="smb" style={{ height }}>
      <span className="smb__seg smb__seg--mastered" style={{ width: `${dist.mastered * 100}%` }} />
      <span className="smb__seg smb__seg--partial"  style={{ width: `${dist.partial  * 100}%` }} />
      <span className="smb__seg smb__seg--not"      style={{ width: `${dist.not      * 100}%` }} />
    </div>
  );
}

export interface HeatmapPoint extends KnowledgePoint {
  chapterId?: string;
  chapterName?: string;
}

export function MasteryHeatmap({
  students, points, onCell, focusPointId, focusStudentId,
}: {
  students: Student[];
  points: HeatmapPoint[];
  onCell?: (s: Student, p: HeatmapPoint) => void;
  focusPointId?: string;
  focusStudentId?: string;
}) {
  return (
    <div className="hm">
      <div className="hm__corner" />
      <div className="hm__cols" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(28px, 1fr))` }}>
        {points.map((p) => (
          <div
            key={p.id}
            className={classNames('hm__col-label', focusPointId === p.id && 'hm__col-label--focus')}
            title={`${p.chapterName ?? ''} — ${p.name}`}
          >
            <span>{p.name}</span>
          </div>
        ))}
      </div>
      <div className="hm__rows">
        {students.map((s) => (
          <div key={s.id} style={{ display: 'contents' }}>
            <div className={classNames('hm__row-label', focusStudentId === s.id && 'hm__row-label--focus')}>
              <Avatar name={s.name} size={22} />
              <span>{s.name}</span>
            </div>
            <div className="hm__row" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(28px, 1fr))` }}>
              {points.map((p) => {
                const lvl = s.mastery[p.id] || 'not';
                return (
                  <button
                    key={p.id}
                    className={classNames(
                      'hm__cell',
                      `hm__cell--${lvl}`,
                      focusPointId === p.id && 'hm__cell--col-focus',
                      focusStudentId === s.id && 'hm__cell--row-focus',
                    )}
                    title={`${s.name} — ${p.name}: ${lvl}`}
                    onClick={() => onCell?.(s, p)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface DonutSegment { value: number; color: string }

export function Donut({
  segments, size = 132, thickness = 16, center,
}: { segments: DonutSegment[]; size?: number; thickness?: number; center?: ReactNode }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const offset = -acc * c;
          acc += frac;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      {center && <div className="donut__center">{center}</div>}
    </div>
  );
}

export function PointMasteryRow({
  point, dist, mode = 'stacked', onClick, isFocus,
}: {
  point: HeatmapPoint;
  dist: MasteryDist;
  mode?: 'stacked' | 'split';
  onClick?: () => void;
  isFocus?: boolean;
}) {
  return (
    <button className={classNames('pmr', isFocus && 'pmr--focus')} onClick={onClick}>
      <div className="pmr__head">
        <div className="pmr__title">
          <span className="pmr__chapter">{point.chapterName}</span>
          <span className="pmr__name">{point.name}</span>
        </div>
        <div className="pmr__pct">{Math.round((dist.mastered + dist.partial * 0.5) * 100)}%</div>
      </div>
      {mode === 'stacked' ? (
        <StackedMasteryBar dist={dist} />
      ) : (
        <div className="pmr__bars">
          <div className="pmr__minibar"><span style={{ width: `${dist.mastered * 100}%`, background: 'var(--mast-mastered)' }} /></div>
          <div className="pmr__minibar"><span style={{ width: `${dist.partial  * 100}%`, background: 'var(--mast-partial)'  }} /></div>
          <div className="pmr__minibar"><span style={{ width: `${dist.not      * 100}%`, background: 'var(--mast-not)'      }} /></div>
        </div>
      )}
      <div className="pmr__counts">
        <span><i className="dotswatch dotswatch--mastered" /> {Math.round(dist.mastered * dist.total)} mastered</span>
        <span><i className="dotswatch dotswatch--partial" />  {Math.round(dist.partial  * dist.total)} partial</span>
        <span><i className="dotswatch dotswatch--not" />      {Math.round(dist.not      * dist.total)} not yet</span>
      </div>
    </button>
  );
}

export function AreaChart<T>({
  data, accessor, width = 640, height = 180, color = 'var(--accent)', fill = 'var(--accent-soft)',
}: {
  data: T[];
  accessor: (d: T) => number;
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
}) {
  if (!data || data.length < 2) return null;
  const vals = data.map(accessor);
  const min = 0;
  const max = Math.max(...vals) * 1.1;
  const range = Math.max(0.001, max - min);
  const stepX = width / (data.length - 1);
  const pts = vals.map((v, i): [number, number] => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 12) - 4;
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  const gridY = [0.25, 0.5, 0.75, 1].map((tt) => height - tt * (height - 12) - 4);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="areachart" preserveAspectRatio="none">
      {gridY.map((y, i) => (
        <line key={i} x1="0" x2={width} y1={y} y2={y} stroke="var(--border)" strokeDasharray="2 4" />
      ))}
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BarChart<T extends Record<string, unknown>>({
  data, accessor, labelKey, height = 160, color = 'var(--accent)',
}: {
  data: T[];
  accessor: (d: T) => number;
  labelKey: keyof T;
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map(accessor)) * 1.1 || 1;
  return (
    <div className="barchart" style={{ height: height + 28 }}>
      <div className="barchart__bars" style={{ height }}>
        {data.map((d, i) => {
          const v = accessor(d);
          const h = (v / max) * height;
          return (
            <div key={i} className="barchart__col" title={`${String(d[labelKey])}: ${Math.round(v)}`}>
              <span className="barchart__val">{Math.round(v)}%</span>
              <span className="barchart__bar" style={{ height: h, background: color }} />
              <span className="barchart__lbl">{String(d[labelKey])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KeywordCloud({ keywords }: { keywords: Array<{ word: string; weight: number }> }) {
  const max = Math.max(...keywords.map((k) => k.weight));
  return (
    <div className="kwcloud">
      {keywords.map((k, i) => {
        const tt = k.weight / max;
        const size = 12 + tt * 16;
        const weight = tt > 0.65 ? 600 : tt > 0.4 ? 500 : 400;
        const opacity = 0.45 + tt * 0.55;
        return (
          <span key={i} style={{ fontSize: size, fontWeight: weight, opacity }}>
            {k.word}
          </span>
        );
      })}
    </div>
  );
}

export function SentimentMeter({ value }: { value: number }) {
  const pos = (value + 1) / 2;
  return (
    <div className="senti">
      <div className="senti__track" />
      <div className="senti__marker" style={{ left: `${pos * 100}%` }} />
      <div className="senti__labels">
        <span>Low</span><span>Neutral</span><span>Positive</span>
      </div>
    </div>
  );
}

// Convenience exports for consumers that destructure related types.
export type { Klass };
