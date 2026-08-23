import { Router } from "express";

import {
  createSpecializationController,
  getSpecializationsController,
  getSpecializationByIdController,
} from "./spc.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/specializations",
  authenticate,
  requirePermission("SPECIALIZATION_CREATE"),
  createSpecializationController
);

router.get(
  "/specializations",
  authenticate,
  requirePermission("SPECIALIZATION_READ"),
  getSpecializationsController
);

router.get(
  "/specializations/:id",
  authenticate,
  requirePermission("SPECIALIZATION_READ"),
  getSpecializationByIdController
);

export default router;