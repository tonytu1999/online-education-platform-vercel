// Classes index — grid of all classes with subject + grade filters.

import { useState } from 'react';
import type { Klass, NavState } from '../types';
import { SUBJECTS } from '../lib/data';
import { subjectLabel, t } from '../lib/i18n';
import { FilterSelect, Icon } from '../components/primitives';
import { ClassCard } from './Dashboard';

interface ViewClassesIndexProps {
  classes: Klass[];
  onNavigate: (n: NavState) => void;
}

export function ViewClassesIndex({ classes, onNavigate }: ViewClassesIndexProps) {
  const [subj, setSubj] = useState('all');
  const [grade, setGrade] = useState('all');

  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);
  const filtered = classes.filter((c) =>
    (subj === 'all' || c.subjectId === subj) &&
    (grade === 'all' || String(c.grade) === grade),
  );

  return (
    <div className="view view-classes">
      <div className="view__header">
        <div>
          <h1 className="view__title">{t('Classes')}</h1>
          <p className="view__sub">
            {t('{n} classes · {m} students', {
              n: classes.length,
              m: classes.reduce((a, c) => a + c.students.length, 0),
            })}
          </p>
        </div>
        <div className="view__actions">
          <FilterSelect
            label={t('Subject')}
            value={subj}
            onChange={setSubj}
            options={[
              { id: 'all', label: t('All subjects') },
              ...SUBJECTS.map((s) => ({ id: s.id, label: subjectLabel(s) })),
            ]}
          />
          <FilterSelect
            label={t('Grade')}
            value={grade}
            onChange={setGrade}
            options={[
              { id: 'all', label: t('All grades') },
              ...grades.map((g) => ({ id: String(g), label: t('Grade {n}', { n: g }) })),
            ]}
          />
          <button className="btn btn--primary"><Icon name="plus" /> {t('Create class')}</button>
        </div>
      </div>

      <div className="classcard-grid classcard-grid--wide">
        {filtered.map((c) => (
          <ClassCard key={c.id} klass={c}
            onClick={() => onNavigate({ view: 'class-detail', classId: c.id })} />
        ))}
      </div>
    </div>
  );
}
