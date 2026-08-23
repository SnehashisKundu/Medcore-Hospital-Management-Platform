import { Router } from "express";

import {
  createDiagnosisController,
  getDiagnosesController,
  getDiagnosisByIdController,
  updateDiagnosisController,
} from "./dia.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/diagnoses",
  authenticate,
  requirePermission("DIAGNOSIS_CREATE"),
  createDiagnosisController
);

router.get(
  "/diagnoses",
  authenticate,
  requirePermission("DIAGNOSIS_READ"),
  getDiagnosesController
);

router.get(
  "/diagnoses/:id",
  authenticate,
  requirePermission("DIAGNOSIS_READ"),
  getDiagnosisByIdController
);

router.put(
  "/diagnoses/:id",
  authenticate,
  requirePermission("DIAGNOSIS_UPDATE"),
  updateDiagnosisController
);

export default router;