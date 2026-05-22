"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const progress_controller_1 = require("../controllers/progress.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/update', progress_controller_1.updateProgress);
router.get('/:studentId', progress_controller_1.getStudentProgress);
exports.default = router;
//# sourceMappingURL=progress.routes.js.map