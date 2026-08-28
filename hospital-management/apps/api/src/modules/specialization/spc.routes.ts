import { Router } from "express";

import {
  createSpecializationController,
  getSpecializationsController,
  getSpecializationByIdController,
} from "./spc.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/specializations:
 *   post:
 *     tags:
 *       - Specializations
 *     summary: Create a specialization
 *     description: Creates a new medical specialization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cardiology"
 *               code:
 *                 type: string
 *                 example: "CARD"
 *               description:
 *                 type: string
 *                 example: "Medical specialization focused on the cardiovascular system."
 *     responses:
 *       201:
 *         description: Specialization created successfully
 *       400:
 *         description: Specialization name and code are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Specialization code already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/specializations",
  authenticate,
  requirePermission("SPECIALIZATION_CREATE"),
  createSpecializationController
);

/**
 * @swagger
 * /api/v1/specializations:
 *   get:
 *     tags:
 *       - Specializations
 *     summary: Get all specializations
 *     description: Retrieves all medical specializations.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/specializations",
  authenticate,
  requirePermission("SPECIALIZATION_READ"),
  getSpecializationsController
);

/**
 * @swagger
 * /api/v1/specializations/{id}:
 *   get:
 *     tags:
 *       - Specializations
 *     summary: Get specialization by ID
 *     description: Retrieves a specific specialization by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Specialization retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/specializations/:id",
  authenticate,
  requirePermission("SPECIALIZATION_READ"),
  getSpecializationByIdController
);

export default router;