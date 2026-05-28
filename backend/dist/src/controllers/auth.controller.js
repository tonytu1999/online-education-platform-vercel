"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRole = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const register = async (req, res) => {
    try {
        console.log('Register request received', req.body);
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim() : undefined;
        const phone = typeof req.body.phone === 'string' && req.body.phone.trim() !== '' ? req.body.phone.trim() : undefined;
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!name || !email || !password) {
            console.warn('Register validation failed', { name, email, phone });
            res.status(400).json({ error: 'name, email, and password are required' });
            return;
        }
        const existingEmailUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingEmailUser) {
            console.warn('Register blocked: email already exists', { email });
            res.status(409).json({ error: 'Email already exists', field: 'email' });
            return;
        }
        if (phone) {
            const existingPhoneUser = await prisma_1.default.user.findUnique({ where: { phone } });
            if (existingPhoneUser) {
                console.warn('Register blocked: phone already exists', { phone });
                res.status(409).json({ error: 'Phone already exists', field: 'phone' });
                return;
            }
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword
            }
        });
        console.log('Register success', { userId: user.id, email, phone });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        const prismaError = error;
        console.error('Register error object:', error);
        console.error('Register error stack:', prismaError.stack || 'No stack available');
        if (prismaError.code === 'P2002') {
            res.status(409).json({ error: 'Email or phone already exists' });
            return;
        }
        res.status(500).json({
            error: 'Internal server error',
            code: prismaError.code,
            details: prismaError.message || 'Unknown error',
            stack: prismaError.stack || undefined,
            meta: prismaError.meta || undefined
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        console.log('Login request received', req.body);
        const { email, phone, password } = req.body;
        if (!email && !phone) {
            res.status(400).json({ error: 'Email or phone is required' });
            return;
        }
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(phone ? [{ phone }] : [])
                ]
            }
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        console.log('Login success', { userId: user.id, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        const authError = error;
        console.error('Login error object:', error);
        console.error('Login error stack:', authError.stack || 'No stack available');
        res.status(500).json({
            error: 'Internal server error',
            code: authError.code,
            details: authError.message || 'Unknown error',
            stack: authError.stack || undefined,
            meta: authError.meta || undefined
        });
    }
};
exports.login = login;
const VALID_ROLES = ['STUDENT', 'PARENT', 'TEACHER', 'SCHOOL_ADMIN'];
const selectRole = async (req, res) => {
    try {
        const userId = typeof req.body.userId === 'string' ? req.body.userId.trim() : '';
        const role = typeof req.body.role === 'string' ? req.body.role.trim() : '';
        if (!userId || !role) {
            res.status(400).json({ error: 'userId and role are required' });
            return;
        }
        if (!VALID_ROLES.includes(role)) {
            res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { role: role }
        });
        console.log('Role selected', { userId, role });
        res.json({ message: 'Role updated successfully', userId, role });
    }
    catch (error) {
        console.error('selectRole error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.selectRole = selectRole;
