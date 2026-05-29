# 森林小精灵 AI 伙伴 — 设计方案

**日期**：2026-05-18
**修订**：2026-05-23
**状态**：待实现
**优先级**：P1（MVP 展示增强）
**文件路径**：`docs/superpowers/specs/2026-05-18-forest-sprite-design.md`

---

## 概述

在 AI 对话页（`student.ai.tsx`）中加入一个水獭形态的森林小精灵和一片 **会自然生长的池塘**。学生每完成一个章节的学习，就会有一只新的小动物来到池塘安家。不需要用户任何操作——系统自动完成一切。池塘是学习旅程的可视化日记，不是需要"经营"的游戏。

**灵感来源**：旅行青蛙（放置 + 轻度收集 + 零操作）+ 灵魂摆渡人（情感陪伴 + 家园感 + 永久记忆）。

---

## 设计原则

1. **零操作**——没有按钮可以点，没有冷却时间，没有进度条。系统根据学习行为自动触发一切。
2. **收集即记忆**——每只动物代表一个学过的章节，池塘是学习旅程的 **可视化日记**。
3. **惊喜而非期待**——不提示"再学 X 章就解锁下一个"，用户回来发现新动物来访，是惊喜而非计划中的奖励。
4. **家长无负担**——家长端只有"看"和"写"，没有任何需要操作的游戏机制。池塘本身就是学习报告。

---

## 核心系统：池塘安家

### 池塘是什么

池塘是 AI 对话页面上方的一个场景区域（类似旅行青蛙的庭院）。它不是一个需要"升级"的系统，而是一个 **会自然生长的小世界**。

**初始状态**：一片宁静的池塘，几块石头，水面平静，岸边青草。水獭坐在石头上打盹。

### 动物来访机制

学生 **完成一个章节的学习**（章节内知识点 mastery 达到设定阈值）后，下次打开池塘时，会有新动物来访。

#### 来访流程

1. 学生完成章节 → 系统标记"待来访"
2. 下次学生打开 AI 对话页 → 触发来访动画（约 2 秒）
3. 一只小动物从池塘边缘慢慢走进场景，找到自己的位置安家
4. 水獭站起来微微点头致意，然后回到石头上
5. 池塘从此多了一个永久居民

**关键**：动物不是"解锁"的，是"来访"的。没有进度提示，没有倒计时。用户不知道下一只动物是什么。

#### 动物图鉴

| 章节主题 | 动物 | 安家位置 | 日常行为 |
|---|---|---|---|
| 数学基础 | 🐸 青蛙 | 荷叶上 | 偶尔叫两声，跳进水里 |
| 语文阅读 | 🦆 小鸭 | 水面游动 | 排成一队，偶尔把头埋水里 |
| 英语入门 | 🐢 乌龟 | 石头上晒太阳 | 慢悠悠，偶尔探头 |
| 科学探索 | 🦎 小蜥蜴 | 岸边石头上 | 晒太阳，尾巴摆动 |
| 艺术创作 | 🦋 蝴蝶 | 花间飞舞 | 绕池塘飞，偶尔停在某处 |
| 历史人文 | 🐦 翠鸟 | 树枝上 | 偶尔俯冲进水里 |
| 编程思维 | 🐿️ 松鼠 | 树上/岸边 | 抱着松果，偶尔啃一咬 |
| *后续章节* | *持续扩展* | — | — |

**每只动物一旦来访，永久保留在池塘中。** 它代表你学过的东西，不会消失。

### 动物家的变化

学生在某个章节 **持续深入学习** 时，动物身边会自动多出小物件：

| 触发条件 | 效果 |
|---|---|
| 首次完成章节 | 动物来到池塘，找到位置安家 |
| 章节测试高分（≥80） | 动物身边多一个小物件（如青蛙旁多一盏灯笼，乌龟旁多一顶小帽） |
| 连续复习该章节 | 家的周围多一朵花 / 一棵小草 |
| 章节 mastery 100% | 动物旁边出现小星星标记 |

所有变化 **自动触发，不需要用户操作**。用户偶尔回来看，发现"青蛙旁边多了个灯笼"，这就是正向反馈。

### 池塘的自然变化

池塘随 **真实时间** 有微变化：

