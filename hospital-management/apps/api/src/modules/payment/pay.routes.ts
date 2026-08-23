import { Router } from "express";

import {
  createPaymentController,
  getPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
} from "./pay.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/payments",
  authenticate,
  requirePermission("PAYMENT_CREATE"),
  createPaymentController
);

router.get(
  "/payments",
  authenticate,
  requirePermission("BILLING_READ"),
  getPaymentsController
);

router.get(
  "/payments/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getPaymentByIdController
);

router.put(
  "/payments/:id",
  authenticate,
  requirePermission("PAYMENT_CREATE"),
  updatePaymentController
);

export default router;