import { Router } from "express";

import {
  createVitalController,
  getVitalsController,
  getVitalByIdController,
  updateVitalController,
} from "./vit.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/vitals:
 *   post:
 *     tags:
 *       - Vitals
 *     summary: Record patient vitals
 *     description: Records vital signs for a patient encounter.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encounterId
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               temperatureCelsius:
 *                 type: number
 *                 format: float
 *                 example: 37.2
 *               pulseRate:
 *                 type: number
 *                 example: 78
 *               oxygenSaturation:
 *                 type: number
 *                 format: float
 *                 example: 98
 *     responses:
 *       201:
 *         description: Vital created successfully
 *       400:
 *         description: Encounter ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter or recorder user not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/vitals",
  authenticate,
  requirePermission("VITALS_CREATE"),
  createVitalController
);

/**
 * @swagger
 * /api/v1/vitals:
 *   get:
 *     tags:
 *       - Vitals
 *     summary: Get all vitals
 *     description: Retrieves all recorded vital signs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vitals retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vitals",
  authenticate,
  requirePermission("VITALS_READ"),
  getVitalsController
);

/**
 * @swagger
 * /api/v1/vitals/{id}:
 *   get:
 *     tags:
 *       - Vitals
 *     summary: Get vital by ID
 *     description: Retrieves a specific vital record by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vital record ID
 *     responses:
 *       200:
 *         description: Vital retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vital not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vitals/:id",
  authenticate,
  requirePermission("VITALS_READ"),
  getVitalByIdController
);

/**
 * @swagger
 * /api/v1/vitals/{id}:
 *   put:
 *     tags:
 *       - Vitals
 *     summary: Update vital record
 *     description: Updates an existing vital record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vital record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               temperatureCelsius:
 *                 type: number
 *                 format: float
 *                 example: 37.2
 *               pulseRate:
 *                 type: number
 *                 example: 78
 *               oxygenSaturation:
 *                 type: number
 *                 format: float
 *                 example: 98
 *     responses:
 *       200:
 *         description: Vital updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vital not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/vitals/:id",
  authenticate,
  requirePermission("VITALS_UPDATE"),
  updateVitalController
);

export default router;