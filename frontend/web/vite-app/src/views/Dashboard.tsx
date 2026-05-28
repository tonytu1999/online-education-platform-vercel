// Teacher Dashboard view + helpers (ClassCard, NeedsReview, ActivityItem).

import type { ActivityEntry, Klass, NavState, UserProfile } from '../types';
import { SUBJECTS, ACTIVITY_FEED } from '../lib/data';
import {
  classMastery,
  classRiskDist,
  classAvgStudy,
  pointsFor,
  pointMasteryDist,
} from '../lib/mastery';
import { classDisplayName, subjectLabel, t } from '../lib/i18n';
import { lastActiveStr, pct } from '../lib/format';
import {
  Avatar,
  Card,
  EmptyState,
  Icon,
  Pill,
  ProgressBar,
  RiskBadge,
  StatTile,
  SubjectChip,
} from '../components/primitives';
import { Sparkline, StackedMasteryBar } from '../components/charts';

interface ViewProps {
  classes: Klass[];
  onNavigate: (next: NavState) => void;
  profile: UserProfile;
  tweak: { chartStyle: 'stacked' | 'split' };
}

export function ViewDashboard({ classes, onNavigate, profile }: ViewProps) {
  const totalStudents = classes.reduce((a, c) => a + c.students.length, 0);
  const avgMastery = classes.reduce((a, c) => a + classMastery(c), 0) / (classes.length || 1);
  const atRisk = classes.reduce(
    (a, c) => a + c.students.filter((s) => s.risk !== 'low').length,
    0,
  );
  const activeWeek = classes.reduce(
    (a, c) => a + c.students.filter((s) => s.lastActiveHours < 168).length,
    0,
  );

  const allRisky = classes
    .flatMap((c) =>
      c.students
        .filter((s) => s.risk !== 'low' && !s.id.startsWith('ph-'))
        .map((s) => ({ ...s, className: c.name })),
    )
    .sort((a, b) => Number(b.risk === 'high') - Number(a.risk === 'high'))
    .slice(0, 4);

  return (
    <div className="view view-dashboard">
      <div className="view__header">
        <div>
          <h1 className="view__title">{t('Welcome back, {name}.', { name: profile.name })}</h1>
          <p className="view__sub">{t('Here\u2019s how your {n} classes are tracking this week.', { n: classes.length })}</p>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="download" /> {t('Export report')}</button>
          <button className="btn btn--primary"><Icon name="plus" /> {t('New assessment')}</button>
        </div>
      </div>

      <div className="kpi-grid">
        <StatTile label={t('Students')} value={totalStudents}
                  hint={t('{n} active this week', { n: activeWeek })} trend={4} />
        <StatTile label={t('Avg. mastery')} value={`${pct(avgMastery)}%`}
                  hint={t('vs. last week')} trend={3} />
        <StatTile label={t('Engagement')} value={`${pct(activeWeek / totalStudents)}%`}
                  hint={t('active in last 7 days')} trend={-1} />
        <StatTile label={t('Need attention')} value={atRisk}
                  hint={t('emotional or academic')} accent="var(--risk)" />
      </div>

      <div className="dash-grid">
        <section className="dash-col dash-col--main">
          <div className="section-head">
            <h2>{t('My Classes')}</h2>
            <button className="link" onClick={() => onNavigate({ view: 'classes' })}>
              {t('View all')} <Icon name="chevron" size={14} />
            </button>
          </div>
          <div className="classcard-grid">
            {classes.map((c) => (
              <ClassCard key={c.id} klass={c}
                onClick={() => onNavigate({ view: 'class-detail', classId: c.id })} />
            ))}
          </div>

          <div className="section-head" style={{ marginTop: 28 }}>
            <h2>{t('Knowledge points needing review')}</h2>
            <span className="hint-muted">{t('Across all your classes')}</span>
          </div>
          <NeedsReview classes={classes} onNavigate={onNavigate} />
        </section>

        <aside className="dash-col dash-col--aside">
          <Card>
            <div className="section-head section-head--card">
              <h3>{t('Students to check in on')}</h3>
              <RiskBadge level="high" dot />
            </div>
            <div className="risk-list">
              {allRisky.length === 0 && (
                <EmptyState title={t('All clear')} body={t('No flagged students this week.')} />
              )}
              {allRisky.map((s) => (
                <button key={s.id} className="risk-list__item"
                  onClick={() => onNavigate({ view: 'student-detail', studentId: s.id, classId: s.classId })}>
                  <Avatar name={s.name} size={32} />
                  <div className="risk-list__meta">
                    <div className="risk-list__name">{s.name}</div>
                    <div className="risk-list__class">
                      {classDisplayName({ name: s.className })} · {t('last active {when}', { when: lastActiveStr(s.lastActiveHours) })}
                    </div>
                  </div>
                  <RiskBadge level={s.risk} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="section-head section-head--card">
              <h3>{t('Recent activity')}</h3>
            </div>
            <div className="activity">
              {ACTIVITY_FEED.map((a, i) => <ActivityItem key={i} item={a} onNavigate={onNavigate} />)}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ─── ClassCard ────────────────────────────────────────────────────────────────

export function ClassCard({ klass, onClick }: { klass: Klass; onClick: () => void }) {
  const subject = SUBJECTS.find((s) => s.id === klass.subjectId)!;
  const mastery = classMastery(klass);
  const avgStudy = classAvgStudy(klass);
  const risk = classRiskDist(klass);
  const trend = Array.from({ length: 14 }, (_, i) =>
    klass.students.reduce((a, s) => a + s.trend[i], 0) / klass.students.length,
  );

  return (
    <Card hover onClick={onClick} className="classcard">
      <div className="classcard__head">
        <SubjectChip subject={subject} size="md" />
        <div className="classcard__title">
          <div className="classcard__name">{classDisplayName(klass)}</div>
          <div className="classcard__sub">
            {subjectLabel(subject)} · {t('{n} students', { n: klass.students.length })} · {klass.room}
          </div>
        </div>
      </div>

      <div className="classcard__metric">
        <div className="classcard__pct">{pct(mastery)}%</div>
        <div className="classcard__metric-label">{t('Avg. mastery')}</div>
      </div>

      <ProgressBar value={mastery} height={6} />

      <div className="classcard__footer">
        <div className="classcard__chip">
          <Icon name="users" size={14} /> <span>{t('{n}m avg/wk', { n: avgStudy })}</span>
        </div>
        {risk.medium + risk.high > 0 ? (
          <div className="classcard__chip">
            <i className={`risk__bullet risk__bullet--${risk.high > 0 ? 'high' : 'medium'}`} />
            <span>{t('{n} need check-in', { n: risk.medium + risk.high })}</span>
          </div>
        ) : (
          <div className="classcard__chip classcard__chip--ok">
            <Icon name="check" size={14} /> <span>{t('All settled')}</span>
          </div>
        )}
        <Sparkline data={trend} width={64} height={22} stroke="var(--accent)" fill="var(--accent-soft)" />
      </div>
    </Card>
  );
}

// ─── NeedsReview ─────────────────────────────────────────────────────────────

function NeedsReview({ classes, onNavigate }: { classes: Klass[]; onNavigate: (n: NavState) => void }) {
  const rows = classes.flatMap((c) =>
    pointsFor(c.subjectId).map((p) => {
      const dist = pointMasteryDist(c, p.id);
      return {
        classId: c.id,
        className: c.name,
        point: p,
        dist,
        score: dist.mastered + dist.partial * 0.5,
      };
    }),
  );
  rows.sort((a, b) => a.score - b.score);
  const worst = rows.slice(0, 5);

  return (
    <Card padded={false}>
      <table className="table">
        <thead>
          <tr>
            <th>{t('Knowledge point')}</th>
            <th>{t('Class')}</th>
            <th style={{ width: '40%' }}>{t('Mastery breakdown')}</th>
            <th style={{ textAlign: 'right' }}>{t('Score')}</th>
          </tr>
        </thead>
        <tbody>
          {worst.map((r, i) => (
            <tr key={i} onClick={() => onNavigate({ view: 'class-detail', classId: r.classId, focusPointId: r.point.id })}>
              <td>
                <div className="table__primary">{t(r.point.name)}</div>
                <div className="table__sub">{r.point.chapterName ? t(r.point.chapterName) : ''}</div>
              </td>
              <td><Pill tone="neutral">{classDisplayName({ name: r.className })}</Pill></td>
              <td><StackedMasteryBar dist={r.dist} /></td>
              <td style={{ textAlign: 'right' }}>
                <b style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.score * 100)}%</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── ActivityItem ────────────────────────────────────────────────────────────

export function ActivityItem({ item, onNavigate }: { item: ActivityEntry; onNavigate: (n: NavState) => void }) {
  const kindIcons: Record<string, { icon: string; tone: string }> = {
    'mastery-up':   { icon: '▲', tone: 'positive' },
    'mastery-down': { icon: '▼', tone: 'risk' },
    'risk-up':      { icon: '!', tone: 'risk' },
    'assessment':   { icon: '✓', tone: 'accent' },
    'joined':       { icon: '+', tone: 'neutral' },
  };
  const k = kindIcons[item.kind] || kindIcons.joined;
  const detail = (() => {
    const m1 = /^completed (Algebra|Geometry) assessment \((\d+)%\)$/.exec(item.detail);
    if (m1) return t(`completed ${m1[1]} assessment ({score}%)`, { score: m1[2] });
    return t(item.detail);
  })();
  return (
    <button className="activity__item"
      onClick={() => item.classId && onNavigate({ view: 'class-detail', classId: item.classId })}>
      <span className={`activity__icon activity__icon--${k.tone}`}>{k.icon}</span>
      <div className="activity__body">
        <div><b>{item.who}</b> {detail}</div>
        <div className="activity__when">{item.when}</div>
      </div>
    </button>
  );
}
