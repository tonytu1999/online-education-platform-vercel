"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchools = exports.createSchool = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createSchool = async (req, res) => {
    try {
        const { name, code } = req.body;
        const school = await prisma_1.default.school.create({
            data: { name, code }
        });
        res.status(201).json(school);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create school' });
    }
};
exports.createSchool = createSchool;
const getSchools = async (req, res) => {
    try {
        const schools = await prisma_1.default.school.findMany({
            select: { id: true, name: true, code: true }
        });
        res.json(schools);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch schools' });
    }
};
exports.getSchools = getSchools;
