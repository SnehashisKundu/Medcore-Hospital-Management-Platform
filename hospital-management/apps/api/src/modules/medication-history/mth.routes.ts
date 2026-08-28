import { Router } from "express";

import {
  createMedicationHistoryController,
  getMedicationHistoriesController,
  getMedicationHistoryByIdController,
  updateMedicationHistoryController,
  deleteMedicationHistoryController,
} from "./mth.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/medication-history",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createMedicationHistoryController
);

router.get(
  "/medication-history",
  authenticate,
  requirePermission("PATIENT_READ"),
  getMedicationHistoriesController
);

router.get(
  "/medication-history/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getMedicationHistoryByIdController
);

router.put(
  "/medication-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateMedicationHistoryController
);

router.delete(
  "/medication-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteMedicationHistoryController
);

export default router;