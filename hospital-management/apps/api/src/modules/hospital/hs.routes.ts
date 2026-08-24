import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  createHospitalController,
  getHospitalsController,
  getNearbyHospitalsController,
  getHospitalByIdController,
  updateHospitalController,
  verifyHospitalController,
  deleteHospitalController,
} from "./hs.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("HOSPITAL_CREATE"),
  createHospitalController
);

router.get(
  "/",
  authenticate,
  requirePermission("HOSPITAL_READ"),
  getHospitalsController
);

router.get(
  "/nearby",
  authenticate,
  requirePermission("HOSPITAL_READ"),
  getNearbyHospitalsController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_READ"),
  getHospitalByIdController
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_UPDATE"),
  updateHospitalController
);

router.patch(
  "/:id/verify",
  authenticate,
  requirePermission("HOSPITAL_UPDATE"),
  verifyHospitalController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_DELETE"),
  deleteHospitalController
);

export default router;