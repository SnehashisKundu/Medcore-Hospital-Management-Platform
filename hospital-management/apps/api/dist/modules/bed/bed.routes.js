"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bed_controller_1 = require("./bed.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/beds:
 *   post:
 *     tags:
 *       - Beds
 *     summary: Create a bed
 *     description: Creates a new bed within a room.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - bedNumber
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               bedNumber:
 *                 type: string
 *                 example: "B-101"
 *               status:
 *                 type: string
 *                 example: AVAILABLE
 *               dailyCharge:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Bed created successfully
 *       400:
 *         description: Room ID or bed number is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Room not found
 *       409:
 *         description: Bed number already exists in this room
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_CREATE"), bed_controller_1.createBedController);
/**
 * @swagger
 * /api/v1/beds:
 *   get:
 *     tags:
 *       - Beds
 *     summary: Get all beds
 *     description: Retrieves all beds with optional room and status filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter beds by room ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter beds by status
 *     responses:
 *       200:
 *         description: Beds retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_READ"), bed_controller_1.getBedsController);
/**
 * @swagger
 * /api/v1/beds/availability-summary:
 *   get:
 *     tags:
 *       - Beds
 *     summary: Get bed availability summary
 *     description: Retrieves a summary of bed availability, optionally filtered by hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter availability summary by hospital ID
 *     responses:
 *       200:
 *         description: Bed availability summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/availability-summary", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_READ"), bed_controller_1.getBedAvailabilitySummaryController);
/**
 * @swagger
 * /api/v1/beds/{id}:
 *   get:
 *     tags:
 *       - Beds
 *     summary: Get bed by ID
 *     description: Retrieves a specific bed by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed ID
 *     responses:
 *       200:
 *         description: Bed retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Bed not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_READ"), bed_controller_1.getBedByIdController);
/**
 * @swagger
 * /api/v1/beds/{id}:
 *   put:
 *     tags:
 *       - Beds
 *     summary: Update a bed
 *     description: Updates an existing bed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               bedNumber:
 *                 type: string
 *                 example: "B-101"
 *               status:
 *                 type: string
 *                 example: AVAILABLE
 *               dailyCharge:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 1500
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Bed updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Bed not found
 *       409:
 *         description: Bed number already exists in this room
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_UPDATE"), bed_controller_1.updateBedController);
/**
 * @swagger
 * /api/v1/beds/{id}:
 *   delete:
 *     tags:
 *       - Beds
 *     summary: Delete a bed
 *     description: Deletes a bed. Occupied beds cannot be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed ID
 *     responses:
 *       200:
 *         description: Bed deleted successfully
 *       400:
 *         description: Occupied bed cannot be deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Bed not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("BED_DELETE"), bed_controller_1.deleteBedController);
exports.default = router;
