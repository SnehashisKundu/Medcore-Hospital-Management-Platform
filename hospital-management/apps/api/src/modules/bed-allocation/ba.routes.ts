import { Router } from "express";

import {
  allocateBedController,
  releaseBedController,
  getBedAllocationsController,
} from "./ba.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("BED_ALLOCATION_CREATE"),
  allocateBedController
);

router.get(
  "/",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

router.get(
  "/admission/:admissionId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

router.get(
  "/bed/:bedId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

router.get(
  "/admissionId=:admissionId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

router.get(
  "/bedId=:bedId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

router.put(
  "/:id/release",
  authenticate,
  requirePermission("BED_ALLOCATION_UPDATE"),
  releaseBedController
);

export default router;