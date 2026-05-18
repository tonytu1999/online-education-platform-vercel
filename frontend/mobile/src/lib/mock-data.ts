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
    id: "chinese",
    name: "中國語文",
    emoji: "📖",
    color: "weak",
    chapters: [
      {
        id: "reading",
        name: "閱讀理解",
        points: [
          { id: "prose", name: "白話文閱讀", desc: "敘事、抒情、議論文理解", mastery: "mastered" },
          { id: "classical", name: "文言文閱讀", desc: "文言篇章理解與翻譯", mastery: "partial" },
        ],
      },
      {
        id: "writing",
        name: "寫作",
        points: [
          { id: "narrative", name: "記敘文寫作", desc: "立意、選材、結構佈局", mastery: "partial" },
          { id: "argumentative", name: "議論文寫作", desc: "論點、論證、論據組織", mastery: "weak" },
        ],
      },
      {
        id: "oral",
        name: "聆聽與綜合",
        points: [
          { id: "listening", name: "聆聽理解", desc: "錄音內容理解與歸納", mastery: "mastered" },
          { id: "integrated", name: "綜合能力", desc: "資料整合與表達", mastery: "partial" },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "英國語文",
    emoji: "🌍",
    color: "mastered",
    chapters: [
      {
        id: "reading",
        name: "Reading",
        points: [
          { id: "comprehension", name: "Reading Comprehension", desc: "Understanding and analysing texts", mastery: "partial" },
          { id: "vocabulary", name: "Vocabulary in Context", desc: "Word meaning and usage", mastery: "mastered" },
        ],
      },
      {
        id: "writing",
        name: "Writing",
        points: [
          { id: "part1", name: "Part 1 – Short Task", desc: "200-word guided writing", mastery: "mastered" },
          { id: "part2", name: "Part 2 – Extended Task", desc: "400-word free writing", mastery: "partial" },
        ],
      },
      {
        id: "listening",
        name: "Listening & Integrated",
        points: [
          { id: "dictation", name: "Dictation", desc: "Listening accuracy and spelling", mastery: "weak" },
          { id: "integrated", name: "Integrated Tasks", desc: "Note-taking and writing", mastery: "partial" },
        ],
      },
    ],
  },
  {
    id: "math",
    name: "數學",
    emoji: "📐",
    color: "primary",
    chapters: [
      {
        id: "algebra",
        name: "代數",
        points: [
          { id: "quadratic", name: "二次方程", desc: "因式分解、配方法、公式", mastery: "mastered" },
          { id: "functions", name: "函數及其圖像", desc: "一次、二次、指數函數", mastery: "partial" },
          { id: "polynomial", name: "多項式", desc: "除法定理、餘式定理", mastery: "weak" },
        ],
      },
      {
        id: "geometry",
        name: "幾何與三角",
        points: [
          { id: "trigonometry", name: "三角學", desc: "正弦、餘弦、正切定理", mastery: "partial" },
          { id: "circle", name: "圓的性質", desc: "弦切角、圓冪定理", mastery: "weak" },
          { id: "coordinate", name: "坐標幾何", desc: "直線、圓的方程", mastery: "mastered" },
        ],
      },
      {
        id: "statistics",
        name: "統計與概率",
        points: [
          { id: "probability", name: "概率", desc: "互斥事件、獨立事件", mastery: "partial" },
          { id: "distribution", name: "正態分佈", desc: "標準分、百分位數", mastery: "weak" },
        ],
      },
    ],
  },
  {
    id: "ls",
    name: "公民與社會發展科",
    emoji: "🏛️",
    color: "mastered",
    chapters: [
      {
        id: "hk",
        name: "香港",
        points: [
          { id: "basiclaw", name: "《基本法》與香港", desc: "一國兩制、高度自治", mastery: "mastered" },
          { id: "society", name: "香港社會與文化", desc: "多元社會、公民權利與義務", mastery: "partial" },
        ],
      },
      {
        id: "china",
        name: "國家",
        points: [
          { id: "development", name: "國家改革開放", desc: "經濟發展、現代化進程", mastery: "partial" },
          { id: "connection", name: "香港與國家的關係", desc: "融合發展、大灣區", mastery: "weak" },
        ],
      },
    ],
  },
];

export const trendData = [
  { day: "Mon", mastery: 52, time: 35 },
  { day: "Tue", mastery: 55, time: 42 },
  { day: "Wed", mastery: 58, time: 28 },
  { day: "Thu", mastery: 60, time: 50 },
  { day: "Fri", mastery: 63, time: 45 },
  { day: "Sat", mastery: 67, time: 60 },
  { day: "Sun", mastery: 70, time: 55 },
];

export const mockChildren = [
  { id: "c1", name: "梓軒", grade: "中五", lastSync: "2分鐘前", avatar: "👦" },
  { id: "c2", name: "曉晴", grade: "中三", lastSync: "1小時前", avatar: "👧" },
];

export const sensitiveKeywords = ["暴力", "色情", "犯罪", "自殺"];

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
    q: "二次方程 x²-2x+1=0 的解為？",
    options: ["x=1（重根）", "x=1 或 x=-1", "x=2", "無解"],
    answer: 0,
    pointId: "quadratic",
  },
  {
    id: "q2",
    q: "下列哪個函數的圖像是一條直線？",
    options: ["y=x²+1", "y=2x-3", "y=1/x", "y=√x"],
    answer: 1,
    pointId: "functions",
  },
  {
    id: "q3",
    q: "sin 30° 的值是？",
    options: ["1/2", "√3/2", "√2/2", "1"],
    answer: 0,
    pointId: "trigonometry",
  },
];
