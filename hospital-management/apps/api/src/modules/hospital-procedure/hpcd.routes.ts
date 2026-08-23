import { Router } from "express";

import {
  createHospitalProcedureController,
  getHospitalProceduresController,
  getHospitalProcedureByIdController,
  updateHospitalProcedureController,
  deleteHospitalProcedureController,
} from "./hpcd.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_CREATE"),
  createHospitalProcedureController
);

router.get(
  "/",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_READ"),
  getHospitalProceduresController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_READ"),
  getHospitalProcedureByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_UPDATE"),
  updateHospitalProcedureController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_DELETE"),
  deleteHospitalProcedureController
);

export default router;