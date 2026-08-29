"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aud_controller_1 = require("./aud.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authenticate, aud_controller_1.getAuditLogsController);
router.get("/:id", auth_middleware_1.authenticate, aud_controller_1.getAuditLogByIdController);
exports.default = router;
