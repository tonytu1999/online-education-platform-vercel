"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Test endpoint with auth
router.get('/test', (req, res) => {
    res.json({ message: 'AI routes are working!', userId: req.user?.id });
});
// Session management
router.post('/sessions', ai_controller_1.createChatSession);
router.get('/sessions', ai_controller_1.getStudentSessions);
router.get('/sessions/:sessionId', ai_controller_1.getSessionDetails);
router.delete('/sessions/:sessionId', ai_controller_1.deleteChatSession);
// Chat within a session
router.post('/chat', ai_controller_1.chat);
// Mental health check (single message)
router.post('/mental-health', ai_controller_1.checkMentalHealth);
// Whole-session mental health analysis
router.post('/sessions/:sessionId/mental-health', ai_controller_1.checkSessionMentalHealth);
exports.default = router;
