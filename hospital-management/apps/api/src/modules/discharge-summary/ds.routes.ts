import { Router } from "express";

import {
  createDischargeSummaryController,
  getDischargeSummariesController,
  getDischargeSummaryByIdController,
} from "./ds.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("DISCHARGE_SUMMARY_CREATE"),
  createDischargeSummaryController
);

router.get(
  "/",
  authenticate,
  requirePermission("DISCHARGE_SUMMARY_READ"),
  getDischargeSummariesController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("DISCHARGE_SUMMARY_READ"),
  getDischargeSummaryByIdController
);

export default router;