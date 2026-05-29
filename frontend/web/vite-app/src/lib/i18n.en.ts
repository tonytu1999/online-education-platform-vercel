// English translations for backend curriculum names (Simplified Chinese keys → English labels).
// Only covers strings that are NOT already English — i.e. math and Chinese-subject content
// returned by GET /curriculum/subjects.

export const EN: Record<string, string> = {
  // ── Subject names ─────────────────────────────────────────────────────────
  'Chinese Language': 'Chinese Language',

  // ── Mathematics chapters ──────────────────────────────────────────────────
  '数与代数（中一至中三）':         'Number & Algebra (Forms 1–3)',
  '量度、图形与空间（中一至中三）': 'Measures, Shape & Space (Forms 1–3)',
  '数据处理（中一至中三）':         'Data Handling (Forms 1–3)',
  '数与代数（中四至中六必修）':     'Number & Algebra (Forms 4–6)',
  '度量、图形与空间（中四至中六必修）': 'Measures, Shape & Space (Forms 4–6)',
  '数据处理（中四至中六必修）':     'Data Handling (Forms 4–6)',
  '延伸部分单元一（微积分与统计）': 'Extended Module 1: Calculus & Statistics',
  '延伸部分单元二（代数与微积分）': 'Extended Module 2: Algebra & Calculus',

  // ── Mathematics KPs — Number & Algebra (Forms 1–3) ───────────────────────
  '有理数运算':       'Arithmetic on Rational Numbers',
  '代数式与因式分解': 'Algebraic Expressions & Factorisation',
  '一元一次方程':     'Linear Equations in One Unknown',
  '联立方程':         'Simultaneous Equations',
  '二次方程':         'Quadratic Equations (Forms 1–3)',
  '函数与图象（初步）': 'Functions & Graphs (Introduction)',
  '指数与对数（入门）': 'Indices & Logarithms (Introduction)',
  '不等式（入门）':   'Inequalities (Introduction)',

  // ── Mathematics KPs — Measures, Shape & Space (Forms 1–3) ────────────────
  '三角形的性质':     'Properties of Triangles',
  '四边形与多边形':   'Quadrilaterals & Polygons',
  '圆的性质（基础）': 'Circle Properties (Basic)',
  '相似图形':         'Similar Figures',
  '坐标几何（入门）': 'Coordinate Geometry (Introduction)',
  '立体图形':         '3D Figures',

  // ── Mathematics KPs — Data Handling (Forms 1–3) ──────────────────────────
  '统计图表':         'Statistical Charts',
  '集中趋势量数':     'Measures of Central Tendency',
  '离散程度量数':     'Measures of Dispersion',
  '概率（基础）':     'Probability (Basic)',

  // ── Mathematics KPs — Number & Algebra (Forms 4–6) ───────────────────────
  '二次方程式':             'Quadratic Equations',
  '函数及其图象':           'Functions & Their Graphs',
  '指数函数及对数函数':     'Exponential & Logarithmic Functions',
  '多项式':                 'Polynomials',
  '有理函数与部分分式':     'Rational Functions & Partial Fractions',
  '等差及等比数列':         'Arithmetic & Geometric Sequences',
  '不等式':                 'Inequalities',
  '线性规划':               'Linear Programming',

  // ── Mathematics KPs — Measures, Shape & Space (Forms 4–6) ────────────────
  '圆的基本性质':     'Circle Properties',
  '三角比':           'Trigonometric Ratios',
  '直线方程':         'Equations of Straight Lines',
  '正弦定理与余弦定理': 'Sine & Cosine Rules',
  '圆的方程':         'Equations of Circles',
  '几何变换':         'Geometric Transformations',
  '立体图形（进阶）': '3D Figures (Advanced)',

  // ── Mathematics KPs — Data Handling (Forms 4–6) ──────────────────────────
  '排列与组合':           'Permutations & Combinations',
  '概率':                 'Probability',
  '频率分布与统计图':     'Frequency Distribution & Statistical Charts',
  '集中趋势量数（进阶）': 'Measures of Central Tendency (Advanced)',
  '离散程度量数（进阶）': 'Measures of Dispersion (Advanced)',

  // ── Mathematics KPs — Extended Module 1 ─────────────────────────────────
  '导数与微分法则': 'Derivatives & Differentiation Rules',
  '导数的应用':     'Applications of Derivatives',
  '积分基础':       'Integration (Basic)',
  '积分的应用':     'Applications of Integration',
  '离散概率分布':   'Discrete Probability Distributions',
  '连续概率分布':   'Continuous Probability Distributions',
  '抽样与估计':     'Sampling & Estimation',
  '假设检验与回归': 'Hypothesis Testing & Regression',

  // ── Mathematics KPs — Extended Module 2 ─────────────────────────────────
  '向量（二维与三维）': 'Vectors (2D & 3D)',
  '向量的应用':         'Applications of Vectors',
  '矩阵':               'Matrices',
  '行列式与逆矩阵':     'Determinants & Inverse Matrices',
  '微分进阶':           'Advanced Differentiation',
  '积分技巧':           'Integration Techniques',
  '微分方程':           'Differential Equations',

  // ── Chinese Language chapters ─────────────────────────────────────────────
  '阅读':     'Reading',
  '写作':     'Writing',
  '听说':     'Listening and Speaking',
  '语文知识': 'Language Study',

  // ── Chinese Language KPs ─────────────────────────────────────────────────
  '文意理解':     'Text Comprehension',
  '文言文阅读':   'Classical Chinese Reading',
  '文学欣赏':     'Literary Appreciation',
  '语言分析':     'Language Analysis',
  '推论与评价':   'Inference & Evaluation',
  '记叙文与描写文': 'Narrative & Descriptive Writing',
  '议论文':       'Argumentative Writing',
  '说明文':       'Expository Writing',
  '应用文写作':   'Functional Writing',
  '文章结构与衔接': 'Essay Structure & Cohesion',
  '聆听理解':     'Listening Comprehension',
  '口语表达':     'Oral Expression',
  '小组讨论':     'Group Discussion',
  '词汇与成语':   'Vocabulary & Idioms',
  '语法与句式':   'Grammar & Sentence Structures',
  '标点符号与修辞': 'Punctuation & Rhetorical Devices',
};
