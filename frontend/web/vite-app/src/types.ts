// Shared type definitions for the Teacher / School Web.

export type Lang = 'en' | 'zh-TW';
export type Role = 'teacher' | 'admin';
export type MasteryLevel = 'not' | 'partial' | 'mastered';
export type RiskLevel = 'low' | 'medium' | 'high';
export type SubjectTone = 'blue' | 'amber' | 'green' | 'rose' | 'violet';

export interface Subject {
  id: 'math' | 'english' | 'chinese';
  label: string;
  glyph: string;
  tone: SubjectTone;
}

export interface KnowledgePoint {
  id: string;
  name: string;
  chapterId?: string;
  chapterName?: string;
}

export interface Chapter {
  id: string;
  name: string;
  points: KnowledgePoint[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  joined: string;
  studyMinutes: number;
  lastActiveHours: number;
  baseline: number;
  mastery: Record<string, MasteryLevel>;
  trend: number[];
  risk: RiskLevel;
  sentiment: number;
  sentimentTrend: number[];
  streak: number;
  completionRate: number;
  status: 'active' | 'paused';
}

export interface Klass {
  id: string;
  name: string;
  subjectId: Subject['id'];
  grade: number;
  room: string;
  term: string;
  teacher?: string;
  students: Student[];
}

export interface ActivityEntry {
  kind: 'mastery-up' | 'mastery-down' | 'risk-up' | 'assessment' | 'joined';
  who: string;
  detail: string;
  when: string;
  classId: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarTone?: SubjectTone;
}

export interface TweakState {
  role: Role;
  density: 'compact' | 'comfortable';
  accent: string[];
  sidebar: 'labeled' | 'collapsed';
  chartStyle: 'stacked' | 'split';
  dark: boolean;
  lang: Lang;
}

export interface NavState {
  view:
    | 'dashboard'
    | 'classes'
    | 'class-detail'
    | 'student-detail'
    | 'students'
    | 'mental-health'
    | 'admin-school';
  classId?: string;
  studentId?: string;
  focusPointId?: string;
}
