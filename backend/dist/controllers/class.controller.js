"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStudent = exports.getStudents = exports.joinClass = exports.createClass = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createClass = async (req, res) => {
    try {
        const { name, code, schoolId } = req.body;
        const teacherId = req.user.id;
        const school = await prisma_1.default.school.findUnique({ where: { id: schoolId } });
        if (!school) {
            res.status(404).json({ error: 'School not found' });
            return;
        }
        const newClass = await prisma_1.default.class.create({
            data: { name, code, schoolId, teacherId }
        });
        res.status(201).json(newClass);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create class' });
    }
};
exports.createClass = createClass;
const joinClass = async (req, res) => {
    try {
        const { classCode } = req.body;
        const studentId = req.user.id;
        const classRecord = await prisma_1.default.class.findUnique({ where: { code: classCode } });
        if (!classRecord) {
            res.status(404).json({ error: 'Class not found' });
            return;
        }
        await prisma_1.default.classStudent.create({
            data: { classId: classRecord.id, studentId }
        });
        res.json({ message: 'Successfully joined the class' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to join class' });
    }
};
exports.joinClass = joinClass;
const getStudents = async (req, res) => {
    try {
        const classId = req.params.classId;
        if (req.user.role === 'TEACHER') {
            const cls = await prisma_1.default.class.findUnique({ where: { id: classId } });
            if (cls?.teacherId !== req.user.id) {
                res.status(403).json({ error: 'Not authorized for this class' });
                return;
            }
        }
        const students = await prisma_1.default.classStudent.findMany({
            where: { classId },
            include: {
                student: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            }
        });
        // Cast needed because TS sometimes doesn't catch select expansions correctly internally with map
        res.json(students.map((s) => s.student));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};
exports.getStudents = getStudents;
const removeStudent = async (req, res) => {
    try {
        const classId = req.params.classId;
        const studentId = req.params.studentId;
        if (req.user.role === 'TEACHER') {
            const cls = await prisma_1.default.class.findUnique({ where: { id: classId } });
            if (cls?.teacherId !== req.user.id) {
                res.status(403).json({ error: 'Not authorized for this class' });
                return;
            }
        }
        await prisma_1.default.classStudent.delete({
            where: {
                classId_studentId: { classId, studentId }
            }
        });
        res.json({ message: 'Student removed from class' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove student' });
    }
};
exports.removeStudent = removeStudent;
