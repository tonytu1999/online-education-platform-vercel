"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const school_routes_1 = __importDefault(require("./routes/school.routes"));
const prisma_1 = __importDefault(require("./config/prisma"));
const auth_1 = require("./middleware/auth");
const aiController = __importStar(require("./controllers/ai.controller"));
const ai_service_1 = require("./services/ai.service");
const filter_service_1 = require("./services/filter.service");
// Create a new chat session (wrapper)
const createChatSession = async (req, res) => {
    try {
        const { title, subject, topic } = req.body;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const session = await prisma_1.default.chatSession.create({
            data: {
                studentId,
                title: title || "New Chat Session",
                subject,
                topic,
            },
        });
        res.status(201).json({ session });
    }
    catch (error) {
        console.error("Create session failed:", error);
        res.status(500).json({ error: "Failed to create chat session" });
    }
};
// Get all sessions for a student (wrapper)
const getStudentSessions = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const sessions = await prisma_1.default.chatSession.findMany({
            where: { studentId },
            include: {
                chatHistories: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { lastAccessedAt: "desc" },
        });
        res.json({ sessions });
    }
    catch (error) {
        console.error("Get sessions failed:", error);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
};
// Get session details (wrapper)
const getSessionDetails = async (req, res) => {
    try {
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const session = await prisma_1.default.chatSession.findUnique({
            where: { sessionId },
            include: { chatHistories: { orderBy: { createdAt: "asc" } } },
        });
        if (!session || session.studentId !== studentId) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        res.json({ session });
    }
    catch (error) {
        console.error("Get session details failed:", error);
        res.status(500).json({ error: "Failed to fetch session details" });
    }
};
// Delete a chat session (wrapper)
const deleteChatSession = async (req, res) => {
    try {
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const session = await prisma_1.default.chatSession.findUnique({
            where: { sessionId },
        });
        if (!session || session.studentId !== studentId) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        // Delete the session using the correct field
        await prisma_1.default.chatSession.delete({
            where: { sessionId },
        });
        res.json({ message: "Session deleted successfully" });
    }
    catch (error) {
        console.error("Delete session failed:", error);
        res.status(500).json({ error: "Failed to delete session" });
    }
};
// Chat wrapper - inline logic
const chatWrapper = async (req, res) => {
    console.log("[WRAPPER] START");
    try {
        console.log("[WRAPPER] Inlining chat logic");
        const { sessionId, message } = req.body;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        if (!sessionId || !message) {
            res.status(400).json({ error: "sessionId and message are required" });
            return;
        }
        console.log("[WRAPPER] Checking session");
        // Verify session belongs to student
        const session = await prisma_1.default.chatSession.findUnique({
            where: { sessionId },
        });
        if (!session || session.studentId !== studentId) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        console.log("[WRAPPER] Checking forbidden");
        // 1. Prohibited Topic Filter
        const isForbidden = await (0, filter_service_1.isMessageForbidden)(message);
        if (isForbidden) {
            res.status(403).json({ error: "Message contains prohibited content" });
            return;
        }
        console.log("[WRAPPER] Saving user message");
        // Save user message (use session.id as foreign key)
        await prisma_1.default.chatHistory.create({
            data: {
                sessionId: session.id,
                studentId,
                message,
                sender: "USER",
            },
        });
        console.log("[WRAPPER] Generating response");
        // 2. Generate Socratic Response
        const { response: aiResponse, model } = await (0, ai_service_1.generateSocraticResponse)(message, sessionId);
        console.log("[WRAPPER] Generated response, length:", aiResponse.length);
        // Save AI response (use session.id as foreign key)
        await prisma_1.default.chatHistory.create({
            data: {
                sessionId: session.id,
                studentId,
                message: aiResponse,
                sender: "AI",
                modelUsed: model,
            },
        });
        // Update session last accessed time
        await prisma_1.default.chatSession.update({
            where: { sessionId },
            data: { lastAccessedAt: new Date() },
        });
        console.log("[WRAPPER] Sending response");
        res.json({
            response: aiResponse,
            modelUsed: model,
            sessionId,
        });
    }
    catch (error) {
        console.log("[WRAPPER] ERROR CAUGHT:", error?.message || JSON.stringify(error));
        if (!res.headersSent) {
            res.status(500).json({ error: error?.message || "Chat failed" });
        }
    }
};
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    const startedAt = Date.now();
    const requestBody = ["POST", "PUT", "PATCH"].includes(req.method)
        ? req.body
        : undefined;
    console.log(`[${new Date().toISOString()}] -> ${req.method} ${req.originalUrl}`);
    if (requestBody !== undefined) {
        console.log("Body:", requestBody);
    }
    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        console.log(`[${new Date().toISOString()}] <- ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`);
    });
    next();
});
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/users", user_routes_1.default);
app.use("/api/progress", progress_routes_1.default);
// Logging middleware for chat endpoint
const logChatEndpoint = (req, res, next) => {
    console.log("[LOG-CHAT-ENDPOINT] Called");
    next();
};
// AI endpoints (direct registration with wrapper functions)
app.post("/api/ai/sessions", auth_1.authenticate, createChatSession);
app.get("/api/ai/sessions", auth_1.authenticate, getStudentSessions);
app.get("/api/ai/sessions/:sessionId", auth_1.authenticate, getSessionDetails);
app.delete("/api/ai/sessions/:sessionId", auth_1.authenticate, deleteChatSession);
app.post("/api/ai/chat", logChatEndpoint, auth_1.authenticate, chatWrapper);
app.post("/api/ai/mental-health", auth_1.authenticate, aiController.checkMentalHealth);
// Direct test route
app.get("/api/ai-direct-test", auth_1.authenticate, (req, res) => {
    res.json({ message: "Direct AI test route works!", userId: req.user?.id });
});
// Debug OpenRouter API test
app.post("/api/debug-openrouter", async (req, res) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL || "https://api.openrouter.ai/api/v1";
    console.log("[DEBUG] Testing OpenRouter API...");
    console.log("[DEBUG] API Key exists:", !!apiKey);
    console.log("[DEBUG] Base URL:", baseUrl);
    if (!apiKey) {
        return res.status(400).json({ error: "OPENROUTER_API_KEY not configured" });
    }
    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Online Education Platform",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Hello, how are you?" },
                ],
                temperature: 0.7,
                max_tokens: 100,
            }),
        });
        console.log("[DEBUG] Response status:", response.status, response.statusText);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("[DEBUG] API Error:", errorText);
            return res
                .status(response.status)
                .json({ error: errorText, status: response.status });
        }
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "No response";
        console.log("[DEBUG] Success! Response:", aiResponse.substring(0, 100));
        return res.json({ success: true, response: aiResponse });
    }
    catch (error) {
        console.error("[DEBUG] Error:", error);
        return res
            .status(500)
            .json({ error: error instanceof Error ? error.message : String(error) });
    }
});
app.use("/api/classes", class_routes_1.default);
app.use("/api/schools", school_routes_1.default);
app.get("/users/uuid-by-email", async (req, res) => {
    const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
    if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
    }
    const student = await prisma_1.default.user.findFirst({
        where: { email, role: "STUDENT" },
        select: { id: true },
    });
    if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
    }
    res.json({ id: student.id });
});
app.get("/api/users/uuid-by-email", async (req, res) => {
    const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
    if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
    }
    const student = await prisma_1.default.user.findFirst({
        where: { email, role: "STUDENT" },
        select: { id: true },
    });
    if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
    }
    res.json({ id: student.id });
});
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
});
app.get("/api", (req, res) => {
    res.json({ message: "API is running" });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});
app.use((req, res) => {
    res.status(404).json({
        message: "Fallback API response",
        method: req.method,
        path: req.originalUrl,
    });
});
const server = app.listen(port, () => {
    console.log("Server is running on port " + port);
});
exports.default = app;
