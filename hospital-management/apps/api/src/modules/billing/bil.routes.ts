import { Router } from "express";

import {
  createChargeController,
  getChargesController,
  getChargeByIdController,
  createInvoiceController,
  getInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
} from "./bil.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/charges",
  authenticate,
  requirePermission("BILLING_CREATE"),
  createChargeController
);

router.get(
  "/charges",
  authenticate,
  requirePermission("BILLING_READ"),
  getChargesController
);

router.get(
  "/charges/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getChargeByIdController
);

router.post(
  "/invoices",
  authenticate,
  requirePermission("BILLING_CREATE"),
  createInvoiceController
);

router.get(
  "/invoices",
  authenticate,
  requirePermission("BILLING_READ"),
  getInvoicesController
);

router.get(
  "/invoices/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getInvoiceByIdController
);

router.put(
  "/invoices/:id",
  authenticate,
  requirePermission("BILLING_UPDATE"),
  updateInvoiceController
);

export default router;