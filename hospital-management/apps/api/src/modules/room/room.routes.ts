import { Router } from "express";

import {
  createRoomController,
  getRoomsController,
  getRoomByIdController,
  updateRoomController,
  deleteRoomController,
} from "./room.controller";

import { authenticate } from "../auth/auth.middleware";

import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("ROOM_CREATE"),
  createRoomController
);

router.get(
  "/",
  authenticate,
  requirePermission("ROOM_READ"),
  getRoomsController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("ROOM_READ"),
  getRoomByIdController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("ROOM_UPDATE"),
  updateRoomController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("ROOM_DELETE"),
  deleteRoomController
);

export default router;