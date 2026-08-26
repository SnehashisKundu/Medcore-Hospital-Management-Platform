import { Router } from "express";

import {
  createPrescriptionController,
  getPrescriptionsController,
  getPrescriptionByIdController,
  downloadPrescriptionPdfController,
  updatePrescriptionController,
} from "./psc.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/prescriptions",
  authenticate,
  requirePermission("PRESCRIPTION_CREATE"),
  createPrescriptionController
);

router.get(
  "/prescriptions",
  authenticate,
  requirePermission("PRESCRIPTION_READ"),
  getPrescriptionsController
);

/*
 * IMPORTANT:
 * Keep /:id/pdf BEFORE /:id
 * Otherwise Express can treat "pdf" as the :id parameter
 */
router.get(
  "/prescriptions/:id/pdf",
  authenticate,
  requirePermission("PRESCRIPTION_READ"),
  downloadPrescriptionPdfController
);

router.get(
  "/prescriptions/:id",
  authenticate,
  requirePermission("PRESCRIPTION_READ"),
  getPrescriptionByIdController
);

router.put(
  "/prescriptions/:id",
  authenticate,
  requirePermission("PRESCRIPTION_UPDATE"),
  updatePrescriptionController
);

export default router;