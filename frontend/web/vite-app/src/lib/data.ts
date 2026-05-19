// Mock data for the Lumen Teacher / School Web prototype.
// Replace with real API calls once a backend is wired up.

import type {
  ActivityEntry,
  Chapter,
  Klass,
  MasteryLevel,
  RiskLevel,
  Student,
  Subject,
} from '../types';

export const SCHOOL = {
  name: 'Lakeside International School',
  shortName: 'Lakeside',
  term: 'Spring 2026',
  studentCount: 642,
  teacherCount: 38,
  gradesCovered: 'G6 – G9',
};

export const SUBJECTS: Subject[] = [
  { id: 'math',    label: 'Mathematics', glyph: '∑', tone: 'blue' },
  { id: 'english', label: 'English',     glyph: 'A', tone: 'amber' },
  { id: 'chinese', label: 'Chinese',     glyph: '文', tone: 'green' },
];

export const CHAPTERS: Record<Subject['id'], Chapter[]> = {
  math: [
    { id: 'm-num', name: 'Numbers & Operations', points: [
      { id: 'm-num-1', name: 'Integers & negatives' },
      { id: 'm-num-2', name: 'Fractions & decimals' },
      { id: 'm-num-3', name: 'Percent & ratio' },
      { id: 'm-num-4', name: 'Prime factorisation' },
      { id: 'm-num-5', name: 'Order of operations' },
    ]},
    { id: 'm-alg', name: 'Algebra', points: [
      { id: 'm-alg-1', name: 'Linear expressions' },
      { id: 'm-alg-2', name: 'Solving linear equations' },
      { id: 'm-alg-3', name: 'Inequalities' },
      { id: 'm-alg-4', name: 'Systems of equations' },
      { id: 'm-alg-5', name: 'Quadratic factoring' },
      { id: 'm-alg-6', name: 'Functions & graphs' },
    ]},
    { id: 'm-geo', name: 'Geometry', points: [
      { id: 'm-geo-1', name: 'Angles & triangles' },
      { id: 'm-geo-2', name: 'Congruence' },
      { id: 'm-geo-3', name: 'Pythagoras' },
      { id: 'm-geo-4', name: 'Area & perimeter' },
      { id: 'm-geo-5', name: 'Volume of solids' },
    ]},
    { id: 'm-sta', name: 'Statistics & Probability', points: [
      { id: 'm-sta-1', name: 'Mean, median, mode' },
      { id: 'm-sta-2', name: 'Reading charts' },
      { id: 'm-sta-3', name: 'Probability basics' },
      { id: 'm-sta-4', name: 'Sample spaces' },
    ]},
  ],
  english: [
    { id: 'e-read', name: 'Reading Comprehension', points: [
      { id: 'e-read-1', name: 'Main idea' },
      { id: 'e-read-2', name: 'Inference' },
      { id: 'e-read-3', name: 'Author\u2019s purpose' },
    ]},
    { id: 'e-gram', name: 'Grammar', points: [
      { id: 'e-gram-1', name: 'Verb tense' },
      { id: 'e-gram-2', name: 'Subject\u2013verb agreement' },
      { id: 'e-gram-3', name: 'Articles' },
    ]},
  ],
  chinese: [
    { id: 'c-read', name: '\u9605\u8bfb\u7406\u89e3', points: [
      { id: 'c-read-1', name: '\u8bb0\u53d9\u6587\u5206\u6790' },
      { id: 'c-read-2', name: '\u8bf4\u660e\u6587\u8981\u70b9' },
    ]},
  ],
};

const FIRST_NAMES = [
  'Wei', 'Min', 'Aria', 'Jin', 'Sofia', 'Hana', 'Lucas', 'Mei', 'Ravi', 'Jordan',
  'Ji-woo', 'Emily', 'Kai', 'Yara', 'Daniel', 'Ling', 'Noah', 'Ines', 'Ahmed', 'Priya',
  'Theo', 'Bao', 'Zara', 'Marcus', 'Lena', 'Hiro', 'Isabel', 'Omar', 'Riya', 'Tobias',
];
const LAST_NAMES = [
  'Chen', 'Park', 'Singh', 'Tanaka', 'Garcia', 'Wong', 'Müller', 'Khan', 'Silva', 'Kim',
  'Patel', 'Liu', 'Adebayo', 'Rossi', 'Nakamura', 'Schmidt', 'Cohen', 'Yamada', 'Hassan', 'Zhao',
];

// Deterministic PRNG so re-rendering doesn't reshuffle the data.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMastery(rand: () => number, baseline: number): Record<string, MasteryLevel> {
  const out: Record<string, MasteryLevel> = {};
  const allPoints = [
    ...CHAPTERS.math.flatMap((c) => c.points),
    ...CHAPTERS.english.flatMap((c) => c.points),
    ...CHAPTERS.chinese.flatMap((c) => c.points),
  ];
  for (const pt of allPoints) {
    const r = rand() * 0.6 + baseline * 0.4;
    let lvl: MasteryLevel;
    if (r < 0.42) lvl = 'not';
    else if (r < 0.72) lvl = 'partial';
    else lvl = 'mastered';
    out[pt.id] = lvl;
  }
  return out;
}

