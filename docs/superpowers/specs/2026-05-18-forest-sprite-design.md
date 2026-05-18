# 森林小精灵 AI 伙伴 — 设计方案

**日期**：2026-05-18
**状态**：待实现
**优先级**：P1（MVP 展示增强）
**文件路径**：`docs/superpowers/specs/2026-05-18-forest-sprite-design.md`

---

## 概述

在 AI 聊天页（`student.ai.tsx`）中加入一个 **水獭形态** 的森林小精灵动画形象。水獭是湿地生态的建造师——学生通过学习知识点获取"木柴"，帮助水獭建造和完善池塘生态系统。随着学习里程碑的推进，池塘逐渐繁荣：动物变多，植物茂盛。

**灵感来源**：电影《Hoppers》中的水獭角色。

---

## 核心叙事：湿地生态建造

### 世界观

> 水獭是湿地生态的建造师。它用木柴筑坝，围出池塘，引来生命。

学生每次学习、掌握知识点，就是在为水獭 **收集木柴**。木柴积累到一定数量，水獭就会开始建造/升级池塘。随着池塘生态的完善，越来越多的动物会来此栖息，周边植物也会更加茂盛。

### 池塘生态里程碑

池塘的成长分为 **5 个阶段**，对应学生的学习进度：

| 阶段 | 名称 | 解锁条件 | 视觉变化 |
|------|------|---------|---------|
| 0 | **荒地** | 初始状态 | 空地，几根杂草，水獭坐在石头上 |
| 1 | **筑基** | 掌握第 1 个知识点 | 水獭开始搬运木柴，地面出现木桩基础 |
| 2 | **池塘初现** | 掌握 5 个知识点 | 木坝围成，水面出现，水獭在水中游动 |
| 3 | **生机盎然** | 掌握 15 个知识点 | 荷叶/芦苇出现，青蛙/蜻蜓飞来，小鱼在水中 |
| 4 | **生态繁荣** | 掌握 30 个知识点 | 树木长大，蝴蝶/鸟类栖息，花朵盛开，水獭在坝上休息 |

### 木柴获取规则

- **完成一次 AI 对话**（发送问题并获得回复）→ +1 根木柴
- **掌握一个知识点**（mastery 变为 "mastered"）→ +3 根木柴
- **完成一次能力测试** → +5 根木柴
- **连续学习天数**（streak）→ 每日额外 +1 根木柴

### 木柴 → 里程碑的映射

| 里程碑 | 所需木柴累计 |
|--------|------------|
| 阶段 0 → 1 | 1 根 |
| 阶段 1 → 2 | 10 根 |
| 阶段 2 → 3 | 30 根 |
| 阶段 3 → 4 | 60 根 |

---

## 1. 精灵形象设计

### 角色设定
- **物种**：水獭（Otter）
- **风格**：克制优雅，Q 版比例（头大身小），圆润但不夸张
- **姿态**：坐姿，前爪自然放在身前，尾巴在身后微微翘起
- **性格**：温和、专注、偶尔俏皮

### 配色方案（与现有设计系统一致）

| 部位 | 色值 | 说明 |
|------|------|------|
| 身体主色 | `oklch(0.62 0.16 155)` | mastered green 系 |
| 身体阴影 | `oklch(0.52 0.14 150)` | 腹部、耳内侧 |
| 高光 | `oklch(0.78 0.12 140)` | 鼻头、额头 |
| 眼睛 | 白色底 + `oklch(0.19 0.02 65)` 瞳孔 | 大而圆，带高光点 |
| 脸颊红晕 | `oklch(0.75 0.12 25)` 半透明 | 两侧腮红 |
| 前爪/尾巴尖 | `oklch(0.55 0.12 150)` | 略深，增加层次 |

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
│   │   └── eye-highlight (高光点)
│   ├── nose (鼻子，小倒三角)
│   ├── mouth (嘴巴，随状态变化)
│   └── cheek-l / cheek-r (腮红)
└── front-paw-l / front-paw-r (前爪)

