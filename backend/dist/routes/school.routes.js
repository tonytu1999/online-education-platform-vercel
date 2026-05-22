"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const school_controller_1 = require("../controllers/school.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Everyone can view schools
router.get('/', school_controller_1.getSchools);
// Only admins can create schools
router.post('/', (0, auth_1.authorizeRole)(['SCHOOL_ADMIN']), school_controller_1.createSchool);
exports.default = router;
