import { Router } from "express";

import {
  createImagingReportController,
  getImagingReportsController,
  getImagingReportByIdController,
  updateImagingReportController,
} from "./imr.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/imaging-reports",
  authenticate,
  requirePermission("IMAGING_RESULT_UPDATE"),
  createImagingReportController
);

router.get(
  "/imaging-reports",
  authenticate,
  requirePermission("IMAGING_RESULT_READ"),
  getImagingReportsController
);

router.get(
  "/imaging-reports/:id",
  authenticate,
  requirePermission("IMAGING_RESULT_READ"),
  getImagingReportByIdController
);

router.put(
  "/imaging-reports/:id",
  authenticate,
  requirePermission("IMAGING_RESULT_UPDATE"),
  updateImagingReportController
);

export default router;