// Mental Health views: per-class breakdown and a class picker.

import { useState } from 'react';
import type { Klass, NavState } from '../types';
import { classAvgSentiment, classRiskDist } from '../lib/mastery';
import { classDisplayName, t } from '../lib/i18n';
import { showToast } from '../lib/toast';
import { classNames, lastActiveStr } from '../lib/format';
import {
  Avatar,
  Card,
  FilterSelect,
  Icon,
  RiskBadge,
  StatTile,
} from '../components/primitives';
import { Donut, KeywordCloud, SentimentMeter, Sparkline } from '../components/charts';

interface ClassMentalHealthProps {
  klass: Klass;
  onNavigate: (n: NavState) => void;
}

export function ClassMentalHealth({ klass, onNavigate }: ClassMentalHealthProps) {
  const [filter, setFilter] = useState('all');
  const risk = classRiskDist(klass);
  const avgS = classAvgSentiment(klass);

  // Aggregate real keywords from all students, ranked by frequency
  const classKeywords: Array<{ word: string; weight: number }> = (() => {
    const freq: Record<string, number> = {};
    for (const s of klass.students) {
      if (!s.mentalHealthKeywords) continue;
      for (const kw of s.mentalHealthKeywords.split(',').map((k) => k.trim()).filter(Boolean)) {
        freq[kw] = (freq[kw] ?? 0) + 1;
      }
    }
    return Object.entries(freq)
      .map(([word, weight]) => ({ word, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  })();
  const filtered = klass.students.filter((s) =>
    filter === 'all' ? true :
    filter === 'medium' ? s.risk === 'medium' || s.risk === 'high' :
    s.risk === filter,
  );
  const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort(
    (a, b) => (riskOrder[a.risk] - riskOrder[b.risk]) || a.sentiment - b.sentiment,
  );

  return (
    <div className="class-mh">

      <div className="mh-grid">
        <Card>
          <div className="section-head section-head--card">
            <h3>{t('Class risk distribution')}</h3>
          </div>
          <div className="riskdonut-wrap">
            <Donut
              size={132}
              thickness={16}
              segments={[
                { value: risk.low,    color: 'var(--risk-low)' },
                { value: risk.medium, color: 'var(--risk-medium)' },
                { value: risk.high,   color: 'var(--risk-high)' },
              ]}
              center={
                <div>
                  <div className="donut__center-num">{risk.total}</div>
                  <div className="donut__center-lbl">{t('students')}</div>
                </div>
              }
            />
            <div className="riskdonut-legend">
              <LegendRow color="var(--risk-low)"    label={t('Low')}    count={risk.low}    of={risk.total} />
              <LegendRow color="var(--risk-medium)" label={t('Medium')} count={risk.medium} of={risk.total} />
              <LegendRow color="var(--risk-high)"   label={t('High')}   count={risk.high}   of={risk.total} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="section-head section-head--card">
            <h3>{t('Class average sentiment')}</h3>
            <span className="hint-muted">{t('14-day window')}</span>
          </div>
          <div className="senti-large">
            <SentimentMeter value={avgS} />
            <div className="senti-num">
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {avgS >= 0 ? '+' : ''}{avgS.toFixed(2)}
              </span>
              <span className="senti-num-lbl">{t('vs. last week +0.03')}</span>
            </div>
          </div>
          {classKeywords.length > 0 && (
            <div className="kw-section">
              <div className="hint-muted" style={{ marginBottom: 8 }}>{t('Top stress keywords this week')}</div>
              <KeywordCloud keywords={classKeywords} />
            </div>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="toolbar">
          <span className="toolbar__title">{t('Students · risk-ranked')}</span>
          <FilterSelect label={t('Filter')} value={filter} onChange={setFilter}
            options={[
              { id: 'all', label: t('All students') },
              { id: 'high', label: t('High risk only') },
              { id: 'medium', label: t('Medium & above') },
              { id: 'low', label: t('Low risk only') },
            ]} />
        </div>
        <table className="table table--students">
          <thead>
            <tr>
              <th>{t('Student')}</th>
              <th>{t('Risk')}</th>
              <th>{t('Sentiment (14d)')}</th>
              <th>{t('Trend')}</th>
              <th>{t('Stress signals')}</th>
              <th style={{ width: 100, textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id}
                  className={s.risk === 'high' ? 'row--flag' : ''}
                  onClick={() => onNavigate({ view: 'student-detail', studentId: s.id, classId: klass.id })}>
                <td>
                  <div className="cell-student">
                    <Avatar name={s.name} size={32} />
                    <div>
                      <div className="cell-student__name">{s.name}</div>
                      <div className="cell-student__id">{t('last active {when}', { when: lastActiveStr(s.lastActiveHours) })}</div>
                    </div>
                  </div>
                </td>
                <td><RiskBadge level={s.risk} /></td>
                <td style={{ width: 220 }}><SentimentMeter value={s.sentiment} /></td>
                <td>
                  <Sparkline data={s.sentimentTrend.map((v) => v + 1)} width={80} height={22}
                    stroke={s.risk === 'high' ? 'var(--risk-high)' : s.risk === 'medium' ? 'var(--risk-medium)' : 'var(--risk-low)'} />
                </td>
                <td>
                  <div className="kw-tags kw-tags--inline">
                    {s.mentalHealthKeywords
                      ? s.mentalHealthKeywords.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 3)
                          .map((k) => <span key={k} className="kw-tag">{k}</span>)
                      : <span className="kw-tag">—</span>
                    }
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="link">{t('View trend')} <Icon name="chevron" size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Mental Health top-level view (class picker) ────────────────────────────

interface ViewMentalHealthProps {
  classes: Klass[];
  onNavigate: (n: NavState) => void;
}

export function ViewMentalHealth({ classes, onNavigate }: ViewMentalHealthProps) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id);
  const klass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const totals = classes.reduce(
    (acc, c) => {
      const r = classRiskDist(c);
      acc.low += r.low;
      acc.medium += r.medium;
      acc.high += r.high;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );
  const totalS = totals.low + totals.medium + totals.high;

  return (
    <div className="view view-mh">
      <div className="view__header">
        <div>
          <h1 className="view__title">{t('Mental health')}</h1>
          <p className="view__sub">{t('Class-level aggregates · raw conversation data is never shown')}</p>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost" onClick={() => showToast(t('Coming soon'))}><Icon name="download" size={14} /> {t('Export aggregate')}</button>
        </div>
      </div>

      <div className="kpi-grid">
        <StatTile label={t('Students monitored')} value={totalS} hint={t('{n} classes', { n: classes.length })} />
        <StatTile label={t('Low risk')}    value={totals.low}    hint={t('{p}% of cohort', { p: Math.round((totals.low / totalS) * 100) })} accent="var(--risk-low)" />
        <StatTile label={t('Medium risk')} value={totals.medium} hint={t('check in this week')}                                              accent="var(--risk-medium)" />
        <StatTile label={t('High risk')}   value={totals.high}   hint={t('reach out today')}                                                 accent="var(--risk-high)" />
      </div>

      <Card padded={false}>
        <div className="class-picker">
          {classes.map((c) => (
            <button key={c.id}
                    className={classNames('class-picker__opt', selectedClassId === c.id && 'class-picker__opt--active')}
                    onClick={() => setSelectedClassId(c.id)}>
              <span className="class-picker__name">{classDisplayName(c)}</span>
              <span className="class-picker__count">{c.students.length}</span>
              <i className={`risk__bullet risk__bullet--${
                classRiskDist(c).high > 0 ? 'high' : classRiskDist(c).medium > 0 ? 'medium' : 'low'
              }`} />
            </button>
          ))}
        </div>
      </Card>

      <ClassMentalHealth klass={klass} onNavigate={onNavigate} />
    </div>
  );
}

export function LegendRow({
  color, label, count, of,
}: { color: string; label: string; count: number; of: number }) {
  return (
    <div className="legend-row">
      <span className="legend-row__dot" style={{ background: color }} />
      <span className="legend-row__lbl">{label}</span>
      <span className="legend-row__count">{count}</span>
      <span className="legend-row__of">/ {of}</span>
    </div>
  );
}
