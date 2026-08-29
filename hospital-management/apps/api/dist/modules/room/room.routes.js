"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("./room.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
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
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ROOM_CREATE"), room_controller_1.createRoomController);
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
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ROOM_READ"), room_controller_1.getRoomsController);
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
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ROOM_READ"), room_controller_1.getRoomByIdController);
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
router.put("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ROOM_UPDATE"), room_controller_1.updateRoomController);
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
router.delete("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ROOM_DELETE"), room_controller_1.deleteRoomController);
exports.default = router;
