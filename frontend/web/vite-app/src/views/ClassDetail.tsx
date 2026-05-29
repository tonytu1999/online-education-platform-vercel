// Class detail view: tabs for Mastery / Students / Mental Health / Activity.

import { useState } from 'react';
import type { Klass, NavState } from '../types';
import { SUBJECTS, ACTIVITY_FEED } from '../lib/data';
import {
  chaptersFor,
  classAvgStudy,
  classMastery,
  classRiskDist,
  masteryScore,
  pointMasteryDist,
  pointsFor,
  studentMastery,
} from '../lib/mastery';
import { chapterLabel, classDisplayName, subjectLabel, t, termLabel } from '../lib/i18n';
import { showToast } from '../lib/toast';
import { classNames, fmtMinutes, lastActiveStr, pct } from '../lib/format';
import {
  Avatar,
  Card,
  EmptyState,
  FilterSelect,
  Icon,
  ProgressBar,
  RiskBadge,
  SubjectChip,
  Tabs,
} from '../components/primitives';
import { MasteryHeatmap, PointMasteryRow, Sparkline } from '../components/charts';
import { ClassMentalHealth } from './MentalHealth';
import { ActivityItem } from './Dashboard';

interface ViewClassDetailProps {
  klass: Klass;
  onNavigate: (n: NavState) => void;
  focusPointId?: string;
  tweak: { chartStyle: 'stacked' | 'split' };
}