| 时间段 | 氛围 |
|---|---|
| 早晨（5:00–9:00） | 水面薄雾，动物们比较安静 |
| 白天（9:00–17:00） | 阳光洒在水面，波光粼粼 |
| 傍晚（17:00–20:00） | 夕阳暖色调，有些动物在打盹 |
| 夜晚（20:00–5:00） | 月光色水面，萤火虫微光 |

完成章节后的第一次来访，水面有淡淡光晕，新动物从远处走来。

---

## 水獭的角色

水獭是 **池塘的主人 / 学生的伙伴**，不是建造者。

### 角色设定
- **物种**：水獭（Otter）
- **风格**：克制优雅，Q 版比例（头大身小），圆润但不夸张
- **性格**：温和、专注、安静陪伴

### 配色方案

| 部位 | 色值 | 说明 |
|------|------|------|
| 身体主色 | `oklch(0.62 0.16 155)` | mastered green 系 |
| 身体阴影 | `oklch(0.52 0.14 150)` | 腹部、耳内侧 |
| 高光 | `oklch(0.78 0.12 140)` | 鼻头、额头 |
| 眼睛 | 白色底 + `oklch(0.19 0.02 65)` 瞳孔 | 大而圆，带高光点 |
| 脸颊红晕 | `oklch(0.75 0.12 25)` 半透明 | 两侧腮红 |
| 前爪/尾巴尖 | `oklch(0.55 0.12 150)` | 略深，增加层次 |

### 动画状态

| 状态 | 触发条件 | 动画表现 |
|------|---------|---------|
| **idle**（待机） | 页面加载后 / 无对话时 | 轻柔呼吸（scale Y: 1→1.015，周期 2.5s）；偶尔眨眼（每 3-4s）；尾巴微微摇摆（周期 3s）；有时会打盹（缓慢低头再抬头） |
| **listening**（倾听） | 用户正在输入 | 身体微微前倾（rotate -3°）；耳朵竖起；眼睛睁大 |
| **thinking**（思考） | AI 回复中 | 头部微倾（左右交替）；尾巴放慢摇摆；头顶出现思考泡泡（3 个小圆点依次淡入淡出） |
| **talking**（回复） | AI 消息出现时 | 身体随消息"弹出"（translate Y 弹性缓动）；嘴巴开合 2 次；尾巴加快摇摆 |
| **greeting**（迎接） | 新动物来访时 | 站起来，微微点头，然后回到石头上坐下 |

所有动画使用 `cubic-bezier(0.22, 1, 0.36, 1)` 缓动函数。

水獭 **不会说话**，不弹提示，只是安静陪着。

### SVG 分层结构

```
otter-sprite
├── body (身体主体，含呼吸动画)
├── tail (尾巴，含摇摆动画)
├── head-group (头部组)
│   ├── head (头部轮廓)
│   ├── ear-l / ear-r (左/右耳)
│   ├── eye-l / eye-r (左/右眼，含眨眼动画)
│   │   ├── eye-white
│   │   ├── pupil
│   │   └── eye-highlight
│   ├── nose (小倒三角)
│   ├── mouth (嘴巴，随状态变化)
│   └── cheek-l / cheek-r (腮红)
└── front-paw-l / front-paw-r (前爪)
```

尺寸：约 80×96px。

---

## 页面布局

```
┌──────────────────────────┐
│  AppBar                   │
├──────────────────────────┤
│  Mode switcher            │
├──────────────────────────┤
│  ┌──────────────────────┐│
│  │  PondStage           ││ ← 高度 160px，flex-shrink: 0
│  │  (池塘场景)           ││
│  │    🦦 水獭精灵       ││
│  │    🐸🐢🦆... 动物们   ││
│  └──────────────────────┘│
│  ─ ─ ─ 渐变分割线 ─ ─ ─  │
│                           │
│  对话消息列表              │
│  (flex-1, overflow-y)     │
│                           │
├──────────────────────────┤
│  输入栏 (fixed)           │
└──────────────────────────┘
```

### PondStage 规格

- 高度 160px，flex-shrink: 0，overflow: hidden
- 背景根据时间段自动切换色调（早晨/白天/傍晚/夜晚）
- 底部 24px 渐变融入聊天区
- **不显示** 木柴计数器、进度条、阶段标识等任何 UI 元素

---

## 动物 SVG 规范

