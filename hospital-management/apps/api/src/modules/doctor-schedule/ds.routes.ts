import { Router } from "express";

import {
  createDoctorScheduleController,
  getDoctorSchedulesController,
  getDoctorScheduleByIdController,
  updateDoctorScheduleController,
  deleteDoctorScheduleController,
} from "./ds.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("DOCTOR_SCHEDULE_CREATE"),
  createDoctorScheduleController
);

router.get(
  "/",
  authenticate,
  requirePermission("DOCTOR_SCHEDULE_READ"),
  getDoctorSchedulesController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("DOCTOR_SCHEDULE_READ"),
  getDoctorScheduleByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("DOCTOR_SCHEDULE_UPDATE"),
  updateDoctorScheduleController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("DOCTOR_SCHEDULE_DELETE"),
  deleteDoctorScheduleController
);

export default router;