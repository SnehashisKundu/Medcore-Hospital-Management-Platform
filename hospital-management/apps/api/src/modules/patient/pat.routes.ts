import { Router } from "express";

import {
  createPatientController,
  getPatientsController,
  getPatientByIdController,
  updatePatientController,
  deletePatientController,
} from "./pat.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/patients",
  authenticate,
  requirePermission("PATIENT_CREATE"),
  createPatientController
);

router.get(
  "/patients",
  authenticate,
  requirePermission("PATIENT_READ"),
  getPatientsController
);

router.get(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getPatientByIdController
);

router.put(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updatePatientController
);

router.delete(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_DELETE"),
  deletePatientController
);

export default router;