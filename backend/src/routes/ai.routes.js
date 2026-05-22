"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/chat', ai_controller_1.chat);
router.post('/mental-health', ai_controller_1.checkMentalHealth);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map