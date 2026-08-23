import { Router } from "express";

import {
  createDiagnosticOrderController,
  getDiagnosticOrdersController,
  getDiagnosticOrderByIdController,
  updateDiagnosticOrderController,
  updateDiagnosticOrderItemController,
} from "./dgo.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/diagnostic-orders",
  authenticate,
  requirePermission("DIAGNOSTIC_ORDER_CREATE"),
  createDiagnosticOrderController
);

router.get(
  "/diagnostic-orders",
  authenticate,
  requirePermission("DIAGNOSTIC_ORDER_READ"),
  getDiagnosticOrdersController
);

router.get(
  "/diagnostic-orders/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_ORDER_READ"),
  getDiagnosticOrderByIdController
);

router.put(
  "/diagnostic-orders/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_ORDER_UPDATE"),
  updateDiagnosticOrderController
);

router.put(
  "/diagnostic-order-items/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_RESULT_UPDATE"),
  updateDiagnosticOrderItemController
);

export default router;