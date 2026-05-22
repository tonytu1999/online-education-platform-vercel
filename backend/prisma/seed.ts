import { PrismaClient, Role, MasteryLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake data...');

  // Hash password for all users
  const password = await bcrypt.hash('password123', 10);

  // 1. Create a School
  const school1 = await prisma.school.upsert({
    where: { code: 'HS001' },
    update: {},
    create: { name: 'No. 1 High School', code: 'HS001' }
  });

  // 2. Create Users (Admin, Teacher, Student, Parent)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@school.com', password, role: Role.SCHOOL_ADMIN }
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: { name: 'Mr. Smith', email: 'teacher@school.com', password, role: Role.TEACHER }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@school.com' },
    update: {},
    create: { name: 'Alice', email: 'student@school.com', phone: '1234567890', password, role: Role.STUDENT }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@family.com' },
    update: {},
    create: { name: 'Alice Parent', email: 'parent@family.com', password, role: Role.PARENT }
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
      create: { studentId: student.id, knowledgePointId: kp.id, mastery: MasteryLevel.PARTIAL, studyTimeSeconds: 1200 }
    });
  }

  // 8. Add Mental Health Record
  await prisma.mentalHealth.create({
    data: {
      studentId: student.id,
      emotionPolarity: 'POSITIVE',
      riskLevel: 'LOW',
      keywords: 'happy, engaged'
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
