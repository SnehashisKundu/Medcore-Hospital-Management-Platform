import { Router } from "express";

import {
  getAuditLogByIdController,
  getAuditLogsController,
} from "./aud.controller";

import { authenticate } from "../auth/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getAuditLogsController
);

router.get(
  "/:id",
  authenticate,
  getAuditLogByIdController
);

export default router;