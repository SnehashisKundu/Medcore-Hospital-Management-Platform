import { Router } from "express";

import {
  createMedicineDispenseController,
  getMedicineDispensesController,
  getMedicineDispenseByIdController,
} from "./pmd.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/medicine-dispenses",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  createMedicineDispenseController
);

router.get(
  "/medicine-dispenses",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  getMedicineDispensesController
);

router.get(
  "/medicine-dispenses/:id",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  getMedicineDispenseByIdController
);

export default router;