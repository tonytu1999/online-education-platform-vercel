export type Mastery = "mastered" | "partial" | "weak";

export interface KnowledgePoint {
  id: string;
  name: string;
  desc: string;
  mastery: Mastery;
}
export interface Chapter {
  id: string;
  name: string;
  points: KnowledgePoint[];
}
export interface Subject {
  id: string;
  name: string;
  emoji: string;
  color: string; // CSS var name segment
  chapters: Chapter[];
}

export const subjects: Subject[] = [
  {
    id: "math",
    name: "数学",
    emoji: "📐",
    color: "primary",
    chapters: [
      {
        id: "func",
        name: "函数",
        points: [
          { id: "linear", name: "一次函数", desc: "形如 y=kx+b 的线性关系", mastery: "mastered" },
          { id: "quad", name: "二次函数", desc: "抛物线、顶点式与一般式", mastery: "partial" },
          { id: "expo", name: "指数函数", desc: "增长与衰减模型", mastery: "weak" },
        ],
      },
      {
        id: "geo",
        name: "几何",
        points: [
          { id: "tri", name: "三角形全等", desc: "SSS / SAS / ASA 判定", mastery: "partial" },
          { id: "circle", name: "圆的性质", desc: "圆周角、切线、弦", mastery: "weak" },
        ],
      },
    ],
  },
  {
    id: "chinese",
    name: "语文",
    emoji: "📖",
    color: "weak",
    chapters: [
      {
        id: "ancient",
        name: "古诗文",
        points: [
          { id: "tang", name: "唐诗鉴赏", desc: "意象与情感分析", mastery: "mastered" },
          { id: "song", name: "宋词格律", desc: "词牌与平仄", mastery: "partial" },
        ],
      },
      {
        id: "modern",
        name: "现代文阅读",
        points: [
          { id: "narrative", name: "记叙文", desc: "情节、人物、主题", mastery: "mastered" },
          { id: "argumentative", name: "议论文", desc: "论点、论据、论证", mastery: "weak" },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "英语",
    emoji: "🌍",
    color: "mastered",
    chapters: [
      {
        id: "grammar",
        name: "语法",
        points: [
          { id: "tense", name: "时态", desc: "16种时态体系", mastery: "partial" },
          { id: "clause", name: "从句", desc: "定语 / 状语 / 名词性从句", mastery: "weak" },
        ],
      },
      {
        id: "vocab",
        name: "词汇",
        points: [
          { id: "high", name: "高频词汇", desc: "核心1500词", mastery: "mastered" },
        ],
      },
    ],
  },
];

export const trendData = [
  { day: "周一", mastery: 52, time: 35 },
  { day: "周二", mastery: 55, time: 42 },
  { day: "周三", mastery: 58, time: 28 },
  { day: "周四", mastery: 60, time: 50 },
  { day: "周五", mastery: 63, time: 45 },
  { day: "周六", mastery: 67, time: 60 },
  { day: "周日", mastery: 70, time: 55 },
];

export const mockChildren = [
  { id: "c1", name: "小明", grade: "初二(3)班", lastSync: "2分钟前", avatar: "👦" },
  { id: "c2", name: "小红", grade: "初一(1)班", lastSync: "1小时前", avatar: "👧" },
];

export const sensitiveKeywords = ["暴力", "色情", "犯罪", "自杀"];

export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];
  answer: number;
  pointId: string;
}
export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    q: "二次函数 y=x²-2x+1 的顶点坐标是？",
    options: ["(1, 0)", "(0, 1)", "(-1, 0)", "(2, 1)"],
    answer: 0,
    pointId: "quad",
  },
  {
    id: "q2",
    q: "下列哪个是一次函数？",
    options: ["y=x²+1", "y=2x-3", "y=1/x", "y=√x"],
    answer: 1,
    pointId: "linear",
  },
  {
    id: "q3",
    q: "指数函数 y=2^x 当 x=3 时的值是？",
    options: ["6", "8", "9", "16"],
    answer: 1,
    pointId: "expo",
  },
];
