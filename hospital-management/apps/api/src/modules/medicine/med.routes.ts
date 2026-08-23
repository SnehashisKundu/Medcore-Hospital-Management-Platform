import { Router } from "express";

import {
  createMedicineController,
  getMedicinesController,
  getMedicineByIdController,
  updateMedicineController,
} from "./med.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/medicines",
  authenticate,
  requirePermission("MEDICINE_CREATE"),
  createMedicineController
);

router.get(
  "/medicines",
  authenticate,
  requirePermission("MEDICINE_READ"),
  getMedicinesController
);

router.get(
  "/medicines/:id",
  authenticate,
  requirePermission("MEDICINE_READ"),
  getMedicineByIdController
);

router.put(
  "/medicines/:id",
  authenticate,
  requirePermission("MEDICINE_UPDATE"),
  updateMedicineController
);

export default router;