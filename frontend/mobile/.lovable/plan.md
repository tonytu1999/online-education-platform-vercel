## 说明

当前项目是 **TanStack Start (Web)**，不是 React Native。我将以"移动端优先的Web原型"实现，预览自动锁定为手机视口（375×812），界面完全模拟原生App体验（底部Tab、状态栏、卡片式布局）。后续如需打包为真机App可基于此UI迁移到Capacitor/Expo。

数据全部为前端Mock（localStorage持久化），不接入后端。本次目标是**完整可演示的页面联动与主流程**（P0全部 + P1占位）。

## 信息架构

```
/login                    登录（手机号/邮箱 + 第三方占位）
/role                     角色选择（学生/家长）

学生端 (/student)
  ├─ /student/learn       学习首页：学科卡片
  ├─ /student/learn/$subject              章节列表
  ├─ /student/learn/$subject/$chapter     知识点列表
  ├─ /student/ai          AI助手（自由/引导切换）
  ├─ /student/test        能力测试（分数录入/错题/开始测试）
  ├─ /student/test/result 测试结果
  ├─ /student/progress    学习进度
  └─ /student/me          我的（含角色切换、设置）

家长端 (/parent)
  ├─ /parent/overview     孩子总览 + 7天趋势
  ├─ /parent/subjects     分学科进度
  ├─ /parent/wellbeing    心理健康（占位空态）
  ├─ /parent/children     孩子管理（绑定/切换）
  └─ /parent/me           我的
```

## 设计系统

- 风格：教育场景 / 简洁卡片 / 数据可读性优先
- 主色：教育蓝 `oklch(0.55 0.18 250)`
- 语义色：
  - 已掌握 绿 `oklch(0.7 0.17 150)`
  - 部分掌握 橙 `oklch(0.75 0.15 70)`
  - 未掌握 红灰 `oklch(0.6 0.12 25)`
  - 风险 低/中/高 → 绿/黄/红
- 字体：系统中文优先 + Inter
- 通用组件：`MobileShell`（带状态栏+底部Tab）、`ProgressCard`、`SubjectCard`、`KnowledgePointItem`、`TrendChart`（recharts）、`EmptyState`、`PermissionNotice`、`ChatBubble`

## 实现范围

### P0（全部实现）
- 登录（手机号验证码 / 邮箱密码，Mock）
- 角色选择 + "我的"页角色切换
- 学生：学科→章节→知识点 三级
- AI助手：自由对话 + 知识点引导 切换；敏感词拦截提示；语音输入按钮（Web Speech API，降级为占位）
- 能力测试：录分数 / 拍照错题（占位file input）/ 开始测试（3题Mock）→ 结果页含掌握度变化
- 学习进度：层级展开 + 掌握度标签
- 家长绑定孩子（手机号/二维码占位）
- 家长总览：完成率、掌握率、学习时长、7天趋势图（recharts）
- 权限隔离提示："不可查看孩子AI对话内容"

### P1（占位/简化）
- 微信/QQ 第三方登录按钮（点击 toast"即将上线"）
- 心理健康页：完整UI骨架 + 空态 + "后续接入AI分析"提示
- 订阅页占位

### 暂缓
- 推送、语音输出、真实AI分析

## 演示链路

1. 学生：登录 → 选数学/二次函数 → AI引导对话 → 做测试 → 看进度更新
2. 家长：登录 → 绑定孩子 → 总览/趋势 → 分学科 → 心理健康占位
3. "我的"切换角色，立即跳到对应端首页

## 技术要点

- 路由：TanStack Router 文件路由，扁平点分隔（如 `student.learn.$subject.tsx`）
- 状态：Zustand 存当前角色 / 登录态 / Mock数据；localStorage持久化
- 图表：recharts
- 动画：framer-motion（页面切换、Tab切换）
- 预览：自动设为 mobile viewport

## 文件清单（约25个新文件）

- `src/styles.css`：扩展设计token
- `src/lib/store.ts`：Zustand 全局store + mock数据
- `src/lib/mock-data.ts`：学科/章节/知识点/孩子/测试题
- `src/components/mobile/MobileShell.tsx`、`BottomTab.tsx`、`AppBar.tsx`
- `src/components/cards/*`：ProgressCard、SubjectCard、KnowledgePointItem、ChatBubble、EmptyState、PermissionNotice、TrendChart
- `src/routes/index.tsx`：重定向到 /login 或对应端
- `src/routes/login.tsx`、`role.tsx`
- `src/routes/student.tsx`（layout + BottomTab）+ 7个子路由
- `src/routes/parent.tsx`（layout + BottomTab）+ 5个子路由

完成后会逐页QA并给出演示路径。请确认是否开始实现，或需要调整范围。