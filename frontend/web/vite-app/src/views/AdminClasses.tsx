import { useState } from 'react';
import type { Klass, NavState } from '../types';
import { SUBJECTS } from '../lib/data';
import { classMastery, classRiskDist } from '../lib/mastery';
import { classDisplayName, subjectLabel, t } from '../lib/i18n';
import { showToast } from '../lib/toast';
import { pct } from '../lib/format';
import { Card, FilterSelect, Icon, ProgressBar, SubjectChip } from '../components/primitives';

interface ViewAdminClassesProps {
  classes: Klass[];
  onNavigate: (n: NavState) => void;
}

export function ViewAdminClasses({ classes, onNavigate }: ViewAdminClassesProps) {
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);

  const filtered = classes.filter((c) => {
    if (gradeFilter !== 'all' && c.grade !== Number(gradeFilter)) return false;
    if (subjectFilter !== 'all' && c.subjectId !== subjectFilter) return false;
    return true;
  });

  return (
    <div className="view">
      <div className="view__header">
        <div>
          <h1 className="view__title">{t('All Classes')}</h1>
          <p className="view__sub">{t('{n} classes total', { n: classes.length })}</p>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost" onClick={() => showToast(t('Coming soon'))}>
            <Icon name="download" size={14} /> {t('Export Excel')}
          </button>
        </div>
      </div>

      <Card padded={false}>
        <div className="toolbar">
          <span className="toolbar__title">
            {t('{n} classes', { n: filtered.length })}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <FilterSelect
              label={t('Grade')}
              value={gradeFilter}
              onChange={setGradeFilter}
              options={[
                { id: 'all', label: t('All grades') },
                ...grades.map((g) => ({ id: String(g), label: t('Grade {n}', { n: g }) })),
              ]}
            />
            <FilterSelect
              label={t('Subject')}
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={[
                { id: 'all', label: t('All subjects') },
                ...SUBJECTS.map((s) => ({ id: s.id, label: subjectLabel(s) })),
              ]}
            />
          </div>
        </div>
        <table className="table table--admin">
          <thead>
            <tr>
              <th>{t('Class')}</th>
              <th>{t('Subject')}</th>
              <th>{t('Grade')}</th>
              <th>{t('Teacher')}</th>
              <th>{t('Students')}</th>
              <th>{t('Avg. mastery')}</th>
              <th>{t('At-risk')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const subject = SUBJECTS.find((s) => s.id === c.subjectId)!;
              const mastery = classMastery(c);
              const risk = classRiskDist(c);
              return (
                <tr key={c.id} style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate({ view: 'class-detail', classId: c.id })}>
                  <td><b>{classDisplayName(c)}</b></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SubjectChip subject={subject} size="sm" />
                      {subjectLabel(subject)}
                    </div>
                  </td>
                  <td>{t('Grade {n}', { n: c.grade })}</td>
                  <td>{c.teacher ?? '—'}</td>
                  <td>{c.students.length}</td>
                  <td style={{ width: '22%' }}>
                    <div className="cell-mastery">
                      <ProgressBar value={mastery} height={5} />
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct(mastery)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="risk-summary">
                      <i className="risk__bullet risk__bullet--high" />{risk.high}
                      <i className="risk__bullet risk__bullet--medium" style={{ marginLeft: 8 }} />{risk.medium}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="link"
                            onClick={() => onNavigate({ view: 'class-detail', classId: c.id })}>
                      {t('View')} <Icon name="chevron" size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
