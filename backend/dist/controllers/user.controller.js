"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindChild = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getProfile = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, name: true, email: true, phone: true, role: true }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const getStudentUuidByEmail = async (req, res) => {
    try {
        const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
        if (!email) {
            res.status(400).json({ error: 'email is required' });
            return;
        }
        const student = await prisma_1.default.user.findFirst({
            where: { email, role: 'STUDENT' },
            select: { id: true }
        });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json({ id: student.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get student uuid' });
    }
};
exports.getStudentUuidByEmail = getStudentUuidByEmail;
const bindChild = async (req, res) => {
    try {
        if (req.user?.role !== 'PARENT') {
            res.status(403).json({ error: 'Fors parents only' });
            return;
        }
        const { childId } = req.body;
        const parentId = req.user.id;
        await prisma_1.default.userParent.create({
            data: { parentId, childId }
        });
        res.json({ message: 'Child bound successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to bind child' });
    }
};
exports.bindChild = bindChild;
