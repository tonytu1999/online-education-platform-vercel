"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding fake data...');
    // Hash password for all users with an explicit salt
    const salt = await bcryptjs_1.default.genSalt(10);
    const password = await bcryptjs_1.default.hash('password123', salt);
    // 1. Create a School
    const school1 = await prisma.school.upsert({
        where: { code: 'HS001' },
        update: {},
        create: { name: 'No. 1 High School', code: 'HS001' }
    });
    // 2. Create Users (Admin, Teacher, Student, Parent)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@school.com' },
        update: { name: 'Admin User', password, role: client_1.Role.SCHOOL_ADMIN },
        create: { name: 'Admin User', email: 'admin@school.com', password, role: client_1.Role.SCHOOL_ADMIN }
    });
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@school.com' },
        update: { name: 'Mr. Smith', password, role: client_1.Role.TEACHER },
        create: { name: 'Mr. Smith', email: 'teacher@school.com', password, role: client_1.Role.TEACHER }
    });
    const student = await prisma.user.upsert({
        where: { email: 'student@school.com' },
        update: { name: 'Alice', phone: '1234567890', password, role: client_1.Role.STUDENT },
        create: { name: 'Alice', email: 'student@school.com', phone: '1234567890', password, role: client_1.Role.STUDENT }
    });
    const parent = await prisma.user.upsert({
        where: { email: 'parent@family.com' },
        update: { name: 'Alice Parent', password, role: client_1.Role.PARENT },
        create: { name: 'Alice Parent', email: 'parent@family.com', password, role: client_1.Role.PARENT }
    });
    // 3. Link Parent to Student
    await prisma.userParent.upsert({
        where: { parentId_childId: { parentId: parent.id, childId: student.id } },
        update: {},
        create: { parentId: parent.id, childId: student.id }
    });
    // 4. Create a Class & Assign Teacher
    const mathClass = await prisma.class.upsert({
        where: { code: 'MATH101' },
        update: {},
        create: { name: 'Math 101', code: 'MATH101', schoolId: school1.id, teacherId: teacher.id }
    });
    // 5. Enroll Student in Class
    await prisma.classStudent.upsert({
        where: { classId_studentId: { classId: mathClass.id, studentId: student.id } },
        update: {},
        create: { classId: mathClass.id, studentId: student.id }
    });
    // 6. Create Curriculum (Subject -> Chapter -> KnowledgePoint)
    const mathSubject = await prisma.subject.upsert({
        where: { name: 'Mathematics' },
        update: {},
        create: {
            name: 'Mathematics',
            chapters: {
                create: [
                    {
                        name: 'Algebra Basics',
                        knowledgePoints: {
                            create: [
                                { name: 'Solving for x', desc: 'Find the unknown variable in a linear equation.' },
                                { name: 'Fractions', desc: 'Basic operations on fractions.' }
                            ]
                        }
                    }
                ]
            }
        }
    });
    // 7. Add Progress for the Student
    const kp = await prisma.knowledgePoint.findFirst({ where: { name: 'Solving for x' } });
    if (kp) {
        await prisma.progress.upsert({
            where: { studentId_knowledgePointId: { studentId: student.id, knowledgePointId: kp.id } },
            update: {},
            create: { studentId: student.id, knowledgePointId: kp.id, mastery: client_1.MasteryLevel.PARTIAL, studyTimeSeconds: 1200 }
        });
    }
    // 8. Add Mental Health Record
    await prisma.mentalHealth.deleteMany({
        where: {
            studentId: student.id,
            statusScore: 18,
            scoreDelta: 6,
            statusLabel: 'GOOD'
        }
    });
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
    // 9. Add Forbidden Keyword
    await prisma.forbiddenKeyword.upsert({
        where: { word: 'violence' },
        update: {},
        create: { word: 'violence' }
    });
    console.log('? Fake data seeded successfully!');
    console.log('Login credentials:');
    console.log('- Student: student@school.com (password123)');
    console.log('- Teacher: teacher@school.com (password123)');
    console.log('- Parent: parent@family.com (password123)');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
