import { Router } from "express";

import {
  createDiagnosticTestController,
  getDiagnosticTestsController,
  getDiagnosticTestByIdController,
  updateDiagnosticTestController,
} from "./dgt.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/diagnostic-tests:
 *   post:
 *     tags:
 *       - Diagnostic Tests
 *     summary: Create a diagnostic test
 *     description: Creates a new diagnostic test in the diagnostic test catalogue.
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Complete Blood Count"
 *               code:
 *                 type: string
 *                 example: "CBC"
 *               category:
 *                 type: string
 *                 example: "LABORATORY"
 *     responses:
 *       201:
 *         description: Diagnostic test created successfully
 *       400:
 *         description: Name, code and category are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Diagnostic test already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/diagnostic-tests",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_CREATE"),
  createDiagnosticTestController
);

/**
 * @swagger
 * /api/v1/diagnostic-tests:
 *   get:
 *     tags:
 *       - Diagnostic Tests
 *     summary: Get all diagnostic tests
 *     description: Retrieves all diagnostic tests.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnostic tests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/diagnostic-tests",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_READ"),
  getDiagnosticTestsController
);

/**
 * @swagger
 * /api/v1/diagnostic-tests/{id}:
 *   get:
 *     tags:
 *       - Diagnostic Tests
 *     summary: Get diagnostic test by ID
 *     description: Retrieves a specific diagnostic test by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnostic test ID
 *     responses:
 *       200:
 *         description: Diagnostic test retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic test not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/diagnostic-tests/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_READ"),
  getDiagnosticTestByIdController
);

/**
 * @swagger
 * /api/v1/diagnostic-tests/{id}:
 *   put:
 *     tags:
 *       - Diagnostic Tests
 *     summary: Update diagnostic test
 *     description: Updates an existing diagnostic test.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnostic test ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Complete Blood Count"
 *               code:
 *                 type: string
 *                 example: "CBC"
 *               category:
 *                 type: string
 *                 example: "LABORATORY"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Diagnostic test updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic test not found
 *       409:
 *         description: Diagnostic test already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/diagnostic-tests/:id",
  authenticate,
  requirePermission("DIAGNOSTIC_TEST_UPDATE"),
  updateDiagnosticTestController
);

export default router;