import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  assignPermissionToRoleController,
  getAllRolePermissionsController,
  getPermissionsByRoleIdController,
  removePermissionFromRoleController,
} from "./rp.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requirePermission("ROLE_MANAGE"),
  assignPermissionToRoleController
);

router.get(
  "/",
  requirePermission("ROLE_MANAGE"),
  getAllRolePermissionsController
);

router.get(
  "/role/:roleId",
  requirePermission("ROLE_MANAGE"),
  getPermissionsByRoleIdController
);

router.delete(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  removePermissionFromRoleController
);

export default router;