// School Admin overview — school-wide KPIs, engagement chart,
// mental-health snapshot, grade table, per-subject cards.

import type { Klass, NavState } from '../types';
import { SUBJECTS, SCHOOL, SCHOOL_WEEKLY } from '../lib/data';
import { classMastery, classRiskDist } from '../lib/mastery';
import { gradesLabel, schoolName, subjectLabel, t, termLabel } from '../lib/i18n';
import { pct } from '../lib/format';
import {
  Card,
  Icon,
  ProgressBar,
  StatTile,
  SubjectChip,
} from '../components/primitives';
import { AreaChart, BarChart, Donut } from '../components/charts';
import { LegendRow } from './MentalHealth';

interface ViewAdminSchoolProps {
  classes: Klass[];
  onNavigate: (n: NavState) => void;
  schoolNameOverride?: string;
}

export function ViewAdminSchool({ classes, schoolNameOverride }: ViewAdminSchoolProps) {
  const total = classes.reduce((a, c) => a + c.students.length, 0);
  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);

  const byGrade = grades.map((g) => {
    const inGrade = classes.filter((c) => c.grade === g);
    const students = inGrade.reduce((a, c) => a + c.students.length, 0);
    const mastery = inGrade.reduce((a, c) => a + classMastery(c) * c.students.length, 0) / (students || 1);
    const risk = inGrade.reduce(
      (acc, c) => {
        const r = classRiskDist(c);
        acc.low += r.low;
        acc.medium += r.medium;
        acc.high += r.high;
        return acc;
      },
      { low: 0, medium: 0, high: 0 },
    );
    return { grade: g, label: t('Grade {n}', { n: g }), students, mastery, classes: inGrade.length, risk };
  });

  const totalRisk = byGrade.reduce(
    (acc, g) => {
      acc.low += g.risk.low;
      acc.medium += g.risk.medium;
      acc.high += g.risk.high;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );

  const avgSchoolMastery = byGrade.reduce((a, g) => a + g.mastery * g.students, 0) / (total || 1);

  const bySubject = SUBJECTS.map((subj) => {
    const inSubj = classes.filter((c) => c.subjectId === subj.id);
    if (!inSubj.length) return null;
    const students = inSubj.reduce((a, c) => a + c.students.length, 0);
    const mastery = inSubj.reduce((a, c) => a + classMastery(c) * c.students.length, 0) / (students || 1);
    return { subject: subj, mastery, students, classes: inSubj.length };
  }).filter(Boolean) as Array<{ subject: typeof SUBJECTS[number]; mastery: number; students: number; classes: number }>;

  return (
    <div className="view view-admin">
      <div className="view__header">
        <div>
          <h1 className="view__title">{schoolNameOverride ?? schoolName()}</h1>
          <p className="view__sub">
            {t('{term} · {students} students · {teachers} teachers · {grades}', {
              term: termLabel(),
              students: SCHOOL.studentCount,
              teachers: SCHOOL.teacherCount,
              grades: gradesLabel(),
            })}
          </p>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost"><Icon name="filter" size={14} /> {t('Filter')}</button>
          <button className="btn btn--ghost"><Icon name="download" size={14} /> {t('Export Excel')}</button>
        </div>
      </div>

      <div className="kpi-grid">
        <StatTile label={t('Students enrolled')} value={total} hint={t('{n} classes', { n: classes.length })} />
        <StatTile label={t('School avg. mastery')} value={`${pct(avgSchoolMastery)}%`} hint={t('vs. last term')} trend={6} />
        <StatTile label={t('Active this week')} value={`${pct(0.83)}%`} hint={t('of enrolled students')} trend={2} />
        <StatTile label={t('At-risk students')} value={totalRisk.medium + totalRisk.high}
                  hint={t('{h} high · {m} medium', { h: totalRisk.high, m: totalRisk.medium })} accent="var(--risk)" />
      </div>

      <div className="admin-grid">
        <Card className="admin-engage">
          <div className="section-head section-head--card">
            <h3>{t('School-wide engagement')}</h3>
            <div className="legend">
              <span className="legend__dot" style={{ background: 'var(--accent)' }} /> {t('Active students')}
            </div>
          </div>
          <AreaChart data={SCHOOL_WEEKLY} accessor={(d) => d.activeStudents} height={180} />
          <div className="admin-engage__foot">
            <span>{t('4 weeks rolling · daily active students')}</span>
            <span>{t('{n} peak day', { n: Math.max(...SCHOOL_WEEKLY.map((d) => d.activeStudents)) })}</span>
          </div>
        </Card>

        <Card>
          <div className="section-head section-head--card">
            <h3>{t('Mental health snapshot')}</h3>
            <span className="hint-muted">{t('Aggregate only')}</span>
          </div>
          <div className="riskdonut-wrap">
            <Donut
              size={132}
              thickness={18}
              segments={[
                { value: totalRisk.low,    color: 'var(--risk-low)' },
                { value: totalRisk.medium, color: 'var(--risk-medium)' },
                { value: totalRisk.high,   color: 'var(--risk-high)' },
              ]}
              center={
                <div>
                  <div className="donut__center-num">{Math.round((totalRisk.low / (total || 1)) * 100)}%</div>
                  <div className="donut__center-lbl">{t('low risk')}</div>
                </div>
              }
            />
            <div className="riskdonut-legend">
              <LegendRow color="var(--risk-low)"    label={t('Low')}    count={totalRisk.low}    of={total} />
              <LegendRow color="var(--risk-medium)" label={t('Medium')} count={totalRisk.medium} of={total} />
              <LegendRow color="var(--risk-high)"   label={t('High')}   count={totalRisk.high}   of={total} />
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="section-head section-head--card" style={{ padding: '14px 20px' }}>
          <h3>{t('Grade-level breakdown')}</h3>
          <span className="hint-muted">{t('Average knowledge-point mastery')}</span>
        </div>
        <BarChart data={byGrade} accessor={(g) => g.mastery * 100} labelKey="label" height={140} color="var(--accent)" />
        <table className="table table--admin">
          <thead>
            <tr>
              <th>{t('Grade')}</th>
              <th>{t('Classes')}</th>
              <th>{t('Students')}</th>
              <th>{t('Avg. mastery')}</th>
              <th>{t('At-risk')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {byGrade.map((g) => (
              <tr key={g.grade}>
                <td><b>{g.label}</b></td>
                <td>{g.classes}</td>
                <td>{g.students}</td>
                <td style={{ width: '32%' }}>
                  <div className="cell-mastery">
                    <ProgressBar value={g.mastery} height={6} />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct(g.mastery)}%</span>
                  </div>
                </td>
                <td>
                  <span className="risk-summary">
                    <i className="risk__bullet risk__bullet--high" />{g.risk.high}
                    <i className="risk__bullet risk__bullet--medium" style={{ marginLeft: 12 }} />{g.risk.medium}
                  </span>
                </td>
                <td><button className="link">{t('View grade')} <Icon name="chevron" size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="admin-subject-grid">
        {bySubject.map((s) => (
          <Card key={s.subject.id} className="subject-card">
            <div className="subject-card__head">
              <SubjectChip subject={s.subject} size="md" />
              <div>
                <div className="subject-card__name">{subjectLabel(s.subject)}</div>
                <div className="subject-card__sub">
                  {t('{n} classes', { n: s.classes })} · {t('{n} students', { n: s.students })}
                </div>
              </div>
            </div>
            <div className="subject-card__metric">
              <div className="subject-card__pct">{pct(s.mastery)}%</div>
              <div className="subject-card__metric-lbl">{t('Avg. mastery')}</div>
            </div>
            <ProgressBar value={s.mastery} height={5} />
          </Card>
        ))}
      </div>
    </div>
  );
}
