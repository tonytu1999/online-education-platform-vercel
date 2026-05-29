import { PrismaClient, Role, MasteryLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertChapter(subjectId: string, name: string) {
  return prisma.chapter.upsert({
    where: { subjectId_name: { subjectId, name } },
    update: {},
    create: { subjectId, name }
  });
}

async function upsertKnowledgePoint(chapterId: string, name: string, desc: string) {
  return prisma.knowledgePoint.upsert({
    where: { chapterId_name: { chapterId, name } },
    update: { desc },
    create: { chapterId, name, desc }
  });
}

async function main() {
  console.log('Clearing old data...');
  await prisma.chatHistory.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.mentalHealth.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.userParent.deleteMany();
  await prisma.knowledgePoint.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.forbiddenKeyword.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old data cleared.');

  console.log('Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  // ── Users ────────────────────────────────────────────────────────────────
  console.log('[1/8] Seeding users...');

  await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: { password, role: Role.SCHOOL_ADMIN },
    create: { name: 'Admin User', email: 'admin@school.com', password, role: Role.SCHOOL_ADMIN }
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Mr. Smith', email: 'teacher@school.com', password, role: Role.TEACHER }
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Ms. Chen', email: 'teacher2@school.com', password, role: Role.TEACHER }
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: 'teacher3@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Mr. Williams', email: 'teacher3@school.com', password, role: Role.TEACHER }
  });

  // School 2 teachers
  const teacher4 = await prisma.user.upsert({
    where: { email: 'teacher4@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Ms. Lam', email: 'teacher4@school.com', password, role: Role.TEACHER }
  });

  const teacher5 = await prisma.user.upsert({
    where: { email: 'teacher5@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Mr. Cheung', email: 'teacher5@school.com', password, role: Role.TEACHER }
  });

  const teacher6 = await prisma.user.upsert({
    where: { email: 'teacher6@school.com' },
    update: { password, role: Role.TEACHER },
    create: { name: 'Ms. Ho', email: 'teacher6@school.com', password, role: Role.TEACHER }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@school.com' },
    update: { password, role: Role.STUDENT },
    create: { name: 'Alice', email: 'student@school.com', phone: '1234567890', password, role: Role.STUDENT }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@family.com' },
    update: { password, role: Role.PARENT },
    create: { name: 'Alice Parent', email: 'parent@family.com', password, role: Role.PARENT }
  });

  // ── Relationships ────────────────────────────────────────────────────────
  console.log('[2/8] Seeding parent-child relationships...');

  await prisma.userParent.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: student.id } },
    update: {},
    create: { parentId: parent.id, childId: student.id }
  });

  // ── Schools ──────────────────────────────────────────────────────────────
  console.log('[3/8] Seeding schools...');

  const school = await prisma.school.upsert({
    where: { code: 'HS001' },
    update: {},
    create: { name: 'No. 1 Primary School', code: 'HS001' }
  });

  const school2 = await prisma.school.upsert({
    where: { code: 'HS002' },
    update: {},
    create: { name: 'No. 2 High School', code: 'HS002' }
  });

  // ── Legacy class (keeps student@school.com enrolment intact) ─────────────
  console.log('[4/8] Seeding classes...');

  const mathClass = await prisma.class.upsert({
    where: { code: 'MATH101' },
    update: {},
    create: { name: 'Math 101', code: 'MATH101', schoolId: school.id, teacherId: teacher.id }
  });

  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: mathClass.id, studentId: student.id } },
    update: {},
    create: { classId: mathClass.id, studentId: student.id }
  });

  // ── Form classes S1–S6 (school 1) and F1–F6 (school 2), four classes each ──

  const classLetters = ['A', 'B', 'C', 'D'];

  // School 1: S1–S6 — teachers 1–3
  // School 2: F1–F6 — teachers 4–6
  const formMeta = (form: string): { schoolId: string; teacherId: string } => {
    if (['S1', 'S2'].includes(form)) return { schoolId: school.id,  teacherId: teacher.id  };
    if (['S3', 'S4'].includes(form)) return { schoolId: school.id,  teacherId: teacher2.id };
    if (['S5', 'S6'].includes(form)) return { schoolId: school.id,  teacherId: teacher3.id };
    if (['F1', 'F2'].includes(form)) return { schoolId: school2.id, teacherId: teacher4.id };
    if (['F3', 'F4'].includes(form)) return { schoolId: school2.id, teacherId: teacher5.id };
    return                                   { schoolId: school2.id, teacherId: teacher6.id };
  };

  const forms = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
  const classMap: Record<string, { id: string }> = {};
  for (const form of forms) {
    for (const letter of classLetters) {
      const code = `${form}${letter}`;
      const cls = await prisma.class.upsert({
        where: { code },
        update: {},
        create: { name: `${form} Class ${letter}`, code, ...formMeta(form) }
      });
      classMap[code] = cls;
    }
  }

  // ── Students: 10 per class, 480 total ────────────────────────────────────
  // 20 surnames × 24 given names = 480 unique combinations
  console.log('[5/8] Seeding students (480 total across 48 classes)...');

  const surnames = [
    'Chan', 'Wong', 'Lee',  'Lau',  'Cheung', 'Ng',   'Ho',  'Tam',
    'Yip',  'Man',  'Tsang','Chow', 'Hui',    'Tang', 'Kwok','Leung',
    'Wu',   'Lo',   'Ma',   'Fung'
  ];
  const givenNames = [
    'Michael', 'Emily',  'Thomas', 'Chloe',  'David',  'Sophie',
    'Kevin',   'Amy',    'Jason',  'Kelly',   'Brian',  'Mandy',
    'Ryan',    'Fanny',  'Eric',   'Iris',    'Alan',   'Candy',
    'Daniel',  'Betty',  'Steven', 'Jenny',   'Tony',   'Vivian'
  ];

  let studentIdx = 0;
  for (const form of forms) {
    console.log(`  → Form ${form} (${classLetters.length} classes × 10 students)`);
    for (const letter of classLetters) {
      const code = `${form}${letter}`;
      for (let i = 0; i < 10; i++) {
        const surname  = surnames[studentIdx % surnames.length];
        const given    = givenNames[Math.floor(studentIdx / surnames.length) % givenNames.length];
        const email    = `${form.toLowerCase()}${letter.toLowerCase()}${String(i + 1).padStart(2, '0')}@school.com`;

        const s = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { name: `${surname} ${given}`, email, password, role: Role.STUDENT }
        });

        await prisma.classStudent.upsert({
          where: { classId_studentId: { classId: classMap[code].id, studentId: s.id } },
          update: {},
          create: { classId: classMap[code].id, studentId: s.id }
        });

        studentIdx++;
      }
    }
  }

  // ── Subjects, Chapters & Knowledge Points (HKDSE curriculum) ────────────
  console.log('[6/8] Seeding subjects, chapters & knowledge points...');

  // ── Mathematics ──────────────────────────────────────────────────────────
  console.log('  → Mathematics');

  const maths = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics' }
  });

  // F1–3: Number & Algebra
  const mathAlg13 = await upsertChapter(maths.id, '数与代数（中一至中三）');
  await upsertKnowledgePoint(mathAlg13.id, '有理数运算', 'Arithmetic operations on integers and rational numbers including directed numbers.');
  await upsertKnowledgePoint(mathAlg13.id, '代数式与因式分解', 'Simplifying algebraic expressions and factorising polynomials by common factor, grouping and quadratic form.');
  await upsertKnowledgePoint(mathAlg13.id, '一元一次方程', 'Solving linear equations in one unknown; forming and solving equations in context.');
  await upsertKnowledgePoint(mathAlg13.id, '联立方程', 'Solving simultaneous linear equations in two unknowns by substitution and elimination.');
  await upsertKnowledgePoint(mathAlg13.id, '二次方程', 'Solving quadratic equations by factorisation, completing the square and the quadratic formula; discriminant and nature of roots.');
  await upsertKnowledgePoint(mathAlg13.id, '函数与图象（初步）', 'Concept of a function; graphing and interpreting linear and quadratic functions; domain and range.');
  await upsertKnowledgePoint(mathAlg13.id, '指数与对数（入门）', 'Laws of indices; scientific notation; introduction to logarithms and their basic properties.');
  await upsertKnowledgePoint(mathAlg13.id, '不等式（入门）', 'Solving linear inequalities in one unknown; representing solutions on a number line.');

  // F1–3: Measures, Shape & Space
  const mathGeo13 = await upsertChapter(maths.id, '量度、图形与空间（中一至中三）');
  await upsertKnowledgePoint(mathGeo13.id, '三角形的性质', 'Angle sum, exterior angle; congruence conditions (SSS, SAS, AAS, RHS); Pythagoras\' theorem and its converse.');
  await upsertKnowledgePoint(mathGeo13.id, '四边形与多边形', 'Properties of parallelograms, rectangles, rhombus and trapezoids; sum of interior and exterior angles of polygons.');
  await upsertKnowledgePoint(mathGeo13.id, '圆的性质（基础）', 'Chord properties; inscribed angle theorem; angles in the same segment; cyclic quadrilateral; tangent from an external point.');
  await upsertKnowledgePoint(mathGeo13.id, '相似图形', 'Conditions for similar triangles (AA, SAS, SSS ratios); ratio of corresponding sides, areas and volumes.');
  await upsertKnowledgePoint(mathGeo13.id, '坐标几何（入门）', 'Distance formula; mid-point formula; gradient of a line segment; collinearity.');
  await upsertKnowledgePoint(mathGeo13.id, '立体图形', 'Surface area and volume of prisms, pyramids, cylinders, cones and spheres; composite solids.');

  // F1–3: Data Handling
  const mathData13 = await upsertChapter(maths.id, '数据处理（中一至中三）');
  await upsertKnowledgePoint(mathData13.id, '统计图表', 'Constructing and interpreting bar charts, line graphs, pie charts, stem-and-leaf diagrams, histograms and cumulative frequency polygons.');
  await upsertKnowledgePoint(mathData13.id, '集中趋势量数', 'Mean, median and mode for ungrouped and grouped data; weighted mean; choosing the most appropriate measure.');
  await upsertKnowledgePoint(mathData13.id, '离散程度量数', 'Range, interquartile range and standard deviation; box-and-whisker plots; interpreting spread in context.');
  await upsertKnowledgePoint(mathData13.id, '概率（基础）', 'Classical probability definition; mutually exclusive and independent events; calculating probabilities using tree diagrams and listing.');

  // F4–6 Compulsory: Number & Algebra
  const mathAlg46 = await upsertChapter(maths.id, '数与代数（中四至中六必修）');
  await upsertKnowledgePoint(mathAlg46.id, '二次方程式', 'Solving quadratic equations; discriminant and nature of roots; sum and product of roots (Vieta\'s formulas); forming equations from given roots.');
  await upsertKnowledgePoint(mathAlg46.id, '函数及其图象', 'Properties and graphs of quadratic, linear and absolute value functions; axis of symmetry; vertex form; transformations of graphs.');
  await upsertKnowledgePoint(mathAlg46.id, '指数函数及对数函数', 'Graphs and properties of exponential and logarithmic functions; change of base; solving exponential and logarithmic equations.');
  await upsertKnowledgePoint(mathAlg46.id, '多项式', 'Polynomial long division; Remainder Theorem; Factor Theorem; solving higher-degree polynomial equations by factor theorem and inspection.');
  await upsertKnowledgePoint(mathAlg46.id, '有理函数与部分分式', 'Simplification of rational functions; decomposition into partial fractions (distinct linear and repeated linear factors).');
  await upsertKnowledgePoint(mathAlg46.id, '等差及等比数列', 'General term and sum formula of arithmetic (AP) and geometric (GP) sequences and series; applications including compound interest.');
  await upsertKnowledgePoint(mathAlg46.id, '不等式', 'Solving absolute value inequalities and quadratic inequalities; applications in real-world contexts.');
  await upsertKnowledgePoint(mathAlg46.id, '线性规划', 'Graphical method; feasible region; objective function; finding optimal value; formulating real-world linear programming problems.');

  // F4–6 Compulsory: Measures, Shape & Space
  const mathGeo46 = await upsertChapter(maths.id, '度量、图形与空间（中四至中六必修）');
  await upsertKnowledgePoint(mathGeo46.id, '圆的基本性质', 'Angle at centre and circumference; angles in the same segment; cyclic quadrilateral; tangent–chord angle; tangent from external point.');
  await upsertKnowledgePoint(mathGeo46.id, '三角比', 'Sine, cosine and tangent for acute and obtuse angles; trigonometric ratios of special angles; solving right-angled triangles; angles of elevation and depression.');
  await upsertKnowledgePoint(mathGeo46.id, '直线方程', 'Slope; slope-intercept, point-slope and intercept forms; parallel and perpendicular lines; distance from a point to a line.');
  await upsertKnowledgePoint(mathGeo46.id, '正弦定理与余弦定理', 'Sine rule, cosine rule and area formula (½ab sinC); solving triangles; 2D and 3D trigonometric problems including bearings.');
  await upsertKnowledgePoint(mathGeo46.id, '圆的方程', 'Standard and general equation of a circle; position of a point relative to a circle; equation of tangent; locus problems involving lines and circles.');
  await upsertKnowledgePoint(mathGeo46.id, '几何变换', 'Translation, reflection, rotation and enlargement in the coordinate plane; properties preserved under each transformation.');
  await upsertKnowledgePoint(mathGeo46.id, '立体图形（进阶）', 'Surface area and volume of composite 3D figures; problems involving prisms, pyramids, cones and spheres in 3D settings.');

  // F4–6 Compulsory: Data Handling
  const mathData46 = await upsertChapter(maths.id, '数据处理（中四至中六必修）');
  await upsertKnowledgePoint(mathData46.id, '排列与组合', 'Addition and multiplication principles; permutation P(n,r) and combination C(n,r); applications in counting problems.');
  await upsertKnowledgePoint(mathData46.id, '概率', 'Classical probability; mutually exclusive events; complementary events; independent events; basic conditional probability P(A|B).');
  await upsertKnowledgePoint(mathData46.id, '频率分布与统计图', 'Frequency distribution tables; class intervals; histograms; cumulative frequency polygon (Ogive); reading and constructing statistical graphs.');
  await upsertKnowledgePoint(mathData46.id, '集中趋势量数（进阶）', 'Weighted mean; estimating mean, median and mode from grouped frequency distributions.');
  await upsertKnowledgePoint(mathData46.id, '离散程度量数（进阶）', 'Standard deviation and variance from grouped and ungrouped data; interquartile range; box-and-whisker plots; comparing distributions.');

  // Extended Module 1: Calculus & Statistics (M1)
  const mathM1 = await upsertChapter(maths.id, '延伸部分单元一（微积分与统计）');
  await upsertKnowledgePoint(mathM1.id, '导数与微分法则', 'Limits; derivative definition; sum, product, quotient and chain rules; differentiating polynomials, exponential, logarithmic and trigonometric functions.');
  await upsertKnowledgePoint(mathM1.id, '导数的应用', 'Equations of tangent and normal; increasing/decreasing functions; local maxima and minima; optimisation; rates of change and related rates.');
  await upsertKnowledgePoint(mathM1.id, '积分基础', 'Indefinite integrals and standard formulae; definite integrals; Fundamental Theorem of Calculus; trapezoidal rule for numerical integration.');
  await upsertKnowledgePoint(mathM1.id, '积分的应用', 'Integration by substitution; area between a curve and the x-axis; area between two curves; volume of solid of revolution.');
  await upsertKnowledgePoint(mathM1.id, '离散概率分布', 'Discrete random variables; expectation E(X) and variance Var(X); Binomial distribution B(n,p); Poisson distribution Po(λ); using tables.');
  await upsertKnowledgePoint(mathM1.id, '连续概率分布', 'Normal distribution N(μ,σ²); standardisation to Z-scores; use of standard normal tables; sampling distribution of the sample mean.');
  await upsertKnowledgePoint(mathM1.id, '抽样与估计', 'Point estimation; confidence intervals for population mean (known and unknown variance); interpretation of confidence intervals.');
  await upsertKnowledgePoint(mathM1.id, '假设检验与回归', 'One-sample z-test and t-test (significance level and critical region); Pearson correlation coefficient r; least-squares regression line; making predictions.');

  // Extended Module 2: Algebra & Calculus (M2)
  const mathM2 = await upsertChapter(maths.id, '延伸部分单元二（代数与微积分）');
  await upsertKnowledgePoint(mathM2.id, '向量（二维与三维）', 'Vector representation, addition, subtraction and scalar multiplication; dot (scalar) product; angle between vectors; projection.');
  await upsertKnowledgePoint(mathM2.id, '向量的应用', 'Cross (vector) product; vector equations of lines in 2D and 3D; vector equations of planes; distances and angles in 3D geometry.');
  await upsertKnowledgePoint(mathM2.id, '矩阵', 'Matrix addition, scalar multiplication and multiplication; identity matrix; zero matrix; transpose; conditions for matrix products.');
  await upsertKnowledgePoint(mathM2.id, '行列式与逆矩阵', 'Determinants of 2×2 and 3×3 matrices; properties of determinants; inverse matrix; solving systems of linear equations (Cramer\'s rule and row reduction).');
  await upsertKnowledgePoint(mathM2.id, '微分进阶', 'Implicit differentiation; parametric differentiation; higher-order derivatives; L\'Hôpital\'s rule for indeterminate forms.');
  await upsertKnowledgePoint(mathM2.id, '积分技巧', 'Integration by parts; integration by partial fractions; definite integrals; applications to arc length and volume of surface of revolution.');
  await upsertKnowledgePoint(mathM2.id, '微分方程', 'First-order separable differential equations; first-order linear differential equations; solving with initial conditions; modelling applications.');

  // ── English Language ──────────────────────────────────────────────────────
  console.log('  → English Language');

  const english = await prisma.subject.upsert({
    where: { name: 'English Language' },
    update: {},
    create: { name: 'English Language' }
  });

  const engReading = await upsertChapter(english.id, 'Reading');
  await upsertKnowledgePoint(engReading.id, 'Main Idea and Supporting Details', 'Identify the central argument or theme and distinguish it from supporting evidence across different text types.');
  await upsertKnowledgePoint(engReading.id, 'Vocabulary in Context', 'Determine the meaning of words, phrases and expressions from surrounding context, register and tone.');
  await upsertKnowledgePoint(engReading.id, 'Text Type and Structure', 'Recognise and analyse how different text types (narrative, expository, argumentative, functional) are organised.');
  await upsertKnowledgePoint(engReading.id, 'Inference and Interpretation', 'Draw reasonable conclusions from implicit information; interpret figurative language, symbolism and imagery.');
  await upsertKnowledgePoint(engReading.id, "Author's Purpose and Viewpoint", "Identify the writer's purpose, attitude, tone and intended audience; evaluate bias and perspective.");

  const engWriting = await upsertChapter(english.id, 'Writing');
  await upsertKnowledgePoint(engWriting.id, 'Essay Planning and Structure', 'Organise ideas into a coherent essay with a focused introduction, well-developed body paragraphs and a conclusion.');
  await upsertKnowledgePoint(engWriting.id, 'Argumentative and Expository Writing', 'Present arguments with evidence and logical reasoning; acknowledge and refute counter-arguments; maintain an objective tone.');
  await upsertKnowledgePoint(engWriting.id, 'Descriptive and Narrative Writing', 'Use sensory details, figurative language, dialogue and narrative techniques; maintain consistent point of view and tense.');
  await upsertKnowledgePoint(engWriting.id, 'Functional Writing', 'Write task-specific texts — reports, formal and informal letters, emails, articles and speeches — with correct format and register.');
  await upsertKnowledgePoint(engWriting.id, 'Grammar and Sentence Variety', 'Apply grammatical accuracy; vary sentence structures for effect; use cohesive devices (connectives, reference, substitution) to link ideas.');

  const engSpeaking = await upsertChapter(english.id, 'Listening and Speaking');
  await upsertKnowledgePoint(engSpeaking.id, 'Listening Comprehension', 'Identify key information, speaker purpose, attitude and implied meaning in spoken texts including talks, discussions and broadcasts.');
  await upsertKnowledgePoint(engSpeaking.id, 'Note-taking and Summary', 'Record key points systematically while listening; produce accurate and concise written summaries from spoken input.');
  await upsertKnowledgePoint(engSpeaking.id, 'Oral Presentation', 'Deliver structured presentations clearly and fluently; use appropriate pace, volume, pausing and visual support.');
  await upsertKnowledgePoint(engSpeaking.id, 'Group Interaction', 'Participate constructively in discussions; express, justify and respond to opinions; manage turn-taking and reach consensus.');

  const engLang = await upsertChapter(english.id, 'Language Study');
  await upsertKnowledgePoint(engLang.id, 'Vocabulary and Idioms', 'Build active vocabulary through word formation, collocations, idioms and phrasal verbs; distinguish formal and informal lexis.');
  await upsertKnowledgePoint(engLang.id, 'Grammar in Context', 'Understand tense, aspect, modality, voice and complex sentence structures; recognise how grammar choices convey meaning.');
  await upsertKnowledgePoint(engLang.id, 'Discourse and Cohesion', 'Analyse reference, substitution, ellipsis and discourse markers; understand how cohesive devices achieve coherence across a text.');

  // ── Chinese Language (语文) ───────────────────────────────────────────────
  console.log('  → Chinese Language');

  const chinese = await prisma.subject.upsert({
    where: { name: 'Chinese Language' },
    update: {},
    create: { name: 'Chinese Language' }
  });

  const chineseReading = await upsertChapter(chinese.id, '阅读');
  await upsertKnowledgePoint(chineseReading.id, '文意理解', '理解文章的主旨、段落要义及关键信息，归纳内容要点，比较不同段落或观点之间的异同。');
  await upsertKnowledgePoint(chineseReading.id, '文言文阅读', '理解文言文的字词义、虚词用法及特殊句式；分析文章的思想内容、结构层次与写作意图。');
  await upsertKnowledgePoint(chineseReading.id, '文学欣赏', '分析文学作品（诗歌、散文、小说、戏剧）的主题、人物形象、情节发展及艺术手法（意象、象征、对比等）。');
  await upsertKnowledgePoint(chineseReading.id, '语言分析', '辨析词语的感情色彩与语境义；分析修辞手法（比喻、排比、拟人、借代等）的表达效果。');
  await upsertKnowledgePoint(chineseReading.id, '推论与评价', '根据文章内容作出合理推断；对作者的观点、立场及写作手法进行批判性评价。');

  const chineseWriting = await upsertChapter(chinese.id, '写作');
  await upsertKnowledgePoint(chineseWriting.id, '记叙文与描写文', '叙述人物经历与事件，运用细节描写、心理描写及感官描写，结构完整，叙事生动。');
  await upsertKnowledgePoint(chineseWriting.id, '议论文', '提出明确论点，运用事实、数据及逻辑推理加以论证，适当驳斥对立观点，结构严谨。');
  await upsertKnowledgePoint(chineseWriting.id, '说明文', '条理分明地介绍事物特点或阐释概念，善用说明方法（分类、比较、举例、数字说明）。');
  await upsertKnowledgePoint(chineseWriting.id, '应用文写作', '掌握书信、通告、报告、演讲稿等实用文体的格式规范、语气要求及内容组织。');
  await upsertKnowledgePoint(chineseWriting.id, '文章结构与衔接', '运用段落组织、过渡句与关联词语（转折、递进、因果等）使文章结构清晰、行文连贯。');

  const chineseOral = await upsertChapter(chinese.id, '听说');
  await upsertKnowledgePoint(chineseOral.id, '聆听理解', '聆听时辨识主要内容、关键信息及说话者的态度、目的与隐含意思。');
  await upsertKnowledgePoint(chineseOral.id, '口语表达', '发音准确，语调自然，层次分明地表达意见；根据情境选择适当用语，语气得体。');
  await upsertKnowledgePoint(chineseOral.id, '小组讨论', '主动参与讨论，适时回应、补充或质疑他人观点，有效推动讨论深入，归纳共识。');

  const chineseLang = await upsertChapter(chinese.id, '语文知识');
  await upsertKnowledgePoint(chineseLang.id, '词汇与成语', '积累词汇，辨析同义词与近义词的语义差异，正确运用成语、惯用语及关联词语。');
  await upsertKnowledgePoint(chineseLang.id, '语法与句式', '辨析词性与句子成分；掌握复杂句式（复句、倒装句、被动句）及文言文常见特殊句式。');
  await upsertKnowledgePoint(chineseLang.id, '标点符号与修辞', '正确使用各类标点符号（引号、顿号、分号等）；掌握并运用多种修辞手法以提升文章表达效果。');

  // ── Sample Progress ──────────────────────────────────────────────────────
  console.log('[7/8] Seeding sample progress & mental health records...');

  const sampleKp = await prisma.knowledgePoint.findFirst({ where: { name: '二次方程式' } });
  if (sampleKp) {
    await prisma.progress.upsert({
      where: { studentId_knowledgePointId: { studentId: student.id, knowledgePointId: sampleKp.id } },
      update: {},
      create: { studentId: student.id, knowledgePointId: sampleKp.id, mastery: MasteryLevel.PARTIAL, studyTimeSeconds: 1200 }
    });
  }

  // ── Sample Mental Health Record ──────────────────────────────────────────

  const existingMH = await prisma.mentalHealth.findFirst({ where: { studentId: student.id, analysisModel: 'seed' } });
  if (!existingMH) {
    await prisma.mentalHealth.create({
      data: {
        studentId: student.id,
        statusScore: 18,
        scoreDelta: 6,
        statusLabel: 'GOOD',
        reasonSummary: 'The student sounds engaged, supported, and steady during the sample wellbeing check.',
        signals: 'happy, engaged',
        emotionPolarity: 'POSITIVE',
        riskLevel: 'LOW',
        keywords: 'happy, engaged',
        analysisModel: 'seed'
      }
    });
  }

  // ── System Config ────────────────────────────────────────────────────────
  console.log('[8/8] Seeding system config & forbidden keywords...');

  await prisma.systemConfig.upsert({
    where: { key: 'MENTAL_HEALTH_SYSTEM_PROMPT' },
    update: {
      value: 'You are a student wellbeing analysis assistant. Return JSON only with scoreDelta, statusLabel, reasonSummary, signals, emotionPolarity, and riskLevel. Do not store or repeat the raw dialogue.'
    },
    create: {
      key: 'MENTAL_HEALTH_SYSTEM_PROMPT',
      value: 'You are a student wellbeing analysis assistant. Return JSON only with scoreDelta, statusLabel, reasonSummary, signals, emotionPolarity, and riskLevel. Do not store or repeat the raw dialogue.'
    }
  });

  // ── Forbidden Keywords ───────────────────────────────────────────────────

  const forbiddenWords = ['violence', 'suicide', 'self-harm', 'drugs'];
  for (const word of forbiddenWords) {
    await prisma.forbiddenKeyword.upsert({
      where: { word },
      update: {},
      create: { word }
    });
  }

  console.log('Seeding complete.');
  console.log('');
  console.log('School 1 (HS001 · No. 1 Primary School): S1–S6 × A–D = 24 classes, 240 students');
  console.log('  Teachers: Mr. Smith (S1–S2) · Ms. Chen (S3–S4) · Mr. Williams (S5–S6)');
  console.log('School 2 (HS002 · No. 2 High School): F1–F6 × A–D = 24 classes, 240 students');
  console.log('  Teachers: Ms. Lam (F1–F2) · Mr. Cheung (F3–F4) · Ms. Ho (F5–F6)');
  console.log('  Student emails: s1a01@school.com … f6d10@school.com  (password: password123)');
  console.log('');
  console.log('Test accounts (password: password123)');
  console.log('  admin@school.com    — SCHOOL_ADMIN');
  console.log('  teacher@school.com  — TEACHER (Mr. Smith,    HS001 S1–S2)');
  console.log('  teacher2@school.com — TEACHER (Ms. Chen,     HS001 S3–S4)');
  console.log('  teacher3@school.com — TEACHER (Mr. Williams, HS001 S5–S6)');
  console.log('  teacher4@school.com — TEACHER (Ms. Lam,      HS002 F1–F2)');
  console.log('  teacher5@school.com — TEACHER (Mr. Cheung,   HS002 F3–F4)');
  console.log('  teacher6@school.com — TEACHER (Ms. Ho,       HS002 F5–F6)');
  console.log('  student@school.com  — STUDENT (Alice, MATH101)');
  console.log('  parent@family.com   — PARENT');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
