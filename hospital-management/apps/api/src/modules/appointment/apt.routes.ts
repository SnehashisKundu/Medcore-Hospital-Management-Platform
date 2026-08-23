import { Router } from "express";

import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentController,
  deleteAppointmentController,
} from "./apt.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/appointments",
  authenticate,
  requirePermission("APPOINTMENT_CREATE"),
  createAppointmentController
);

router.get(
  "/appointments",
  authenticate,
  requirePermission("APPOINTMENT_READ"),
  getAppointmentsController
);

router.get(
  "/appointments/:id",
  authenticate,
  requirePermission("APPOINTMENT_READ"),
  getAppointmentByIdController
);

router.put(
  "/appointments/:id",
  authenticate,
  requirePermission("APPOINTMENT_UPDATE"),
  updateAppointmentController
);

router.delete(
  "/appointments/:id",
  authenticate,
  requirePermission("APPOINTMENT_DELETE"),
  deleteAppointmentController
);

export default router;