function buildStudent(i: number, classId: string, rand: () => number): Student {
  const fi = Math.floor(rand() * FIRST_NAMES.length);
  const li = Math.floor(rand() * LAST_NAMES.length);
  const baseline = Math.min(0.96, Math.max(0.18, rand() * 0.9 + 0.1));
  const studyMinutes = Math.round(60 + rand() * 380);
  const lastActiveHours = Math.round(rand() * 96);
  const trend = Array.from({ length: 14 }, (_, k) =>
    Math.max(0.05, Math.min(0.98, baseline + (rand() - 0.5) * 0.18 + (k / 14) * 0.08)),
  );
  const riskRoll = rand();
  const risk: RiskLevel = riskRoll > 0.92 ? 'high' : riskRoll > 0.78 ? 'medium' : 'low';
  const sentiment =
    risk === 'high'
      ? -0.4 - rand() * 0.4
      : risk === 'medium'
      ? -0.1 + (rand() - 0.5) * 0.3
      : 0.2 + rand() * 0.5;
  return {
    id: `s-${classId}-${i}`,
    name: `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`,
    classId,
    joined: `2026-01-${(8 + Math.floor(rand() * 22)).toString().padStart(2, '0')}`,
    studyMinutes,
    lastActiveHours,
    baseline,
    mastery: buildMastery(rand, baseline),
    trend,
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

function buildClass(
  meta: Omit<Klass, 'students'>,
  seed: number,
  count: number,
): Klass {
  const rand = mulberry32(seed);
  const students = Array.from({ length: count }, (_, i) => buildStudent(i + 1, meta.id, rand));
  return { ...meta, students };
}

export const CLASSES_TEACHER: Klass[] = [
  buildClass({ id: 'c-7a', name: 'Grade 7A', subjectId: 'math', grade: 7, room: 'B-204', term: 'Spring 2026' },  7, 28),
  buildClass({ id: 'c-7b', name: 'Grade 7B', subjectId: 'math', grade: 7, room: 'B-206', term: 'Spring 2026' }, 13, 26),
  buildClass({ id: 'c-8a', name: 'Grade 8A', subjectId: 'math', grade: 8, room: 'A-112', term: 'Spring 2026' }, 21, 27),
];

export const CLASSES_ADMIN_EXTRA: Klass[] = [
  buildClass({ id: 'c-6a-en', name: 'Grade 6A',  subjectId: 'english', grade: 6, room: 'C-302', term: 'Spring 2026', teacher: 'Mr. Tan'    }, 31, 24),
  buildClass({ id: 'c-6b-en', name: 'Grade 6B',  subjectId: 'english', grade: 6, room: 'C-304', term: 'Spring 2026', teacher: 'Mr. Tan'    }, 41, 25),
  buildClass({ id: 'c-7a-cn', name: 'Grade 7A',  subjectId: 'chinese', grade: 7, room: 'B-101', term: 'Spring 2026', teacher: 'Ms. Hu'     }, 53, 28),
  buildClass({ id: 'c-8b-cn', name: 'Grade 8B',  subjectId: 'chinese', grade: 8, room: 'A-118', term: 'Spring 2026', teacher: 'Ms. Hu'     }, 67, 25),
  buildClass({ id: 'c-9a',    name: 'Grade 9A',  subjectId: 'math',    grade: 9, room: 'A-201', term: 'Spring 2026', teacher: 'Mr. Okafor' }, 79, 26),
  buildClass({ id: 'c-9b',    name: 'Grade 9B',  subjectId: 'math',    grade: 9, room: 'A-203', term: 'Spring 2026', teacher: 'Mr. Okafor' }, 89, 23),
];

function buildSchoolWeekly() {
  const r = mulberry32(101);
  return Array.from({ length: 28 }, (_, i) => ({
    day: i,
    activeStudents: Math.round(380 + 180 * Math.sin(i / 4) + r() * 60),
    minutes: Math.round(7200 + 1800 * Math.sin(i / 5 + 1) + r() * 800),
  }));
}

export const SCHOOL_WEEKLY = buildSchoolWeekly();

export const STRESS_KEYWORDS = [
  { word: 'exam pressure', weight: 38 },
  { word: 'homework load', weight: 31 },
  { word: 'sleep',         weight: 24 },
  { word: 'parents',       weight: 22 },
  { word: 'friends',       weight: 18 },
  { word: 'grades',        weight: 30 },
  { word: 'tired',         weight: 16 },
  { word: 'anxious',       weight: 14 },
  { word: 'pe class',      weight:  9 },
  { word: 'tests',         weight: 27 },
  { word: 'deadline',      weight: 19 },
  { word: 'overwhelmed',   weight: 11 },
];

export const ACTIVITY_FEED: ActivityEntry[] = [
  { kind: 'mastery-up',   who: 'Mei Chen',    detail: 'mastered Pythagoras',                  when: '12 min ago', classId: 'c-7a' },
  { kind: 'risk-up',      who: 'Ravi Patel',  detail: 'flagged medium emotional risk',        when: '38 min ago', classId: 'c-7b' },
  { kind: 'assessment',   who: 'Aria Kim',    detail: 'completed Algebra assessment (84%)',   when: '1 hr ago',   classId: 'c-7a' },
  { kind: 'mastery-down', who: 'Lucas Wong',  detail: 'regressed on Solving linear equations', when: '2 hr ago',  classId: 'c-8a' },
  { kind: 'joined',       who: 'Yara Singh',  detail: 'joined Grade 7B Math',                  when: '3 hr ago',  classId: 'c-7b' },
  { kind: 'assessment',   who: 'Daniel Liu',  detail: 'completed Geometry assessment (61%)',   when: '5 hr ago',  classId: 'c-8a' },
  { kind: 'risk-up',      who: 'Hana Tanaka', detail: 'three days low sentiment',              when: 'Yesterday', classId: 'c-7a' },
];
