import { Router } from "express";

import {
  createLabResultController,
  getLabResultsController,
  getLabResultByIdController,
  updateLabResultController,
} from "./lbr.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/lab-results:
 *   post:
 *     tags:
 *       - Lab Results
 *     summary: Create a lab result
 *     description: Creates a laboratory result for a diagnostic order item.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - diagnosticOrderItemId
 *               - reportedById
 *             properties:
 *               diagnosticOrderItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               reportedById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               values:
 *                 type: array
 *                 description: Result values accepted by the lab result service.
 *                 items:
 *                   type: object
 *                   additionalProperties: true
 *                 example:
 *                   - parameter: "Hemoglobin"
 *                     value: "13.5"
 *                     unit: "g/dL"
 *               remarks:
 *                 type: string
 *                 example: "Results are within normal limits."
 *     responses:
 *       201:
 *         description: Lab result created successfully
 *       400:
 *         description: Diagnostic order item ID and reporter ID are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic order item or reporter not found
 *       409:
 *         description: Lab result already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/lab-results",
  authenticate,
  requirePermission("LAB_RESULT_CREATE"),
  createLabResultController
);

/**
 * @swagger
 * /api/v1/lab-results:
 *   get:
 *     tags:
 *       - Lab Results
 *     summary: Get all lab results
 *     description: Retrieves all laboratory results.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lab results retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/lab-results",
  authenticate,
  requirePermission("LAB_RESULT_READ"),
  getLabResultsController
);

/**
 * @swagger
 * /api/v1/lab-results/{id}:
 *   get:
 *     tags:
 *       - Lab Results
 *     summary: Get lab result by ID
 *     description: Retrieves a specific laboratory result by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab result ID
 *     responses:
 *       200:
 *         description: Lab result retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lab result not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/lab-results/:id",
  authenticate,
  requirePermission("LAB_RESULT_READ"),
  getLabResultByIdController
);

/**
 * @swagger
 * /api/v1/lab-results/{id}:
 *   put:
 *     tags:
 *       - Lab Results
 *     summary: Update lab result
 *     description: Updates an existing laboratory result.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               diagnosticOrderItemId:
 *                 type: string
 *                 format: uuid
 *               reportedById:
 *                 type: string
 *                 format: uuid
 *               values:
 *                 type: array
 *                 items:
 *                   type: object
 *                   additionalProperties: true
 *               remarks:
 *                 type: string
 *                 example: "Updated laboratory remarks."
 *     responses:
 *       200:
 *         description: Lab result updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lab result not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/lab-results/:id",
  authenticate,
  requirePermission("LAB_RESULT_UPDATE"),
  updateLabResultController
);

export default router;