每只动物采用和水獭一致的美术风格：Q 版比例、圆润线条、oklch 色系。

每只动物的 SVG 分层结构：

```
animal-[name]
├── body (身体主体)
├── head-group (头部)
│   ├── eyes (眼睛，含眨眼动画)
│   └── 特征部位 (如青蛙的斑纹、蝴蝶的翅膀等)
└── accessories (小物件，初始为空，随学习深入添加)
    ├── item-1 (灯笼/帽子等)
    ├── flower (周围的小花)
    └── star (100% mastery 的星星标记)
```

### 生态元素动画

| 元素 | 动画 | 周期 |
|------|------|------|
| 水波纹 | 轻微缩放 + 透明度变化 | 3s |
| 荷叶 | 随水波轻微浮动 | 4s |
| 蝴蝶翅膀 | 扇动 | 0.5s |
| 青蛙 | 偶尔眨眼，偶尔跳入水中 | 随机 8-15s |
| 蜻蜓 | 沿曲线路径飞行 | 6s |
| 萤火虫（夜晚） | 明暗闪烁 | 2s |

---

## 家长端

### 家长端入口

```
家长端首页 → 孩子学习卡片 → 点击"看看池塘" → 进入 PondView 页面
```

入口始终可点击。如果学生尚未开始学习，池塘显示初始状态（水獭打盹，空池塘），家长看到的是"等待孩子开始学习的小世界"。

### 家长端池塘页面

家长看到的池塘与孩子端 **完全同步**——同样的动物，同样的水獭，同样的时间变化。

家长 **不需要任何操作**。池塘本身就是学习报告：
- 来了几只动物 = 学了几章
- 动物家旁边多了什么 = 学得怎么样
- 池塘整体的生机 = 孩子的学习状态

### 寄语木牌

家长可以在池塘边挂寄语：

```
┌──────────────────────────────────┐
│  💌 给孩子的寄语                  │
│  ┌──────────────────────────────┐│
│  │                              ││
│  │  （最多 30 字）               ││
│  │                              ││
│  └──────────────────────────────┘│
│  0/30                             │
│  ┌────────┐  ┌────────────────┐  │
│  │  取消   │  │  💌 挂在木牌上  │  │
│  └────────┘  └────────────────┘  │
└──────────────────────────────────┘
```

- 输入框占位符：「写下你想说的话...」
- 快捷寄语模板（点击即可发送，可修改）：
  - "今天也要加油哦！💪"
  - "爸爸/妈妈为你骄傲！🌟"
  - "学习辛苦了，休息一下 ☕"
  - "不管结果如何，努力就好 ❤️"

### 学生端收到寄语

- 池塘边出现一个小木牌，写着"爸妈的话"
- 学生点击木牌 → 展开寄语内容
- 没有 48 小时消失机制——寄语 **永久保留** 在木牌上，可以翻阅历史
- 池塘本身不弹 toast、不打断对话

---

## 后端集成

### 学习进度 API

池塘动物来访由 **后端学习进度系统** 驱动，无需前端手动触发。

#### 进度自动更新流程

```
学生发送 Socratic 消息
  → 后端 POST /api/ai/chat 返回 AI 回复
  → 后台 analyzeLearningBehavior() 异步执行
  → AI 识别对话中涉及的知识点和掌握程度
  → 自动 upsert Progress 记录（掌握度只升不降）
```

**关键行为：** 掌握度是单向递进的 — `UNMASTERED → PARTIAL → MASTERED`，不会因为后续对话而降级。

#### 创建 Socratic 会话（必须传 subject）

```http
POST /api/ai/sessions
{
  "type": "Socratic",
  "subject": "Mathematics",   ← 必须传，否则 AI 会对所有科目知识点做分析，准确率低
  "topic": "Quadratic Equations"  ← 可选，仅作标记
}
```

#### 章节完成判定

前端通过 `GET /api/progress/:studentId/report` 获取分组报告，判断章节是否完成：

```typescript
// 示例：章节完成阈值 — 80% 知识点达到 PARTIAL 或以上
function isChapterComplete(chapter: ChapterReport): boolean {
  const engaged = chapter.knowledgePoints.filter(
    kp => kp.mastery === 'PARTIAL' || kp.mastery === 'MASTERED'
  );
  return engaged.length / chapter.knowledgePoints.length >= 0.8;
}
```

