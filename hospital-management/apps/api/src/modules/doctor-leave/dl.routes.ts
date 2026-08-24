import { Router } from "express";

import {
  createDoctorLeaveController,
  getDoctorLeavesController,
  getDoctorLeaveByIdController,
  updateDoctorLeaveController,
} from "./dl.controller";

import {
  authenticate,
} from "../auth/auth.middleware";

import {
  requirePermission,
} from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("DOCTOR_LEAVE_CREATE"),
  createDoctorLeaveController
);

router.get(
  "/",
  authenticate,
  requirePermission("DOCTOR_LEAVE_READ"),
  getDoctorLeavesController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("DOCTOR_LEAVE_READ"),
  getDoctorLeaveByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("DOCTOR_LEAVE_UPDATE"),
  updateDoctorLeaveController
);

export default router;