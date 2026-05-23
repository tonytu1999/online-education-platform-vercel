"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const school_routes_1 = __importDefault(require("./routes/school.routes"));
const prisma_1 = __importDefault(require("./config/prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    const startedAt = Date.now();
    const requestBody = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined;
    console.log(`[${new Date().toISOString()}] -> ${req.method} ${req.originalUrl}`);
    if (requestBody !== undefined) {
        console.log('Body:', requestBody);
    }
    res.on('finish', () => {
        const durationMs = Date.now() - startedAt;
        console.log(`[${new Date().toISOString()}] <- ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`);
    });
    next();
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/classes', class_routes_1.default);
app.use('/api/schools', school_routes_1.default);
app.get('/users/uuid-by-email', async (req, res) => {
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
});
app.get('/api/users/uuid-by-email', async (req, res) => {
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
});
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
});
app.get('/api', (req, res) => {
    res.json({ message: 'API is running' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
app.use((req, res) => {
    res.status(404).json({
        message: 'Fallback API response',
        method: req.method,
        path: req.originalUrl
    });
});
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