报告结构：
```json
{
  "subjects": [{
    "name": "Mathematics",
    "chapters": [{
      "id": "...",
      "name": "Number & Algebra",
      "summary": {
        "totalKnowledgePoints": 8,
        "mastered": 3,
        "partial": 4,
        "unmastered": 1,
        "totalStudyTimeSeconds": 240
      },
      "knowledgePoints": [
        { "id": "...", "name": "二次方程式", "mastery": "MASTERED" },
        ...
      ]
    }]
  }]
}
```

#### 推荐轮询策略

在 `student.ai.tsx` 页面中，每次 AI 消息返回后轮询一次进度报告（火-和-遗忘分析约 2–5 秒完成）：

```typescript
// Send message → wait 3s → refresh progress → check chapter completion
const handleSendMessage = async () => {
  await sendMessage();
  setTimeout(async () => {
    const report = await fetchProgressReport(studentId);
    checkForNewCompletions(report);  // triggers onChapterComplete if needed
  }, 3000);
};
```

---

## 状态驱动逻辑

### 对话状态

```typescript
type SpriteState = "idle" | "listening" | "thinking" | "talking" | "greeting";

function getSpriteState(input: string, isThinking: boolean, isTalking: boolean, isGreeting: boolean): SpriteState {
  if (isGreeting) return "greeting";
  if (isTalking) return "talking";
  if (isThinking) return "thinking";
  if (input.length > 0) return "listening";
  return "idle";
}
```

### 池塘状态

```typescript
interface PondState {
  animals: PondAnimal[];           // 已来访动物列表
  pendingVisit: string | null;     // 待来访的章节 id（已完成但尚未触发动画）
  messages: ParentMessage[];       // 寄语历史
}

interface PondAnimal {
  chapterId: string;               // 对应章节
  animalType: string;              // 动物类型（"frog" / "duck" / ...）
  arrivedAt: number;               // 来访时间戳
  accessories: string[];           // 已解锁的小物件 id 列表
  hasStar: boolean;                // mastery 100% 星星标记
}

interface ParentMessage {
  id: string;
  content: string;
  createdAt: number;
}
```

### Store 扩展

在 `src/lib/store.ts` 中新增：

```typescript
pondState: {
  animals: PondAnimal[];
  pendingVisit: string | null;
  messages: ParentMessage[];
};

// actions
onChapterComplete: (chapterId: string) => void;  // 标记待来访
triggerAnimalVisit: (chapterId: string) => void;  // 触发动画并添加到池塘
unlockAccessory: (chapterId: string, accessoryId: string) => void;
addParentMessage: (content: string) => void;
```

### 来访判定逻辑

```typescript
// 章节完成时调用（章节 mastery ≥ 阈值时触发）
function onChapterComplete(chapterId: string) {
  if (!state.pondState.animals.find(a => a.chapterId === chapterId)) {
    set({ pondState: { ...state.pondState, pendingVisit: chapterId } });
  }
}

// 学生打开 AI 对话页时检查
function checkPendingVisit() {
  const { pendingVisit } = get().pondState;
  if (pendingVisit) {
    triggerAnimalVisit(pendingVisit);
    set({ pondState: { ...state.pondState, pendingVisit: null } });
  }
}
```

---

## 技术实现方案

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/ai/OtterSprite.tsx` | 水獭 SVG + framer-motion 动画状态机（5 种状态） |
| `src/components/ai/PondStage.tsx` | 池塘舞台容器（背景 + 水獭 + 动物们 + 时光变化） |
| `src/components/ai/PondBackground.tsx` | 池塘场景 SVG（水面、石头、植被等基础环境） |
| `src/components/ai/animals/AnimalFrog.tsx` | 青蛙 SVG 组件 |
| `src/components/ai/animals/AnimalDuck.tsx` | 小鸭 SVG 组件 |
| `src/components/ai/animals/AnimalTurtle.tsx` | 乌龟 SVG 组件 |
| `src/components/ai/animals/AnimalLizard.tsx` | 蜥蜴 SVG 组件 |
| `src/components/ai/animals/AnimalButterfly.tsx` | 蝴蝶 SVG 组件 |
| `src/components/ai/animals/AnimalKingfisher.tsx` | 翠鸟 SVG 组件 |
| `src/components/ai/animals/AnimalSquirrel.tsx` | 松鼠 SVG 组件 |
| `src/components/ai/AnimalArrival.tsx` | 动物来访动画 wrapper |
| `src/components/ai/MessageBoard.tsx` | 寄语木牌组件（点击展开历史） |
| `src/components/parent/PondView.tsx` | 家长端池塘页面（只读 + 寄语输入） |
| `src/components/parent/MessageInputModal.tsx` | 寄语输入弹窗 + 快捷模板 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/routes/student.ai.tsx` | 添加 PondStage 组件；添加对话状态驱动；在章节完成时调用 `onChapterComplete`；页面加载时调用 `checkPendingVisit` |
| `src/routes/parent.pond.tsx` | 新增家长池塘页面路由 |
| `src/lib/store.ts` | 扩展 pondState 及相关 actions |

