// Maps real API data to the frontend Klass/Student shape.
// Fields the backend doesn't track (trend, sentiment, mastery charts) are
// generated deterministically from the real ID so they stay consistent across renders.

import type { Klass, MasteryLevel, RiskLevel, Student } from '../types';
import type { ApiClassStat, ApiStudent } from './api';
import { CHAPTERS } from './data';

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMastery(rand: () => number, baseline: number): Record<string, MasteryLevel> {
  const out: Record<string, MasteryLevel> = {};
  const allPoints = (Object.values(CHAPTERS) as { id: string; name: string; points: { id: string }[] }[][])
    .flat()
    .flatMap((ch) => ch.points);
  for (const pt of allPoints) {
    const r = rand() * 0.6 + baseline * 0.4;
    out[pt.id] = r < 0.42 ? 'not' : r < 0.72 ? 'partial' : 'mastered';
  }
  return out;
}

export function buildStudentFromReal(apiStudent: ApiStudent, classId: string): Student {
  const rand = mulberry32(hashSeed(apiStudent.id));
  const baseline = Math.min(0.96, Math.max(0.18, rand() * 0.9 + 0.1));
  const riskRoll = rand();
  const risk: RiskLevel = riskRoll > 0.92 ? 'high' : riskRoll > 0.78 ? 'medium' : 'low';
  const sentiment =
    risk === 'high'   ? -0.4 - rand() * 0.4 :
    risk === 'medium' ? -0.1 + (rand() - 0.5) * 0.3 :
                         0.2 + rand() * 0.5;
  const month = 1 + Math.floor(rand() * 3);
  const day = 8 + Math.floor(rand() * 22);

  return {
    id: apiStudent.id,
    name: apiStudent.name,
    classId,
    joined: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    studyMinutes: Math.round(60 + rand() * 380),
    lastActiveHours: Math.round(rand() * 96),
    baseline,
    mastery: buildMastery(rand, baseline),
    trend: Array.from({ length: 14 }, (_, k) =>
      Math.max(0.05, Math.min(0.98, baseline + (rand() - 0.5) * 0.18 + (k / 14) * 0.08)),
    ),
    risk,
    sentiment,
    sentimentTrend: Array.from({ length: 14 }, () =>
      Math.max(-1, Math.min(1, sentiment + (rand() - 0.5) * 0.3)),
    ),
    streak: Math.round(rand() * 12),
    completionRate: Math.round(baseline * 100 - rand() * 8),
    status: rand() > 0.04 ? 'active' : 'paused',
  };
}

function parseGrade(name: string): number {
  const m = name.match(/\d+/);
  return m ? Math.min(12, Math.max(1, parseInt(m[0]))) : 7;
}

function parseSubjectId(name: string): 'math' | 'english' | 'chinese' {
  const l = name.toLowerCase();
  if (l.includes('english') || l.includes('eng')) return 'english';
  if (l.includes('chinese') || l.includes('cn') || l.includes('语') || l.includes('文')) return 'chinese';
  return 'math';
}

// Build a Klass with real metadata and real (or placeholder) students.
export function buildKlassFromStat(stat: ApiClassStat, students: Student[]): Klass {
  return {
    id: stat.classId,
    name: stat.className,
    subjectId: parseSubjectId(stat.className),
    grade: parseGrade(stat.className),
    room: '',
    term: 'Spring 2026',
    students,
  };
}

// Placeholder students seeded by classId — used before real students are fetched.
export function buildPlaceholderStudents(classId: string, count: number): Student[] {
  return Array.from({ length: count }, (_, i) =>
    buildStudentFromReal({ id: `ph-${classId}-${i}`, name: `Student ${i + 1}` }, classId),
  );
}
