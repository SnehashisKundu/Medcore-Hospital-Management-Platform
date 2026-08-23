import { Router } from "express";

import {
  createEncounterController,
  getEncountersController,
  getEncounterByIdController,
  updateEncounterController,
  deleteEncounterController,
} from "./enc.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/encounters",
  authenticate,
  requirePermission("ENCOUNTER_CREATE"),
  createEncounterController
);

router.get(
  "/encounters",
  authenticate,
  requirePermission("ENCOUNTER_READ"),
  getEncountersController
);

router.get(
  "/encounters/:id",
  authenticate,
  requirePermission("ENCOUNTER_READ"),
  getEncounterByIdController
);

router.put(
  "/encounters/:id",
  authenticate,
  requirePermission("ENCOUNTER_UPDATE"),
  updateEncounterController
);

router.delete(
  "/encounters/:id",
  authenticate,
  requirePermission("ENCOUNTER_DELETE"),
  deleteEncounterController
);

export default router;