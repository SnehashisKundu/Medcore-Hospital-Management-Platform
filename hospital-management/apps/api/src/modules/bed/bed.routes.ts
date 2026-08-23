import { Router } from "express";

import {
  createBedController,
  getBedsController,
  getBedAvailabilitySummaryController,
  getBedByIdController,
  updateBedController,
  deleteBedController,
} from "./bed.controller";

import { authenticate } from "../auth/auth.middleware";

import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("BED_CREATE"),
  createBedController
);

router.get(
  "/",
  authenticate,
  requirePermission("BED_READ"),
  getBedsController
);

router.get(
  "/availability-summary",
  authenticate,
  requirePermission("BED_READ"),
  getBedAvailabilitySummaryController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("BED_READ"),
  getBedByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("BED_UPDATE"),
  updateBedController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("BED_DELETE"),
  deleteBedController
);

export default router;