"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentProgress = exports.updateProgress = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const updateProgress = async (req, res) => {
    try {
        const { studentId, knowledgePointId, mastery, studyTimeSeconds } = req.body;
        const progress = await prisma_1.default.progress.upsert({
            where: {
                studentId_knowledgePointId: {
                    studentId,
                    knowledgePointId
                }
            },
            create: {
                studentId,
                knowledgePointId,
                mastery,
                studyTimeSeconds
            },
            update: {
                mastery,
                studyTimeSeconds: {
                    increment: studyTimeSeconds || 0
                }
            }
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
exports.updateProgress = updateProgress;
const getStudentProgress = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const progress = await prisma_1.default.progress.findMany({
            where: { studentId },
            include: {
                knowledgePoint: {
                    include: {
                        chapter: {
                            include: { subject: true }
                        }
                    }
                }
            }
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};
exports.getStudentProgress = getStudentProgress;