export function ViewClassDetail({ klass, onNavigate, focusPointId, tweak }: ViewClassDetailProps) {
  const [tab, setTab] = useState('mastery');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [sortStudents, setSortStudents] = useState('mastery');

  const subject = SUBJECTS.find((s) => s.id === klass.subjectId)!;
  const chapters = chaptersFor(klass.subjectId);
  const points = pointsFor(klass.subjectId).filter(
    (p) => chapterFilter === 'all' || p.chapterId === chapterFilter,
  );
  const mastery = classMastery(klass);
  const risk = classRiskDist(klass);
  const avgStudy = classAvgStudy(klass);

  const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sortedStudents = [...klass.students].sort((a, b) => {
    if (sortStudents === 'name') return a.name.localeCompare(b.name);
    if (sortStudents === 'mastery') return b.baseline - a.baseline;
    if (sortStudents === 'low-mastery') return a.baseline - b.baseline;
    if (sortStudents === 'risk') return riskOrder[a.risk] - riskOrder[b.risk];
    return 0;
  });

  return (
    <div className="view view-class">
      <div className="class-hero">
        <div className="class-hero__main">
          <SubjectChip subject={subject} size="lg" />
          <div>
            <div className="class-hero__crumbs">
              {t('{subject} · Grade {grade} · {room} · {term}', {
                subject: subjectLabel(subject),
                grade: klass.grade,
                room: klass.room,
                term: termLabel(),
              })}
            </div>
            <h1 className="class-hero__title">{classDisplayName(klass)}</h1>
            <div className="class-hero__meta">
              <span><Icon name="users" size={14} /> {t('{n} students', { n: klass.students.length })}</span>
              <span><Icon name="book" size={14} /> {t('{c} chapters · {p} knowledge points', { c: chapters.length, p: pointsFor(klass.subjectId).length })}</span>
              <span><Icon name="sparkles" size={14} /> {t('{n}m avg study/week', { n: avgStudy })}</span>
            </div>
          </div>
        </div>
        <div className="class-hero__metrics">
          <div className="class-hero__metric">
            <div className="class-hero__metric-num">{pct(mastery)}%</div>
            <div className="class-hero__metric-lbl">{t('Avg. mastery')}</div>
            <ProgressBar value={mastery} height={4} />
          </div>
          <div className="class-hero__metric">
            <div className="class-hero__metric-num">{risk.medium + risk.high}</div>
            <div className="class-hero__metric-lbl">{t('Need attention')}</div>
            <div className="class-hero__risk-bar">
              <span style={{ background: 'var(--risk-low)',    flex: risk.low }} />
              <span style={{ background: 'var(--risk-medium)', flex: risk.medium }} />
              <span style={{ background: 'var(--risk-high)',   flex: risk.high }} />
            </div>
          </div>
        </div>
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'mastery',  label: t('Knowledge mastery'), count: pointsFor(klass.subjectId).length },
        { id: 'students', label: t('Students'),          count: klass.students.length },
        { id: 'mental',   label: t('Mental health') },
        { id: 'activity', label: t('Activity') },
      ]} />

      {tab === 'mastery' && (
        <div className="class-detail-grid">
          <aside className="class-chapter-rail">
            <div className="rail-title">{t('Chapters')}</div>
            <button className={classNames('chapter-row', chapterFilter === 'all' && 'chapter-row--active')}
                    onClick={() => setChapterFilter('all')}>
              <span>{t('All chapters')}</span>
              <span className="chapter-row__pct">{pct(mastery)}%</span>
            </button>
            {chapters.map((ch) => {
              let s = 0;
              for (const st of klass.students) for (const p of ch.points) s += masteryScore(st.mastery[p.id]);
              const chMastery = s / (klass.students.length * ch.points.length || 1);
              return (
                <button key={ch.id}
                        className={classNames('chapter-row', chapterFilter === ch.id && 'chapter-row--active')}
                        onClick={() => setChapterFilter(ch.id)}>
                  <div>
                    <div className="chapter-row__name">{chapterLabel(ch.name)}</div>
                    <div className="chapter-row__sub">{t('{n} points', { n: ch.points.length })}</div>
                  </div>
                  <div className="chapter-row__right">
                    <span className="chapter-row__pct">{pct(chMastery)}%</span>
                    <ProgressBar value={chMastery} height={3} />
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="class-detail-main">
            <Card padded={false}>
              <div className="card-head card-head--with-tools">
                <div>
                  <h3 style={{ margin: 0 }}>{t('Mastery by knowledge point')}</h3>
                  <div className="hint-muted">{t('Click a row to drill in')}</div>
                </div>
                <div className="legend">
                  <span><i className="dotswatch dotswatch--mastered" /> {t('Mastered')}</span>
                  <span><i className="dotswatch dotswatch--partial" /> {t('Partial')}</span>
                  <span><i className="dotswatch dotswatch--not" /> {t('Not yet')}</span>
                </div>
              </div>
              <div className="pmr-list">
                {points.map((p) => (
                  <PointMasteryRow key={p.id} point={p}
                                   dist={pointMasteryDist(klass, p.id)}
                                   mode={tweak.chartStyle === 'split' ? 'split' : 'stacked'}
                                   isFocus={focusPointId === p.id} />
                ))}
              </div>
            </Card>

            <Card padded={false} className="hm-card">
              <div className="card-head card-head--with-tools">
                <div>
                  <h3 style={{ margin: 0 }}>{t('Student × knowledge point heatmap')}</h3>
                  <div className="hint-muted">{t('Each cell shows one student\u2019s mastery of one knowledge point')}</div>
                </div>
                <FilterSelect label={t('Sort students by')} value={sortStudents} onChange={setSortStudents}
                  options={[
                    { id: 'mastery', label: t('Mastery (high → low)') },
                    { id: 'low-mastery', label: t('Mastery (low → high)') },
                    { id: 'name', label: t('Name') },
                    { id: 'risk', label: t('Risk level') },
                  ]} />
              </div>
              <div className="hm-scroll">
                <MasteryHeatmap
                  students={sortedStudents.slice(0, 14)}
                  points={points}
                  focusPointId={focusPointId}
                  onCell={(s) => onNavigate({ view: 'student-detail', studentId: s.id, classId: klass.id })}
                />
                {sortedStudents.length > 14 && (
                  <div className="hm-more">
                    {t('Showing 14 of {n} students · scroll or open student detail', { n: sortedStudents.length })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'students' && <ClassStudentsList klass={klass} onNavigate={onNavigate} />}
      {tab === 'mental' && <ClassMentalHealth klass={klass} onNavigate={onNavigate} />}
      {tab === 'activity' && (
        <Card>
          <div className="activity">
            {ACTIVITY_FEED.filter((a) => a.classId === klass.id).map((a, i) => (
              <ActivityItem key={i} item={a} onNavigate={onNavigate} />
            ))}
            {ACTIVITY_FEED.filter((a) => a.classId === klass.id).length === 0 && (
              <EmptyState title={t('No recent activity')} body={t('Student events will appear here as they happen.')} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Class students list (used inside ClassDetail tabs) ──────────────────────

function ClassStudentsList({ klass, onNavigate }: { klass: Klass; onNavigate: (n: NavState) => void }) {
  const [sort, setSort] = useState('mastery');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const subject = SUBJECTS.find((s) => s.id === klass.subjectId)!;
  const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const visible = klass.students.filter((s) => !removedIds.has(s.id));
  const sorted = [...visible].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'mastery') return b.baseline - a.baseline;
    if (sort === 'low-mastery') return a.baseline - b.baseline;
    if (sort === 'study') return b.studyMinutes - a.studyMinutes;
    if (sort === 'risk') return riskOrder[a.risk] - riskOrder[b.risk];
    return 0;
  });

  function confirmRemove(id: string) {
    setRemovedIds((prev) => new Set([...prev, id]));
    setPendingRemoveId(null);
  }

  return (
    <Card padded={false}>
      <div className="toolbar">
        <span className="toolbar__title">
          {t('{n} students · {subject}', { n: visible.length, subject: subjectLabel(subject) })}
        </span>
        <FilterSelect label={t('Sort')} value={sort} onChange={setSort}
          options={[
            { id: 'mastery', label: t('Mastery (high → low)') },
            { id: 'low-mastery', label: t('Mastery (low → high)') },
            { id: 'name', label: t('Name') },
            { id: 'study', label: t('Study time') },
            { id: 'risk', label: t('Risk level') },
          ]} />
      </div>
      <table className="table table--students">
        <thead>
          <tr>
            <th>{t('Student')}</th>
            <th>{t('Mastery in {subject}', { subject: subjectLabel(subject) })}</th>
            <th>{t('14-day trend')}</th>
            <th>{t('Study time')}</th>
            <th>{t('Last active')}</th>
            <th>{t('Risk')}</th>
            <th style={{ width: 110, textAlign: 'right' }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id} onClick={() => onNavigate({ view: 'student-detail', studentId: s.id, classId: klass.id })}>
              <td>
                <div className="cell-student">
                  <Avatar name={s.name} size={32} />
                  <div>
                    <div className="cell-student__name">{s.name}</div>
                    <div className="cell-student__id">{t('streak {n}d', { n: s.streak })}</div>
                  </div>
                </div>
              </td>
              <td style={{ width: 240 }}>
                <div className="cell-mastery">
                  <ProgressBar value={studentMastery(s, klass.subjectId)} height={5} />
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct(studentMastery(s, klass.subjectId))}%</span>
                </div>
              </td>
              <td><Sparkline data={s.trend} width={80} height={22} /></td>
              <td>{fmtMinutes(s.studyMinutes)}</td>
              <td>{lastActiveStr(s.lastActiveHours)}</td>
              <td><RiskBadge level={s.risk} /></td>
              <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                {pendingRemoveId === s.id ? (
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <button
                      className="btn btn--ghost"
                      style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--risk-high)' }}
                      onClick={() => confirmRemove(s.id)}
                    >
                      {t('Confirm')}
                    </button>
                    <button
                      className="btn btn--ghost"
                      style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => setPendingRemoveId(null)}
                    >
                      {t('Cancel')}
                    </button>
                  </span>
                ) : (
                  <button
                    className="link"
                    style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                    onClick={() => showToast(t('Coming soon'))}
                  >
                    {t('Remove')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
