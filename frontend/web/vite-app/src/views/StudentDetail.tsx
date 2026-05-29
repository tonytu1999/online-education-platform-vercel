// Student detail — KPIs, 14-day trend, per-subject mastery, mental-health card.

import { useState } from 'react';
import type { Chapter, Klass, NavState, Student, Subject } from '../types';
import { SUBJECTS } from '../lib/data';
import {
  chaptersFor,
  masteryScore,
  pointsFor,
  studentMastery,
} from '../lib/mastery';
import { classDisplayName, chapterLabel, pointLabel, subjectLabel, t } from '../lib/i18n';
import { classNames, fmtMinutes, lastActiveStr, pct } from '../lib/format';
import {
  Avatar,
  Card,
  Icon,
  MasteryDot,
  Pill,
  ProgressBar,
  RiskBadge,
  StatTile,
  SubjectChip,
} from '../components/primitives';
import { SentimentMeter, Sparkline } from '../components/charts';

interface ViewStudentDetailProps {
  student: Student;
  klass: Klass;
  onNavigate: (n: NavState) => void;
}

export function ViewStudentDetail({ student, klass, onNavigate }: ViewStudentDetailProps) {
  const subjectIds: Subject['id'][] = ['math', 'english', 'chinese'];
  const overallMastery = subjectIds
    .map((id) => ({ id, m: studentMastery(student, id) }))
    .filter((x) => pointsFor(x.id).length > 0);
  const avg = overallMastery.reduce((a, x) => a + x.m, 0) / (overallMastery.length || 1);

  return (
    <div className="view view-student">
      <div className="student-hero">
        <Avatar name={student.name} size={64} />
        <div className="student-hero__main">
          <div className="student-hero__crumb">
            <button className="link" onClick={() => onNavigate({ view: 'class-detail', classId: klass.id })}>
              <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} /> {classDisplayName(klass)}
            </button>
          </div>
          <h1 className="student-hero__name">{student.name}</h1>
          <div className="student-hero__meta">
            <span>{classDisplayName(klass)}</span><span className="dot">·</span>
            <span>{t('Joined {date}', { date: student.joined })}</span><span className="dot">·</span>
            <span>{t('Streak {n} days', { n: student.streak })}</span><span className="dot">·</span>
            <span>{t('Last active {when}', { when: lastActiveStr(student.lastActiveHours) })}</span>
          </div>
        </div>
        <div className="student-hero__actions">
          <button className="btn btn--ghost">{t('Message')}</button>
          <button className="btn btn--ghost">{t('Open conversation log')}</button>
        </div>
      </div>

      <div className="kpi-grid">
        <StatTile label={t('Overall mastery')} value={`${pct(avg)}%`} hint={t('across all subjects')} trend={5} />
        <StatTile label={t('Completion rate')} value={`${student.completionRate}%`} hint={t('exercises assigned')} />
        <StatTile label={t('Study time')} value={fmtMinutes(student.studyMinutes)} hint={t('last 7 days')} />
        <StatTile
          label={t('Risk level')}
          value={t(student.risk[0].toUpperCase() + student.risk.slice(1))}
          hint={t('emotional signals')}
          accent={
            student.risk === 'high'
              ? 'var(--risk)'
              : student.risk === 'medium'
              ? 'var(--warn)'
              : 'var(--text)'
          }
        />
      </div>

      <div className="student-grid">
        <div className="student-grid__main">
          <Card>
            <div className="section-head section-head--card">
              <h3>{t('14-day mastery trend')}</h3>
              <span className="hint-muted">{t('All subjects, weighted average')}</span>
            </div>
            <Sparkline data={student.trend} width={760} height={120}
              stroke="var(--accent)" fill="var(--accent-soft)" strokeWidth={2} />
            <div className="trend-axis">
              <span>{t('2 weeks ago')}</span><span>{t('Last week')}</span><span>{t('Today')}</span>
            </div>
          </Card>

          {SUBJECTS.filter((s) => pointsFor(s.id).length > 0).map((subj) => (
            <SubjectMasteryBlock key={subj.id} student={student} subject={subj} chapters={chaptersFor(subj.id)} />
          ))}
        </div>

        <aside className="student-grid__aside">
          <Card>
            <div className="section-head section-head--card">
              <h3>{t('Mental health')}</h3>
              <RiskBadge level={student.risk} />
            </div>
            <div className="mh-section">
              <div className="mh-row">
                <span className="mh-label">{t('Sentiment')}</span>
                <SentimentMeter value={student.sentiment} />
              </div>
              <div className="mh-row mh-row--block">
                <span className="mh-label">{t('14-day sentiment trend')}</span>
                <Sparkline data={student.sentimentTrend.map((v) => v + 1)}
                  width={240} height={40} stroke="var(--risk-medium)" fill="oklch(0.95 0.04 60)" />
              </div>
              <div className="mh-row mh-row--block">
                <span className="mh-label">{t('Recent stress keywords')}</span>
                <div className="kw-tags">
                  <span className="kw-tag">{t('homework load')}</span>
                  <span className="kw-tag">{t('grades')}</span>
                  <span className="kw-tag">{t('sleep')}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="section-head section-head--card">
              <h3>{t('AI summary')}</h3>
              <Pill tone="neutral">{t('auto-generated')}</Pill>
            </div>
            <div className="ai-summary">
              <p>
                <b>{student.name.split(' ')[0]}</b>{' '}
                {avg > 0.7
                  ? t('is performing strongly in {subject}.', { subject: subjectLabel(SUBJECTS.find((s) => s.id === klass.subjectId)!) })
                  : avg > 0.45
                  ? t('is performing around grade level in {subject}.', { subject: subjectLabel(SUBJECTS.find((s) => s.id === klass.subjectId)!) })
                  : t('is performing below grade level in {subject}.', { subject: subjectLabel(SUBJECTS.find((s) => s.id === klass.subjectId)!) })}{' '}
                {t('Most progress this week came from')}{' '}<em>{t('Algebra')}</em>{t(', while')}{' '}
                <em>{t('Geometry')} · {t('Pythagoras')}</em>{' '}{t('is the largest gap.')}
              </p>
              <p>
                {student.streak > 5 ? t('Session quality is consistent;') : t('Session quality is inconsistent;')}{' '}
                {avg > 0.6
                  ? t('Socratic responses suggest good reasoning, with occasional surface answers.')
                  : t('Socratic responses suggest over-reliance on direct prompts.')}
              </p>
              <div className="ai-summary__actions">
                <button className="btn btn--ghost">{t('Suggest practice set')}</button>
                <button className="btn btn--ghost">{t('Adjust mastery')}</button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ─── Subject mastery block ──────────────────────────────────────────────────

function SubjectMasteryBlock({
  student, subject, chapters,
}: { student: Student; subject: Subject; chapters: Chapter[] }) {
  const [open, setOpen] = useState(subject.id === 'math');
  const subjMastery = studentMastery(student, subject.id);
  return (
    <Card padded={false}>
      <button className="subj-head" onClick={() => setOpen(!open)}>
        <SubjectChip subject={subject} size="md" />
        <div className="subj-head__title">
          <div className="subj-head__name">{subjectLabel(subject)}</div>
          <div className="subj-head__sub">
            {t('{n} chapters · {p} points', {
              n: chapters.length,
              p: chapters.reduce((a, c) => a + c.points.length, 0),
            })}
          </div>
        </div>
        <div className="subj-head__pct">{pct(subjMastery)}%</div>
        <div className="subj-head__bar" style={{ width: 200 }}><ProgressBar value={subjMastery} height={5} /></div>
        <Icon name="chevronDown" size={18}
          style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }} />
      </button>

      {open && (
        <div className="subj-body">
          {chapters.map((ch) => {
            let s = 0;
            for (const p of ch.points) s += masteryScore(student.mastery[p.id]);
            const chM = s / ch.points.length;
            return (
              <div key={ch.id} className="ch-block">
                <div className="ch-block__head">
                  <div className="ch-block__name">{chapterLabel(ch.name)}</div>
                  <div className="ch-block__pct">{pct(chM)}%</div>
                </div>
                <div className="ch-block__points">
                  {ch.points.map((p) => {
                    const lvl = student.mastery[p.id] || 'not';
                    return (
                      <div key={p.id} className={classNames('kp-row', `kp-row--${lvl}`)}>
                        <MasteryDot level={lvl} />
                        <span className="kp-row__name">{pointLabel(p.name)}</span>
                        <span className={classNames('kp-row__lbl', `kp-row__lbl--${lvl}`)}>
                          {lvl === 'mastered' ? t('Mastered') : lvl === 'partial' ? t('Partial') : t('Not yet')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
