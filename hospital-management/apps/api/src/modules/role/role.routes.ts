import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
} from "./role.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requirePermission("ROLE_MANAGE"),
  createRoleController
);

router.get(
  "/",
  requirePermission("ROLE_MANAGE"),
  getAllRolesController
);

router.get(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  getRoleByIdController
);

router.patch(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  updateRoleController
);

router.delete(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  deleteRoleController
);

export default router;