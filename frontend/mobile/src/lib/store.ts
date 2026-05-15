import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "parent";
export type Lang = "zh-CN" | "zh-TW" | "en";
export type ExamType = "dse" | "gaokao" | "ib" | "other";

export interface AiSession {
  id: string;
  title: string;
  mode: "guided" | "free";
  createdAt: number;
  messages: { role: "user" | "ai"; text: string; blocked?: boolean }[];
}

interface AppState {
  loggedIn: boolean;
  role: Role | null;
  account: string;
  nickname: string;
  examType: ExamType;
  textbook: string;
  boundChildId: string | null;
  testCompleted: boolean;
  lastScore: number | null;
  language: Lang;
  onboarded: boolean;
  gender: string;
  age: string;
  country: string;
  school: string;
  aiSessions: AiSession[];
  setLogin: (account: string, nickname: string, examType: ExamType) => void;
  logout: () => void;
  setRole: (r: Role) => void;
  bindChild: (id: string) => void;
  completeTest: (score: number) => void;
  setLanguage: (l: Lang) => void;
  setExamType: (e: ExamType) => void;
  setTextbook: (t: string) => void;
  setNickname: (n: string) => void;
  setOnboarded: () => void;
  setGender: (g: string) => void;
  setAge: (a: string) => void;
  setCountry: (c: string) => void;
  setSchool: (s: string) => void;
  saveSession: (s: AiSession) => void;
  removeSession: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      loggedIn: false,
      role: null,
      account: "",
      nickname: "",
      examType: "gaokao",
      textbook: "人教版",
      boundChildId: "c1",
      testCompleted: false,
      lastScore: null,
      language: "zh-CN",
      onboarded: false,
      gender: "",
      age: "",
      country: "",
      school: "",
      aiSessions: [],
      setLogin: (account, nickname, examType) =>
        set({ loggedIn: true, account, nickname: nickname || account, examType }),
      logout: () => set({ loggedIn: false, role: null, account: "", nickname: "", onboarded: false, gender: "", age: "", country: "", school: "" }),
      setRole: (role) => set({ role }),
      bindChild: (id) => set({ boundChildId: id }),
      completeTest: (score) => set({ testCompleted: true, lastScore: score }),
      setLanguage: (language) => set({ language }),
      setExamType: (examType) => set({ examType }),
      setTextbook: (textbook) => set({ textbook }),
      setNickname: (nickname) => set({ nickname }),
      setOnboarded: () => set({ onboarded: true }),
      setGender: (gender) => set({ gender }),
      setAge: (age) => set({ age }),
      setCountry: (country) => set({ country }),
      setSchool: (school) => set({ school }),
      saveSession: (s) =>
        set((st) => ({
          aiSessions: [s, ...st.aiSessions.filter((x) => x.id !== s.id)].slice(0, 20),
        })),
      removeSession: (id) =>
        set((st) => ({ aiSessions: st.aiSessions.filter((x) => x.id !== id) })),
    }),
    { name: "edu-app-state" },
  ),
);
