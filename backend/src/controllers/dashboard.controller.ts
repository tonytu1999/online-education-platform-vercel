import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getTeacherDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacherId = req.user?.id;
        
        const classes = await prisma.class.findMany({
            where: { teacherId },
            include: {
                students: {
                    include: {
                        student: {
                            include: {
                                progressRecords: true,
                                mentalHealthRecords: true
                            }
                        }
                    }
                }
            }
        });

        // Basic aggregation
        const dashboardStats = classes.map(c => {
            const totalStudents = c.students.length;
            const averageScore = totalStudents > 0 
                ? c.students.reduce((acc, cs) => {
                    const student = cs.student;
                    const studentAvg = student.progressRecords && student.progressRecords.length > 0 
                        ? student.progressRecords.reduce((sum, p) => {
                            const val = p.mastery === 'MASTERED' ? 1 : (p.mastery === 'PARTIAL' ? 0.5 : 0);
                            return sum + val;
                        }, 0) / student.progressRecords.length 
                        : 0;
                    return acc + studentAvg;
                }, 0) / totalStudents
                : 0;

            let alerts = 0;
            c.students.forEach(cs => {
                const student = cs.student;
                const latestMentalHealth = student.mentalHealthRecords && student.mentalHealthRecords[student.mentalHealthRecords.length - 1];
                if (latestMentalHealth && (latestMentalHealth as any).stressLevel && (latestMentalHealth as any).stressLevel > 7) {
                    alerts += 1;
                }
            });

            return {
                classId: c.id,
                className: c.name,
                totalStudents,
                averageScore,
                mentalHealthAlerts: alerts
            };
        });

        res.json(dashboardStats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSchoolAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const adminId = req.user?.id;
        
        const school = await prisma.school.findFirst({
            where: { /* adminId filtering to be applied at application level if needed */ },
            include: {
                classes: {
                    include: {
                        students: {
                            include: {
                                student: {
                                    include: { progressRecords: true, mentalHealthRecords: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!school) {
            res.status(404).json({ error: 'School not found for this admin' });
            return;
        }

        let totalStudents = 0;
        let totalScoreSum = 0;
        let studentCountWithScores = 0;
        let totalAlerts = 0;

        school.classes.forEach(c => {
            totalStudents += c.students.length;
            
            c.students.forEach(cs => {
                const student = cs.student;
                if (student.progressRecords && student.progressRecords.length > 0) {
                    const studentAvg = student.progressRecords.reduce((sum, p) => {
                        const val = p.mastery === 'MASTERED' ? 1 : (p.mastery === 'PARTIAL' ? 0.5 : 0);
                        return sum + val;
                    }, 0) / student.progressRecords.length;
                    totalScoreSum += studentAvg;
                    studentCountWithScores += 1;
                }
                
                const latestMentalHealth = student.mentalHealthRecords && student.mentalHealthRecords[student.mentalHealthRecords.length - 1];
                if (latestMentalHealth && (latestMentalHealth as any).stressLevel && (latestMentalHealth as any).stressLevel > 7) {
                    totalAlerts += 1;
                }
            });
        });

        const overallAverageScore = studentCountWithScores > 0 ? totalScoreSum / studentCountWithScores : 0;

        res.json({
            schoolId: school.id,
            schoolName: school.name,
            totalClasses: school.classes.length,
            totalStudents,
            overallAverageScore,
            totalMentalHealthAlerts: totalAlerts
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
