import { Router } from "express";

import {
  createFamilyHistoryController,
  getFamilyHistoriesController,
  getFamilyHistoryByIdController,
  updateFamilyHistoryController,
  deleteFamilyHistoryController,
} from "./fh.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/family-history",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createFamilyHistoryController
);

router.get(
  "/family-history",
  authenticate,
  requirePermission("PATIENT_READ"),
  getFamilyHistoriesController
);

router.get(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getFamilyHistoryByIdController
);

router.put(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateFamilyHistoryController
);

router.delete(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteFamilyHistoryController
);

export default router;