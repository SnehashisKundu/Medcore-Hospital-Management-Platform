import { Router } from "express";

import {
  createBedController,
  getBedsController,
  getBedAvailabilitySummaryController,
  getBedByIdController,
  updateBedController,
  deleteBedController,
} from "./bed.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

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
router.post(
  "/",
  authenticate,
  requirePermission("BED_CREATE"),
  createBedController
);

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
router.get(
  "/",
  authenticate,
  requirePermission("BED_READ"),
  getBedsController
);

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
router.get(
  "/availability-summary",
  authenticate,
  requirePermission("BED_READ"),
  getBedAvailabilitySummaryController
);

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
router.get(
  "/:id",
  authenticate,
  requirePermission("BED_READ"),
  getBedByIdController
);

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
router.put(
  "/:id",
  authenticate,
  requirePermission("BED_UPDATE"),
  updateBedController
);

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
router.delete(
  "/:id",
  authenticate,
  requirePermission("BED_DELETE"),
  deleteBedController
);

export default router;