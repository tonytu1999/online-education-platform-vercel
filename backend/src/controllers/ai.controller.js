"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMentalHealth = exports.chat = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_service_1 = require("../services/ai.service");
const prisma_1 = __importDefault(require("../config/prisma"));
const chat = async (req, res) => {
    try {
        const { studentId, message, context } = req.body;
        // Save user message
        await prisma_1.default.chatHistory.create({
            data: {
                studentId,
                message,
                sender: 'USER'
            }
        });
        const aiResponse = await (0, ai_service_1.generateSocraticResponse)(message, context);
        // Save AI response
        await prisma_1.default.chatHistory.create({
            data: {
                studentId,
                message: aiResponse,
                sender: 'AI',
                modelUsed: 'mock-model' // can be expanded to dynamic selection
            }
        });
        res.json({ response: aiResponse });
    }
    catch (error) {
        res.status(500).json({ error: 'AI processing failed' });
    }
};
exports.chat = chat;
const checkMentalHealth = async (req, res) => {
    res.json({ emotionPolarity: 'NEUTRAL', riskLevel: 'LOW', keywords: 'none' });
};
exports.checkMentalHealth = checkMentalHealth;
//# sourceMappingURL=ai.controller.js.map