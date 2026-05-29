// Students directory — searchable, filterable, sortable table.

import { useState } from 'react';
import type { Klass, NavState } from '../types';
import { classDisplayName, t } from '../lib/i18n';
import { showToast } from '../lib/toast';
import { lastActiveStr, pct } from '../lib/format';
import {
  Avatar,
  Card,
  FilterSelect,
  Icon,
  Pill,
  ProgressBar,
  Search,
} from '../components/primitives';

interface ViewStudentsProps {
  classes: Klass[];
  onNavigate: (n: NavState) => void;
}

export function ViewStudents({ classes, onNavigate }: ViewStudentsProps) {
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const all = classes.flatMap((c) =>
    c.students.map((s) => ({ ...s, className: c.name, classSubject: c.subjectId })),
  );
  const filtered = all.filter((s) => {
    if (removedIds.has(s.id)) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (classFilter !== 'all' && s.classId !== classFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    if (sortKey === 'mastery') return b.baseline - a.baseline;
    if (sortKey === 'study') return b.studyMinutes - a.studyMinutes;
    if (sortKey === 'recent') return a.lastActiveHours - b.lastActiveHours;
    return 0;
  });

  function confirmRemove(id: string) {
    setRemovedIds((prev) => new Set([...prev, id]));
    setPendingRemoveId(null);
  }

  return (
    <div className="view view-students">
      <div className="view__header">
        <div>
          <h1 className="view__title">{t('Students')}</h1>
          <p className="view__sub">
            {t('{n} of {n2} students', { n: sorted.length, n2: all.length - removedIds.size })} · {t('{n} classes', { n: classes.length })}
          </p>
        </div>
        <div className="view__actions">
          <button className="btn btn--ghost" onClick={() => showToast(t('Coming soon'))}><Icon name="download" /> {t('Export')}</button>
          <button className="btn btn--primary" onClick={() => showToast(t('Coming soon'))}><Icon name="plus" /> {t('Invite by class code')}</button>
        </div>
      </div>

      <Card padded={false}>
        <div className="toolbar">
          <Search value={query} onChange={setQuery} placeholder={t('Search by student name…')} />
          <div className="toolbar__filters">
            <FilterSelect label={t('Class')} value={classFilter} onChange={setClassFilter}
              options={[
                { id: 'all', label: t('All classes') },
                ...classes.map((c) => ({ id: c.id, label: classDisplayName(c) })),
              ]} />
            <FilterSelect label={t('Status')} value={statusFilter} onChange={setStatusFilter}
              options={[
                { id: 'all', label: t('All') },
                { id: 'active', label: t('Active') },
                { id: 'paused', label: t('Paused') },
              ]} />
            <FilterSelect label={t('Sort')} value={sortKey} onChange={setSortKey}
              options={[
                { id: 'name', label: t('Name') },
                { id: 'mastery', label: t('Mastery (high → low)') },
                { id: 'study', label: t('Study time') },
                { id: 'recent', label: t('Recently active') },
              ]} />
          </div>
        </div>

        <table className="table table--students">
          <thead>
            <tr>
              <th>{t('Student')}</th>
              <th>{t('Class')}</th>
              <th>{t('Joined')}</th>
              <th>{t('Last active')}</th>
              <th>{t('Mastery')}</th>
              <th>{t('Status')}</th>
              <th style={{ width: 110, textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} onClick={() => onNavigate({ view: 'student-detail', studentId: s.id, classId: s.classId })}>
                <td>
                  <div className="cell-student">
                    <Avatar name={s.name} size={32} />
                    <div>
                      <div className="cell-student__name">{s.name}</div>
                      <div className="cell-student__id">{s.id.replace('s-', '#')}</div>
                    </div>
                  </div>
                </td>
                <td>{classDisplayName({ name: s.className })}</td>
                <td>{s.joined}</td>
                <td>{lastActiveStr(s.lastActiveHours)}</td>
                <td style={{ width: 200 }}>
                  <div className="cell-mastery">
                    <ProgressBar value={s.baseline} height={5} />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct(s.baseline)}%</span>
                  </div>
                </td>
                <td><Pill tone={s.status === 'active' ? 'positive' : 'neutral'}>{t(s.status)}</Pill></td>
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
                      onClick={() => setPendingRemoveId(s.id)}
                    >
                      {t('Remove')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table__foot">
          <span>{t('{n} of {n2} students', { n: sorted.length, n2: all.length - removedIds.size })}</span>
        </div>
      </Card>
    </div>
  );
}