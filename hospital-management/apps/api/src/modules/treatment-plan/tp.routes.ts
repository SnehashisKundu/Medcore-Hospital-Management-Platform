import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";

import {
  createTreatmentPlanController,
  getTreatmentPlansController,
  getTreatmentPlanByIdController,
  updateTreatmentPlanController,
  deleteTreatmentPlanController,
} from "./tp.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  createTreatmentPlanController
);

router.get(
  "/encounter/:encounterId",
  authenticate,
  getTreatmentPlansController
);

router.get(
  "/:id",
  authenticate,
  getTreatmentPlanByIdController
);

router.put(
  "/:id",
  authenticate,
  updateTreatmentPlanController
);

router.delete(
  "/:id",
  authenticate,
  deleteTreatmentPlanController
);

export default router;