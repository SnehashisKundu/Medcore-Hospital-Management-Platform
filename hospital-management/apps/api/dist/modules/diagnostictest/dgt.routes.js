"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dgt_controller_1 = require("./dgt.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
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
router.post("/diagnostic-tests", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_TEST_CREATE"), dgt_controller_1.createDiagnosticTestController);
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
router.get("/diagnostic-tests", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_TEST_READ"), dgt_controller_1.getDiagnosticTestsController);
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
router.get("/diagnostic-tests/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_TEST_READ"), dgt_controller_1.getDiagnosticTestByIdController);
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
router.put("/diagnostic-tests/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_TEST_UPDATE"), dgt_controller_1.updateDiagnosticTestController);
exports.default = router;
