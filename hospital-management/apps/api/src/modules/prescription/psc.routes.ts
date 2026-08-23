import { Router } from "express";

import {
  createPrescriptionController,
  getPrescriptionsController,
  getPrescriptionByIdController,
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