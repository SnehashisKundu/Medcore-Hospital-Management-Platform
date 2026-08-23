import { Router } from "express";

import {
  createProcedureStaffAssignmentController,
  getProcedureStaffAssignmentsController,
  getProcedureStaffAssignmentByIdController,
  updateProcedureStaffAssignmentController,
  deleteProcedureStaffAssignmentController,
} from "./psa.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/procedure-staff-assignments",
  authenticate,
  requirePermission(
    "PROCEDURE_STAFF_ASSIGNMENT_CREATE"
  ),
  createProcedureStaffAssignmentController
);

router.get(
  "/procedure-staff-assignments",
  authenticate,
  requirePermission(
    "PROCEDURE_STAFF_ASSIGNMENT_READ"
  ),
  getProcedureStaffAssignmentsController
);

router.get(
  "/procedure-staff-assignments/:id",
  authenticate,
  requirePermission(
    "PROCEDURE_STAFF_ASSIGNMENT_READ"
  ),
  getProcedureStaffAssignmentByIdController
);

router.put(
  "/procedure-staff-assignments/:id",
  authenticate,
  requirePermission(
    "PROCEDURE_STAFF_ASSIGNMENT_UPDATE"
  ),
  updateProcedureStaffAssignmentController
);

router.delete(
  "/procedure-staff-assignments/:id",
  authenticate,
  requirePermission(
    "PROCEDURE_STAFF_ASSIGNMENT_DELETE"
  ),
  deleteProcedureStaffAssignmentController
);

export default router;