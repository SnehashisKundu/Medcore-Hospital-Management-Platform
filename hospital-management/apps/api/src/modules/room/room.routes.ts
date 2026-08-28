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

/**
 * @swagger
 * /api/v1/rooms:
 *   post:
 *     tags:
 *       - Rooms
 *     summary: Create a room
 *     description: Creates a new room within a ward.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wardId
 *               - roomNumber
 *             properties:
 *               wardId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Private Room 101"
 *               dailyCharge:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Ward ID or room number is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Ward not found
 *       409:
 *         description: Room number already exists in this ward
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("ROOM_CREATE"),
  createRoomController
);

/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get all rooms
 *     description: Retrieves all rooms. Optionally filters rooms by ward ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wardId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter rooms by ward ID
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticate,
  requirePermission("ROOM_READ"),
  getRoomsController
);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get room by ID
 *     description: Retrieves a specific room by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("ROOM_READ"),
  getRoomByIdController
);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   put:
 *     tags:
 *       - Rooms
 *     summary: Update a room
 *     description: Updates an existing room.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               wardId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Private Room 101"
 *               dailyCharge:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 2500
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Room not found
 *       409:
 *         description: Room number already exists in this ward
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  requirePermission("ROOM_UPDATE"),
  updateRoomController
);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Delete a room
 *     description: Deletes a room.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("ROOM_DELETE"),
  deleteRoomController
);

export default router;