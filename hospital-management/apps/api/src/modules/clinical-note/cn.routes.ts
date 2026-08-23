import { Router } from "express";

import {
  createClinicalNoteController,
  getClinicalNotesController,
  getClinicalNoteByIdController,
  updateClinicalNoteController,
} from "./cn.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/clinical-notes",
  authenticate,
  requirePermission("CLINICAL_NOTE_CREATE"),
  createClinicalNoteController
);

router.get(
  "/clinical-notes",
  authenticate,
  requirePermission("CLINICAL_NOTE_READ"),
  getClinicalNotesController
);

router.get(
  "/clinical-notes/:id",
  authenticate,
  requirePermission("CLINICAL_NOTE_READ"),
  getClinicalNoteByIdController
);

router.put(
  "/clinical-notes/:id",
  authenticate,
  requirePermission("CLINICAL_NOTE_UPDATE"),
  updateClinicalNoteController
);

export default router;