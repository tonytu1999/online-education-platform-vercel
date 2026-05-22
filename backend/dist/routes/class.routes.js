"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const class_controller_1 = require("../controllers/class.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Student routes
router.post('/join', (0, auth_1.authorizeRole)(['STUDENT']), class_controller_1.joinClass);
// Teacher routes
router.post('/', (0, auth_1.authorizeRole)(['TEACHER', 'SCHOOL_ADMIN']), class_controller_1.createClass);
router.get('/:classId/students', (0, auth_1.authorizeRole)(['TEACHER', 'SCHOOL_ADMIN']), class_controller_1.getStudents);
router.delete('/:classId/students/:studentId', (0, auth_1.authorizeRole)(['TEACHER', 'SCHOOL_ADMIN']), class_controller_1.removeStudent);
exports.default = router;
