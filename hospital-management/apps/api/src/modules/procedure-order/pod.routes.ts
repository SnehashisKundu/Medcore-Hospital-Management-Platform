import { Router } from "express";

import {
  createProcedureOrderController,
  getProcedureOrdersController,
  getProcedureOrderByIdController,
  updateProcedureOrderController,
} from "./pod.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/procedure-orders",
  authenticate,
  requirePermission("PROCEDURE_ORDER_CREATE"),
  createProcedureOrderController
);

router.get(
  "/procedure-orders",
  authenticate,
  requirePermission("PROCEDURE_ORDER_READ"),
  getProcedureOrdersController
);

router.get(
  "/procedure-orders/:id",
  authenticate,
  requirePermission("PROCEDURE_ORDER_READ"),
  getProcedureOrderByIdController
);

router.put(
  "/procedure-orders/:id",
  authenticate,
  requirePermission("PROCEDURE_ORDER_UPDATE"),
  updateProcedureOrderController
);

export default router;