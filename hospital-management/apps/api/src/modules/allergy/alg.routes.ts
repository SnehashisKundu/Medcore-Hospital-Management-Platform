import { Router } from "express";

import {
  createAllergyController,
  getAllergiesController,
  getAllergyByIdController,
  updateAllergyController,
  deleteAllergyController,
} from "./alg.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/allergies",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createAllergyController
);

router.get(
  "/allergies",
  authenticate,
  requirePermission("PATIENT_READ"),
  getAllergiesController
);

router.get(
  "/allergies/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getAllergyByIdController
);

router.put(
  "/allergies/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateAllergyController
);

router.delete(
  "/allergies/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteAllergyController
);

export default router;