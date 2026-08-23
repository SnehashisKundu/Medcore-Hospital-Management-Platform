import { Router } from "express";

import {
  createAssignmentController,
  getAssignmentsController,
  getAssignmentByIdController,
  updateAssignmentController,
  deleteAssignmentController,
} from "./dda.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/doctor-department-assignments",
  authenticate,
  requirePermission(
    "DOCTOR_DEPARTMENT_ASSIGNMENT_CREATE"
  ),
  createAssignmentController
);

router.get(
  "/doctor-department-assignments",
  authenticate,
  requirePermission(
    "DOCTOR_DEPARTMENT_ASSIGNMENT_READ"
  ),
  getAssignmentsController
);

router.get(
  "/doctor-department-assignments/:id",
  authenticate,
  requirePermission(
    "DOCTOR_DEPARTMENT_ASSIGNMENT_READ"
  ),
  getAssignmentByIdController
);

router.put(
  "/doctor-department-assignments/:id",
  authenticate,
  requirePermission(
    "DOCTOR_DEPARTMENT_ASSIGNMENT_UPDATE"
  ),
  updateAssignmentController
);

router.delete(
  "/doctor-department-assignments/:id",
  authenticate,
  requirePermission(
    "DOCTOR_DEPARTMENT_ASSIGNMENT_DELETE"
  ),
  deleteAssignmentController
);

export default router;