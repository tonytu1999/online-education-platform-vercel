"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function upsertChapter(subjectId, name) {
    const existing = await prisma.chapter.findFirst({ where: { subjectId, name } });
    if (existing)
        return existing;
    return prisma.chapter.create({ data: { subjectId, name } });
}
async function upsertKnowledgePoint(chapterId, name, desc) {
    const existing = await prisma.knowledgePoint.findFirst({ where: { chapterId, name } });
    if (existing)
        return existing;
    return prisma.knowledgePoint.create({ data: { chapterId, name, desc } });
}
async function main() {
    console.log('Seeding database...');
    const password = await bcryptjs_1.default.hash('password123', 10);
    // ── Users ────────────────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: 'admin@school.com' },
        update: { password, role: client_1.Role.SCHOOL_ADMIN },
        create: { name: 'Admin User', email: 'admin@school.com', password, role: client_1.Role.SCHOOL_ADMIN }
    });
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@school.com' },
        update: { password, role: client_1.Role.TEACHER },
        create: { name: 'Mr. Smith', email: 'teacher@school.com', password, role: client_1.Role.TEACHER }
    });
    const student = await prisma.user.upsert({
        where: { email: 'student@school.com' },
        update: { password, role: client_1.Role.STUDENT },
        create: { name: 'Alice', email: 'student@school.com', phone: '1234567890', password, role: client_1.Role.STUDENT }
    });
    const parent = await prisma.user.upsert({
        where: { email: 'parent@family.com' },
        update: { password, role: client_1.Role.PARENT },
        create: { name: 'Alice Parent', email: 'parent@family.com', password, role: client_1.Role.PARENT }
    });
    // ── Relationships ────────────────────────────────────────────────────────
    await prisma.userParent.upsert({
        where: { parentId_childId: { parentId: parent.id, childId: student.id } },
        update: {},
        create: { parentId: parent.id, childId: student.id }
    });
    // ── School & Class ───────────────────────────────────────────────────────
    const school = await prisma.school.upsert({
        where: { code: 'HS001' },
        update: {},
        create: { name: 'No. 1 High School', code: 'HS001' }
    });
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
            create: { studentId: student.id, knowledgePointId: linearEq.id, mastery: client_1.MasteryLevel.PARTIAL, studyTimeSeconds: 1200 }
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
    console.log('Login credentials (all use password: password123)');
    console.log('  admin@school.com    — SCHOOL_ADMIN');
    console.log('  teacher@school.com  — TEACHER');
    console.log('  student@school.com  — STUDENT');
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
