import { Router } from "express";

import {
  createProcedureController,
  getProceduresController,
  getProcedureByIdController,
  updateProcedureController,
  deleteProcedureController,
} from "./pcd.controller";

import { authenticate } from "../auth/auth.middleware";

import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("PROCEDURE_CREATE"),
  createProcedureController
);

router.get(
  "/",
  authenticate,
  requirePermission("PROCEDURE_READ"),
  getProceduresController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_READ"),
  getProcedureByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_UPDATE"),
  updateProcedureController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_DELETE"),
  deleteProcedureController
);

export default router;