尺寸：约 80×96px（宽×高）
```

---

## 2. 动画状态机

精灵有 **4 种对话状态**，通过 framer-motion 驱动：

| 状态 | 触发条件 | 动画表现 | 表情 |
|------|---------|---------|------|
| **idle**（待机） | 页面加载后 / 无对话时 | 轻柔呼吸（scale Y: 1→1.015，周期 2.5s）；偶尔眨眼（每 3-4s，持续 150ms）；尾巴微微左右摇摆（周期 3s） | 平静，嘴角微扬 |
| **listening**（倾听） | 用户正在输入文字（input 不为空且未发送） | 身体微微前倾（rotate -3°）；耳朵竖起（scale Y 1.05）；眼睛睁大（pupil scale 1.1） | 专注，认真 |
| **thinking**（思考） | AI 回复中（发送后到消息出现前，约 600ms） | 头部微倾（rotate 5° 左右交替）；尾巴放慢摇摆；头顶出现思考泡泡（3 个小圆点依次淡入淡出） | 思考，眼睛看向上方 |
| **talking**（回复） | AI 消息出现时，持续 1.5s 后回到 idle | 身体随消息"弹出"（translate Y: 0→-4px→0，弹性缓动）；嘴巴开合（scale Y 0.8→1.2 循环 2 次）；尾巴加快摇摆 | 开心，微笑 |

### 里程碑升级动画

当池塘从一个阶段升级到下一个阶段时，触发一次 **特殊动画**：

1. 水獭兴奋地跳起来（translate Y: 0 → -12px → 0）
2. 星星粒子从头顶冒出（6-8 个小星星，向外扩散后消失）
3. 池塘背景渐变过渡到新阶段（约 1.5s 的 crossfade）
4. 新元素（动物/植物）以 stagger 动画依次出现

### 动画参数

所有动画使用 `cubic-bezier(0.22, 1, 0.36, 1)` 缓动函数，保持优雅感。

```typescript
// framer-motion variants 结构
const spriteVariants = {
  idle: {
    scaleY: [1, 1.015, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
  },
  listening: {
    rotate: -3,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
  thinking: {
    rotate: [5, -5, 5],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
  },
  talking: {
    y: [0, -4, 0],
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  celebrating: {
    y: [0, -12, 0],
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
  }
};
```

---

## 3. 页面布局改动

### 改动后布局

```
┌──────────────────────────┐
│  AppBar                   │
├──────────────────────────┤
│  Mode switcher            │
├──────────────────────────┤
│  ┌──────────────────────┐│
│  │  PondStage           ││ ← 新增，高度 140px
│  │  (池塘背景，随阶段变化)││
│  │                      ││
│  │    🦦 水獭精灵       ││
│  │                      ││
│  │  🪵 木柴: 12         ││ ← 木柴计数器
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

```css
.pond-stage {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  transition: background 1.5s ease-in-out;
}

/* 各阶段背景通过 CSS 变量或 class 切换 */
.pond-stage.stage-0 {
  background: linear-gradient(to bottom,
    oklch(0.96 0.02 80) 0%,
    oklch(0.95 0.03 90) 100%
  );
}
.pond-stage.stage-1 {
  background: linear-gradient(to bottom,
    oklch(0.95 0.03 100) 0%,
    oklch(0.94 0.04 110) 100%
  );
}
.pond-stage.stage-2 {
  background: linear-gradient(to bottom,
    oklch(0.94 0.05 150) 0%,
    oklch(0.92 0.06 160) 100%
  );
}
.pond-stage.stage-3 {
  background: linear-gradient(to bottom,
    oklch(0.93 0.06 155) 0%,
    oklch(0.90 0.08 160) 100%
  );
}
.pond-stage.stage-4 {
  background: linear-gradient(to bottom,
    oklch(0.92 0.07 155) 0%,
    oklch(0.88 0.10 160) 100%
  );
}

/* 底部渐变融入聊天区 */
.pond-stage::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(to bottom, transparent, var(--background));
}
```

---

## 4. 池塘生态系统 SVG

每个阶段的池塘是一个完整的 SVG 场景，包含背景和前景元素。

### 阶段 0：荒地
- 背景：干燥的土地色调（暖棕/米色）
- 元素：几根杂草、一块石头（水獭坐在上面）
- 水獭表情：平静，略带期待

### 阶段 1：筑基
- 背景：土地颜色略深，出现一些绿色
- 元素：散落的木柴（3-5 根）、木桩基础、小铲子
- 水獭表情：专注，正在搬运木柴

### 阶段 2：池塘初现
- 背景：出现水面（蓝绿色渐变）
- 元素：木坝围成的水面、水波纹、水獭在水中只露出头部和前爪
- 水獭表情：开心，在水中嬉戏

### 阶段 3：生机盎然
- 背景：水面扩大，岸边出现绿色植被
- 元素：
  - 荷叶（2-3 片，浮在水面）
  - 芦苇（岸边，2-3 根）
  - 青蛙（坐在荷叶上）
  - 蜻蜓（飞过，带轨迹动画）
  - 小鱼（水面下，偶尔跃出）
- 水獭表情：满足，趴在坝上休息

### 阶段 4：生态繁荣
- 背景：茂盛的湿地环境
- 元素：
  - 阶段 3 的所有元素
  - 岸边大树（2 棵，随风轻摆）
  - 蝴蝶（2-3 只，飞舞动画）
  - 小鸟（停在树枝上）
  - 花朵（岸边，3-5 朵，不同颜色）
  - 蘑菇（树根旁）
  - 水獭表情：幸福，在坝上晒太阳

### 生态元素动画

| 元素 | 动画 | 周期 |
|------|------|------|
| 水波纹 | 轻微缩放 + 透明度变化 | 3s |
| 荷叶 | 随水波轻微浮动 | 4s |
| 芦苇 | 随风摇摆 | 5s |
| 青蛙 | 偶尔眨眼，偶尔跳入水中 | 随机 8-15s |
| 蜻蜓 | 沿曲线路径飞行 | 6s |
| 小鱼 | 跃出水面 → 溅起水花 | 随机 10-20s |
| 蝴蝶 | 沿花间曲线路径飞舞 | 7s |
| 树叶 | 随风轻摆 | 4s |
| 花朵 | 轻微摇摆 | 3.5s |

---

## 5. 状态驱动逻辑

### 对话状态

```typescript
type SpriteState = "idle" | "listening" | "thinking" | "talking" | "celebrating";

function getSpriteState(input: string, isThinking: boolean, isTalking: boolean, isCelebrating: boolean): SpriteState {
  if (isCelebrating) return "celebrating";
  if (isTalking) return "talking";
  if (isThinking) return "thinking";
  if (input.length > 0) return "listening";
  return "idle";
}
```

### 木柴 & 里程碑状态

```typescript
interface PondState {
  wood: number;           // 当前木柴数
  stage: 0 | 1 | 2 | 3 | 4;  // 当前池塘阶段
  totalMastered: number;  // 累计掌握知识点数
}

// 里程碑阈值
const STAGE_THRESHOLDS = [0, 1, 10, 30, 60];

function getStageFromWood(wood: number): 0 | 1 | 2 | 3 | 4 {
  if (wood >= 60) return 4;
  if (wood >= 30) return 3;
  if (wood >= 10) return 2;
  if (wood >= 1) return 1;
  return 0;
}

// 木柴获取
function addWood(current: PondState, action: "message" | "master" | "test" | "streak"): PondState {
  const gains = { message: 1, master: 3, test: 5, streak: 1 };
  const newWood = current.wood + gains[action];
  const newStage = getStageFromWood(newWood);
  return { ...current, wood: newWood, stage: newStage };
}
```

### Store 扩展

在 `src/lib/store.ts` 中扩展：

```typescript
// 新增 state
pondState: {
  wood: number;
  stage: 0 | 1 | 2 | 3 | 4;
  totalMastered: number;
};

// 新增 actions
addWood: (amount: number) => void;
incrementMastered: () => void;
```

---

## 6. 微交互

### 点击水獭
- 触发一个随机小动画（从以下随机选一个）：
  - 弹跳一下（translate Y: 0 → -8px → 0）
  - 左右摇摆（rotate: 0 → 10° → -10° → 0）
  - 眨眨眼（单眼闭合再睁开）
  - 拍肚子（水獭经典动作，前爪轻拍腹部）
- 动画持续 400-600ms，结束后回到当前状态

### 长按水獭（>800ms）
- 弹出一个小 tooltip，内容根据池塘阶段变化：
  - 阶段 0：「开始学习，帮我收集木柴吧！🦦」
  - 阶段 1：「木柴够了，池塘要开始建啦！」
  - 阶段 2：「听，有水的声音了~」
  - 阶段 3：「青蛙和蜻蜓都来了！」
  - 阶段 4：「我们的湿地家园真美 🌿」

### 点击木柴计数器
- 弹出一个小型进度面板：
  - 当前木柴数 / 下一阶段所需木柴数
  - 进度条
  - 提示：「再收集 X 根木柴就能升级池塘！」

---

## 7. 技术实现方案

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/ai/OtterSprite.tsx` | 水獭 SVG + framer-motion 动画状态机 |
| `src/components/ai/PondStage.tsx` | 池塘舞台容器（背景 + 水獭 + 生态元素 + 木柴计数器） |
| `src/components/ai/PondBackground.tsx` | 池塘场景 SVG（5 个阶段的背景 + 生态元素） |
| `src/components/ai/WoodCounter.tsx` | 木柴计数器 UI |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/routes/student.ai.tsx` | 添加 PondStage 组件；添加 isThinking/isTalking/isCelebrating 状态；在 send() 中驱动状态切换和木柴增加 |
| `src/lib/store.ts` | 扩展 pondState、addWood、incrementMastered |

### 依赖

- 无需新增依赖（framer-motion 已在项目中）
- 纯 SVG 内联绘制，不依赖外部图片

### 实现顺序

1. 绘制水獭 SVG（分层结构，各部位独立可动画）
2. 实现 framer-motion variants（5 种状态，含 celebrating）
3. 绘制池塘场景 SVG（5 个阶段，每阶段背景和生态元素）
4. 实现 PondStage 容器（背景切换 + 水獭定位 + 生态元素 + 木柴计数器）
5. 实现木柴计数器和进度面板
6. 集成到 student.ai.tsx（状态驱动逻辑 + 木柴获取）
7. 扩展 store（pondState）
8. 添加点击/长按微交互
9. 里程碑升级动画（celebrating + 场景过渡）
10. QA：各状态切换流畅度、里程碑升级动画、消息滚动时池塘区域稳定

---

## 8. 实现复杂度评估

| 模块 | 工作量 | 说明 |
|------|-------|------|
| 水獭 SVG 绘制 | 中 | 需要精细调整 SVG path 和分层 |
| 5 种状态动画 | 中 | framer-motion variants |
| 池塘场景 SVG（5 阶段） | 高 | 每阶段独立场景 + 生态元素 |
| 生态元素动画 | 中 | 8+ 种元素的独立动画 |
| PondStage 容器 | 中 | 背景切换 + 元素编排 + 渐变 |
| 木柴计数器 + 进度面板 | 低 | 简单 UI |
| Store 扩展 | 低 | 新增 state + actions |
| 集成到 AI 页面 | 低 | 状态驱动逻辑 |
| 里程碑升级动画 | 中 | celebrating + crossfade + stagger |
| 点击/长按交互 | 低 | 事件处理 |
| **总计** | **约 6-8 小时** | 建议分 2 个 session 完成 |

---

## 9. 未来扩展（暂不实现）

- 引导模式：水獭手持小教鞭指向问题
- 夜间模式：池塘夜景，萤火虫飞舞，水獭戴睡帽
- 季节变化：春夏秋冬池塘景色不同
- 更多生态元素：乌龟、翠鸟、水獭宝宝
- 池塘全景页：独立页面展示完整池塘生态，可缩放浏览
- 分享功能：生成池塘生态卡片，可分享到社交媒体
- 家长端：可以看到孩子池塘的成长状态
