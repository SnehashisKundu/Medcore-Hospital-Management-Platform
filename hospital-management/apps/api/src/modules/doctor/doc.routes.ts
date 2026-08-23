import { Router } from "express";
import {
  createDoctorController,
  getDoctorsController,
  getDoctorByIdController,
  updateDoctorController,
  deleteDoctorController,
} from "./doc.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/doctors",
  authenticate,
  requirePermission("DOCTOR_CREATE"),
  createDoctorController
);

router.get(
  "/doctors",
  authenticate,
  requirePermission("DOCTOR_READ"),
  getDoctorsController
);

router.get(
  "/doctors/:id",
  authenticate,
  requirePermission("DOCTOR_READ"),
  getDoctorByIdController
);

router.post(
  "/doctors",
  authenticate,
  requirePermission("DOCTOR_CREATE"),
  createDoctorController
);

router.get(
  "/doctors",
  authenticate,
  requirePermission("DOCTOR_READ"),
  getDoctorsController
);

router.get(
  "/doctors/:id",
  authenticate,
  requirePermission("DOCTOR_READ"),
  getDoctorByIdController
);

router.put(
  "/doctors/:id",
  authenticate,
  requirePermission("DOCTOR_UPDATE"),
  updateDoctorController
);

router.delete(
  "/doctors/:id",
  authenticate,
  requirePermission("DOCTOR_DELETE"),
  deleteDoctorController
);

export default router;