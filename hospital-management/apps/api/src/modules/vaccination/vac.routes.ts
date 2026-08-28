import { Router } from "express";

import {
  createVaccinationController,
  getVaccinationsController,
  getVaccinationByIdController,
  updateVaccinationController,
  deleteVaccinationController,
} from "./vac.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/vaccinations",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createVaccinationController
);

router.get(
  "/vaccinations",
  authenticate,
  requirePermission("PATIENT_READ"),
  getVaccinationsController
);

router.get(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getVaccinationByIdController
);

router.put(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateVaccinationController
);

router.delete(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteVaccinationController
);

export default router;