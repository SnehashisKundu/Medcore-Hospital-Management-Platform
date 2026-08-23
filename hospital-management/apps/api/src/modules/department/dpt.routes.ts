import { Router } from "express";

import {
  createDepartmentController,
  getDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
  deleteDepartmentController,
} from "./dpt.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/hospitals/:hospitalId/departments",
  authenticate,
  requirePermission("DEPARTMENT_CREATE"),
  createDepartmentController
);

router.get(
  "/hospitals/:hospitalId/departments",
  authenticate,
  requirePermission("DEPARTMENT_READ"),
  getDepartmentsController
);

router.get(
  "/hospitals/:hospitalId/departments/:departmentId",
  authenticate,
  requirePermission("DEPARTMENT_READ"),
  getDepartmentByIdController
);

router.patch(
  "/hospitals/:hospitalId/departments/:departmentId",
  authenticate,
  requirePermission("DEPARTMENT_UPDATE"),
  updateDepartmentController
);

router.delete(
  "/hospitals/:hospitalId/departments/:departmentId",
  authenticate,
  requirePermission("DEPARTMENT_DELETE"),
  deleteDepartmentController
);

export default router;