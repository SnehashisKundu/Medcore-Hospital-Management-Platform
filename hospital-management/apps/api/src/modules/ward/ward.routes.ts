import { Router } from "express";

import {
  createWardController,
  getWardsController,
  getWardByIdController,
  updateWardController,
  deleteWardController,
} from "./ward.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/wards:
 *   post:
 *     tags:
 *       - Wards
 *     summary: Create a ward
 *     description: Creates a new ward within a hospital.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalId
 *               - name
 *               - code
 *               - type
 *               - floor
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               name:
 *                 type: string
 *                 example: "General Ward"
 *               code:
 *                 type: string
 *                 example: "GW-01"
 *               type:
 *                 type: string
 *                 example: "GENERAL"
 *               floor:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                   - type: boolean
 *                 example: 1
 *     responses:
 *       201:
 *         description: Ward created successfully
 *       400:
 *         description: Hospital ID, ward name, ward code, ward type, or floor is missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       409:
 *         description: Ward code already exists in this hospital
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("WARD_CREATE"),
  createWardController
);

/**
 * @swagger
 * /api/v1/wards:
 *   get:
 *     tags:
 *       - Wards
 *     summary: Get all wards
 *     description: Retrieves all wards. Optionally filters wards by hospital ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter wards by hospital ID
 *     responses:
 *       200:
 *         description: Wards retrieved successfully
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
  requirePermission("WARD_READ"),
  getWardsController
);

/**
 * @swagger
 * /api/v1/wards/{id}:
 *   get:
 *     tags:
 *       - Wards
 *     summary: Get ward by ID
 *     description: Retrieves a specific ward by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ward ID
 *     responses:
 *       200:
 *         description: Ward retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Ward not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("WARD_READ"),
  getWardByIdController
);

/**
 * @swagger
 * /api/v1/wards/{id}:
 *   put:
 *     tags:
 *       - Wards
 *     summary: Update a ward
 *     description: Updates an existing ward.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ward ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               name:
 *                 type: string
 *                 example: "General Ward"
 *               code:
 *                 type: string
 *                 example: "GW-01"
 *               type:
 *                 type: string
 *                 example: "GENERAL"
 *               floor:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                   - type: boolean
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ward updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Ward not found
 *       409:
 *         description: Ward code already exists in this hospital
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  requirePermission("WARD_UPDATE"),
  updateWardController
);

/**
 * @swagger
 * /api/v1/wards/{id}:
 *   delete:
 *     tags:
 *       - Wards
 *     summary: Delete a ward
 *     description: Deletes a ward.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ward ID
 *     responses:
 *       200:
 *         description: Ward deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Ward not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("WARD_DELETE"),
  deleteWardController
);

export default router;