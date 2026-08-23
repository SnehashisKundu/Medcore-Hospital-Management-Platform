import { Router } from "express";

import {
  createDoctorHospitalController,
  getDoctorHospitalsController,
  getDoctorHospitalByIdController,
  updateDoctorHospitalController,
  deleteDoctorHospitalController,
} from "./dh.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/doctor-hospitals",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_CREATE"),
  createDoctorHospitalController
);

router.get(
  "/doctor-hospitals",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_READ"),
  getDoctorHospitalsController
);

router.get(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_READ"),
  getDoctorHospitalByIdController
);

router.put(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_UPDATE"),
  updateDoctorHospitalController
);

router.delete(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_DELETE"),
  deleteDoctorHospitalController
);

export default router;