import { PrismaClient, Role, MasteryLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertChapter(subjectId: string, name: string) {
  const existing = await prisma.chapter.findFirst({ where: { subjectId, name } });
  if (existing) return existing;
  return prisma.chapter.create({ data: { subjectId, name } });
}

async function upsertKnowledgePoint(chapterId: string, name: string, desc: string) {
  const existing = await prisma.knowledgePoint.findFirst({ where: { chapterId, name } });
  if (existing) return existing;
  return prisma.knowledgePoint.create({ data: { chapterId, name, desc } });
}

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  // ── Users ────────────────────────────────────────────────────────────────

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

  await prisma.userParent.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: student.id } },
    update: {},
    create: { parentId: parent.id, childId: student.id }
  });

  // ── Schools ──────────────────────────────────────────────────────────────

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

  // ── Subjects, Chapters & Knowledge Points ────────────────────────────────

  // Chinese Language
  const chinese = await prisma.subject.upsert({
    where: { name: 'Chinese Language' },
    update: {},
    create: { name: 'Chinese Language' }
  });

  const chineseReading = await upsertChapter(chinese.id, 'Reading Comprehension');
  await upsertKnowledgePoint(chineseReading.id, 'Identifying Main Idea', 'Locate and summarise the central idea of a passage.');
  await upsertKnowledgePoint(chineseReading.id, 'Inferring Word Meaning', 'Deduce the meaning of unfamiliar words from context.');
  await upsertKnowledgePoint(chineseReading.id, 'Understanding Text Structure', 'Recognise how a passage is organised and how sections relate.');

  const chineseWriting = await upsertChapter(chinese.id, 'Writing');
  await upsertKnowledgePoint(chineseWriting.id, 'Narrative Writing', 'Write a coherent story with a clear setting, plot and characters.');
  await upsertKnowledgePoint(chineseWriting.id, 'Argumentative Writing', 'Present and support a viewpoint with evidence and logical reasoning.');
  await upsertKnowledgePoint(chineseWriting.id, 'Descriptive Writing', 'Use sensory details and figurative language to paint a vivid picture.');

  const chineseLang = await upsertChapter(chinese.id, 'Language Conventions');
  await upsertKnowledgePoint(chineseLang.id, 'Sentence Structure', 'Construct grammatically correct sentences of varying types.');
  await upsertKnowledgePoint(chineseLang.id, 'Punctuation', 'Apply Chinese punctuation marks accurately in writing.');
  await upsertKnowledgePoint(chineseLang.id, 'Vocabulary Building', 'Expand active vocabulary through word families and idioms.');

  // English Language
  const english = await prisma.subject.upsert({
    where: { name: 'English Language' },
    update: {},
    create: { name: 'English Language' }
  });

  const engReading = await upsertChapter(english.id, 'Reading');
  await upsertKnowledgePoint(engReading.id, 'Main Idea and Supporting Details', 'Distinguish the central argument from supporting evidence in a text.');
  await upsertKnowledgePoint(engReading.id, 'Vocabulary in Context', 'Determine word meaning from surrounding sentences and clues.');
  await upsertKnowledgePoint(engReading.id, 'Making Inferences', 'Draw reasonable conclusions from implicit information in a passage.');

  const engWriting = await upsertChapter(english.id, 'Writing');
  await upsertKnowledgePoint(engWriting.id, 'Essay Structure and Organisation', 'Plan and write essays with a clear introduction, body and conclusion.');
  await upsertKnowledgePoint(engWriting.id, 'Grammar and Punctuation', 'Apply tense, subject-verb agreement, and punctuation rules correctly.');
  await upsertKnowledgePoint(engWriting.id, 'Writing with Purpose', 'Adapt tone, register and form for different audiences and purposes.');

  const engSpeaking = await upsertChapter(english.id, 'Listening and Speaking');
  await upsertKnowledgePoint(engSpeaking.id, 'Active Listening Strategies', 'Identify key points, tone and intent while listening to spoken text.');
  await upsertKnowledgePoint(engSpeaking.id, 'Oral Presentation Skills', 'Deliver a structured presentation clearly with appropriate pacing.');

  // Mathematics
  const maths = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics' }
  });

  const algebra = await upsertChapter(maths.id, 'Algebra');
  await upsertKnowledgePoint(algebra.id, 'Solving Linear Equations', 'Find the unknown variable in one- and two-step linear equations.');
  await upsertKnowledgePoint(algebra.id, 'Quadratic Equations', 'Solve quadratic equations by factorisation and the quadratic formula.');
  await upsertKnowledgePoint(algebra.id, 'Working with Fractions', 'Add, subtract, multiply and divide algebraic fractions.');

  const geometry = await upsertChapter(maths.id, 'Geometry');
  await upsertKnowledgePoint(geometry.id, 'Area and Perimeter', 'Calculate area and perimeter of common 2D shapes.');
  await upsertKnowledgePoint(geometry.id, 'Angles in Triangles', 'Apply angle sum and exterior angle properties of triangles.');
  await upsertKnowledgePoint(geometry.id, 'Circle Theorems', 'Use circle properties including arc, chord and tangent relationships.');

  const stats = await upsertChapter(maths.id, 'Statistics and Probability');
  await upsertKnowledgePoint(stats.id, 'Mean, Median and Mode', 'Calculate and interpret measures of central tendency.');
  await upsertKnowledgePoint(stats.id, 'Reading Statistical Graphs', 'Extract and compare data from bar charts, pie charts and histograms.');
  await upsertKnowledgePoint(stats.id, 'Basic Probability', 'Calculate the probability of single and combined events.');

  // ── Sample Progress ──────────────────────────────────────────────────────

  const linearEq = await prisma.knowledgePoint.findFirst({ where: { name: 'Solving Linear Equations' } });
  if (linearEq) {
    await prisma.progress.upsert({
      where: { studentId_knowledgePointId: { studentId: student.id, knowledgePointId: linearEq.id } },
      update: {},
      create: { studentId: student.id, knowledgePointId: linearEq.id, mastery: MasteryLevel.PARTIAL, studyTimeSeconds: 1200 }
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
