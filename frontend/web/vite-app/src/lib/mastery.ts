// Mastery and class-level math helpers.
import type { Chapter, Klass, KnowledgePoint, MasteryLevel, Student, Subject } from '../types';
import type { ApiSubject } from './api';
import { CHAPTERS } from './data';

// Live curriculum store — starts with hardcoded fallback, replaced when API data loads.
let liveChapters: Record<string, Chapter[]> = CHAPTERS;

function subjectNameToId(name: string): Subject['id'] | null {
  const l = name.toLowerCase();
  if (l.includes('math')) return 'math';
  if (l.includes('english')) return 'english';
  if (l.includes('chinese') || l.includes('语') || l.includes('文')) return 'chinese';
  return null;
}

export function setCurriculum(subjects: ApiSubject[]) {
  const next: Record<string, Chapter[]> = {};
  for (const subj of subjects) {
    const id = subjectNameToId(subj.name);
    if (!id) continue;
    next[id] = subj.chapters.map((ch) => ({
      id: ch.id,
      name: ch.name,
      points: ch.knowledgePoints.map((kp) => ({ id: kp.id, name: kp.name })),
    }));
  }
  if (Object.keys(next).length > 0) liveChapters = next;
}

export function chaptersFor(subjectId: Subject['id']): Chapter[] {
  return liveChapters[subjectId] || [];
}

export function pointsFor(subjectId: Subject['id']): KnowledgePoint[] {
  return chaptersFor(subjectId).flatMap((c) =>
    c.points.map((p) => ({ ...p, chapterId: c.id, chapterName: c.name })),
  );
}

export function masteryScore(level: MasteryLevel | undefined) {
  return level === 'mastered' ? 1 : level === 'partial' ? 0.5 : 0;
}

export function studentMastery(student: Student, subjectId: Subject['id']) {
  const pts = pointsFor(subjectId);
  if (!pts.length) return 0;
  const sum = pts.reduce((acc, p) => acc + masteryScore(student.mastery[p.id]), 0);
  return sum / pts.length;
}

export function classMastery(klass: Klass) {
  const pts = pointsFor(klass.subjectId);
  if (!pts.length) return 0;
  let sum = 0;
  for (const s of klass.students) {
    for (const p of pts) sum += masteryScore(s.mastery[p.id]);
  }
  return sum / (klass.students.length * pts.length);
}

export interface MasteryDist {
  not: number;
  partial: number;
  mastered: number;
  total: number;
}

export function pointMasteryDist(klass: Klass, pointId: string): MasteryDist {
  let not = 0;
  let partial = 0;
  let mastered = 0;
  for (const s of klass.students) {
    const lvl = s.mastery[pointId];
    if (lvl === 'mastered') mastered++;
    else if (lvl === 'partial') partial++;
    else not++;
  }
  const total = klass.students.length || 1;
  return { not: not / total, partial: partial / total, mastered: mastered / total, total };
}

export interface RiskDist {
  low: number;
  medium: number;
  high: number;
  total: number;
  lowP: number;
  mediumP: number;
  highP: number;
}

export function classRiskDist(klass: Klass): RiskDist {
  let low = 0;
  let medium = 0;
  let high = 0;
  for (const s of klass.students) {
    if (s.risk === 'high') high++;
    else if (s.risk === 'medium') medium++;
    else low++;
  }
  const total = klass.students.length || 1;
  return {
    low,
    medium,
    high,
    total,
    lowP: low / total,
    mediumP: medium / total,
    highP: high / total,
  };
}

export function classAvgSentiment(klass: Klass) {
  if (!klass.students.length) return 0;
  return klass.students.reduce((a, s) => a + s.sentiment, 0) / klass.students.length;
}

export function classAvgStudy(klass: Klass) {
  if (!klass.students.length) return 0;
  return Math.round(
    klass.students.reduce((a, s) => a + s.studyMinutes, 0) / klass.students.length,
  );
}
