import { Router } from "express";

import {
  createVitalController,
  getVitalsController,
  getVitalByIdController,
  updateVitalController,
} from "./vit.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/vitals",
  authenticate,
  requirePermission("VITALS_CREATE"),
  createVitalController
);

router.get(
  "/vitals",
  authenticate,
  requirePermission("VITALS_READ"),
  getVitalsController
);

router.get(
  "/vitals/:id",
  authenticate,
  requirePermission("VITALS_READ"),
  getVitalByIdController
);

router.put(
  "/vitals/:id",
  authenticate,
  requirePermission("VITALS_UPDATE"),
  updateVitalController
);

export default router;