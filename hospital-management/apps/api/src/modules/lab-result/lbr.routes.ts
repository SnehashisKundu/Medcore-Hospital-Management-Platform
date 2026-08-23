import { Router } from "express";

import {
  createLabResultController,
  getLabResultsController,
  getLabResultByIdController,
  updateLabResultController,
} from "./lbr.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/lab-results",
  authenticate,
  requirePermission("LAB_RESULT_CREATE"),
  createLabResultController
);

router.get(
  "/lab-results",
  authenticate,
  requirePermission("LAB_RESULT_READ"),
  getLabResultsController
);

router.get(
  "/lab-results/:id",
  authenticate,
  requirePermission("LAB_RESULT_READ"),
  getLabResultByIdController
);

router.put(
  "/lab-results/:id",
  authenticate,
  requirePermission("LAB_RESULT_UPDATE"),
  updateLabResultController
);

export default router;