import { Router } from "express";

import {
  createMedicineStockController,
  getMedicineStocksController,
  getMedicineStockByIdController,
  updateMedicineStockController,
} from "./mds.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/medicine-stocks",
  authenticate,
  requirePermission("MEDICINE_STOCK_CREATE"),
  createMedicineStockController
);

router.get(
  "/medicine-stocks",
  authenticate,
  requirePermission("MEDICINE_STOCK_READ"),
  getMedicineStocksController
);

router.get(
  "/medicine-stocks/:id",
  authenticate,
  requirePermission("MEDICINE_STOCK_READ"),
  getMedicineStockByIdController
);

router.put(
  "/medicine-stocks/:id",
  authenticate,
  requirePermission("MEDICINE_STOCK_UPDATE"),
  updateMedicineStockController
);

export default router;