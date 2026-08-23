import { Router } from "express";

import {
  createDiagnosticTestController,
  getDiagnosticTestsController,
  getDiagnosticTestByIdController,
  updateDiagnosticTestController,
} from "./dgt.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/diagnostic-tests",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_CREATE"),
  createDiagnosticTestController
);

router.get(
  "/diagnostic-tests",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_READ"),
  getDiagnosticTestsController
);

router.get(
  "/diagnostic-tests/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_READ"),
  getDiagnosticTestByIdController
);

router.put(
  "/diagnostic-tests/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_UPDATE"),
  updateDiagnosticTestController
);

export default router;