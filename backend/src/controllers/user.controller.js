"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindChild = exports.getProfile = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
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
//# sourceMappingURL=user.controller.js.map