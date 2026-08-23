import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  createPermissionController,
  getPermissionsController,
  getPermissionByIdController,
  updatePermissionController,
  deletePermissionController,
} from "./per.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requirePermission("ROLE_MANAGE"),
  createPermissionController
);

router.get(
  "/",
  requirePermission("ROLE_MANAGE"),
  getPermissionsController
);

router.get(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  getPermissionByIdController
);

router.patch(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  updatePermissionController
);

router.delete(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  deletePermissionController
);

export default router;