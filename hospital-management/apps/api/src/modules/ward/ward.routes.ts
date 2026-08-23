import { Router } from "express";

import {
  createWardController,
  getWardsController,
  getWardByIdController,
  updateWardController,
  deleteWardController,
} from "./ward.controller";

import { authenticate } from "../auth/auth.middleware";

import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("WARD_CREATE"),
  createWardController
);

router.get(
  "/",
  authenticate,
  requirePermission("WARD_READ"),
  getWardsController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("WARD_READ"),
  getWardByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("WARD_UPDATE"),
  updateWardController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("WARD_DELETE"),
  deleteWardController
);

export default router;