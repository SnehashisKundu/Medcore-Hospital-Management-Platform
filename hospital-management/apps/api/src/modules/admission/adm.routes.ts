import { Router } from "express";

import {
  createAdmissionController,
  getAdmissionsController,
  getAdmissionByIdController,
  updateAdmissionController,
  deleteAdmissionController,
} from "./adm.controller";

import { authenticate } from "../auth/auth.middleware";

import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("ADMISSION_CREATE"),
  createAdmissionController
);

router.get(
  "/",
  authenticate,
  requirePermission("ADMISSION_READ"),
  getAdmissionsController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("ADMISSION_READ"),
  getAdmissionByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("ADMISSION_UPDATE"),
  updateAdmissionController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("ADMISSION_DELETE"),
  deleteAdmissionController
);

export default router;