### 依赖

- 无需新增依赖（framer-motion 已在项目中）
- 纯 SVG 内联绘制，不依赖外部图片

### 实现顺序

**Phase 1 — 池塘环境**
1. 绘制水獭 SVG（分层结构，5 种动画状态）
2. 绘制池塘基础环境 SVG（水面、石头、植被）
3. 实现 PondStage 容器（背景 + 水獭定位 + 时间变化）
4. 实现 framer-motion variants（idle/listening/thinking/talking/greeting）
5. 集成到 student.ai.tsx（对话状态驱动）

**Phase 2 — 动物系统**
6. 绘制第一只动物 SVG（青蛙，作为模板）
7. 实现 AnimalArrival 来访动画
8. 实现剩余动物 SVG（鸭子、乌龟、蜥蜴、蝴蝶、翠鸟、松鼠）
9. 实现动物家的 accessories 系统（小物件显示/隐藏）
10. 实现章节完成 → pendingVisit → 来访的触发链路
11. 扩展 store（pondState）

**Phase 3 — 家长端**
12. 实现寄语木牌组件（MessageBoard）
13. 实现寄语输入弹窗 + 快捷模板
14. 实现家长端池塘页面（只读同步）
15. 学生端寄语展示逻辑

---

## 实现复杂度评估

| 模块 | 工作量 | 说明 |
|------|-------|------|
| 水獭 SVG + 5 种动画状态 | 中 | framer-motion variants，分层 SVG |
| 池塘环境 SVG + 时间变化 | 低 | 静态场景 + 色调切换 |
| 单只动物 SVG（模板） | 中 | 确定美术规范后复用 |
| 剩余 6 只动物 SVG | 中 | 每只约 30 分钟 |
| 来访动画 | 低 | 简单的移动 + 缓动 |
| 动物家物件系统 | 低 | 条件渲染 + stagger |
| Store 扩展 + 触发链路 | 低 | 逻辑清晰 |
| 寄语木牌 + 输入弹窗 | 低 | 简单 UI |
| 家长端池塘页面 | 低 | 复用 PondStage |
| **总计** | **约 5-7 小时** | — |

---

## 与原版方案对比

| 维度 | 原版 | 新版 |
|------|------|------|
| 用户操作 | 多（浇水、除草、收集木柴） | 零 |
| 核心驱动 | 游戏循环（收集→升级→解锁） | 情感连接（学习→记忆→归属） |
| 家长感受 | "这是个游戏" | "这是孩子的学习日记" |
| 数值系统 | 木柴 + 阶段阈值 + 冷却时间 | 仅章节 mastery 判定 |
| 动物系统 | 阶段性批量出现 | 逐只来访，永久保留 |
| 互动按钮 | 4 个（浇水/寄语/除草/亲子共学） | 1 个（寄语木牌） |
| 通知推送 | 3 个优先级 + 多种方式 | 仅新寄语时可选通知 |
| 长期维护 | 需持续添加阶段内容 | 只需每章一个新动物 SVG |
| 预估工时 | 11-15 小时 | 5-7 小时 |

---

## 未来扩展（暂不实现）

- 更多动物类型（随章节持续添加）
- 季节变化：春夏秋冬池塘色调和植被不同
- 夜间模式：萤火虫、猫头鹰、月光
- 全屏池塘览：独立页面展示完整池塘，可缩放浏览
- 分享功能：生成池塘快照卡片
- 动物之间的互动：青蛙和蜻蜓嬉戏、松鼠往水里扔果子
