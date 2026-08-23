import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";

import {
  assignUserRoleController,
  getAllUserRolesController,
  getUserRolesByUserIdController,
  removeUserRoleController,
} from "./ur.controller";

// Existing requirePermission middleware ka
// actual import yahan use karna
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requirePermission("USER_ROLE_ASSIGN"),
  assignUserRoleController
);

router.get(
  "/",
  requirePermission("USER_ROLE_READ"),
  getAllUserRolesController
);

router.get(
  "/user/:userId",
  requirePermission("USER_ROLE_READ"),
  getUserRolesByUserIdController
);

router.delete(
  "/:id",
  requirePermission("USER_ROLE_REMOVE"),
  removeUserRoleController
);

export default router;