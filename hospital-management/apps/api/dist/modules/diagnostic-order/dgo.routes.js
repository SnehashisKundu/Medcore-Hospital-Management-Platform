"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dgo_controller_1 = require("./dgo.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/diagnostic-orders:
 *   post:
 *     tags:
 *       - Diagnostic Orders
 *     summary: Create a diagnostic order
 *     description: Creates a diagnostic order containing one or more diagnostic tests for an encounter.
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
 *               - orderedById
 *               - items
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               orderedById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               clinicalNotes:
 *                 type: string
 *                 example: "Patient requires routine blood investigations."
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - diagnosticTestId
 *                   properties:
 *                     diagnosticTestId:
 *                       type: string
 *                       format: uuid
 *                       example: "12345678-1234-1234-1234-123456789014"
 *                     instructions:
 *                       type: string
 *                       example: "Fasting sample required."
 *     responses:
 *       201:
 *         description: Diagnostic order created successfully
 *       400:
 *         description: Required fields are missing, encounter is cancelled, no diagnostic items supplied, or diagnostic test is inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter, ordering doctor, or diagnostic test not found
 *       500:
 *         description: Internal server error
 */
router.post("/diagnostic-orders", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_ORDER_CREATE"), dgo_controller_1.createDiagnosticOrderController);
/**
 * @swagger
 * /api/v1/diagnostic-orders:
 *   get:
 *     tags:
 *       - Diagnostic Orders
 *     summary: Get all diagnostic orders
 *     description: Retrieves all diagnostic orders.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnostic orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/diagnostic-orders", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_ORDER_READ"), dgo_controller_1.getDiagnosticOrdersController);
/**
 * @swagger
 * /api/v1/diagnostic-orders/{id}:
 *   get:
 *     tags:
 *       - Diagnostic Orders
 *     summary: Get diagnostic order by ID
 *     description: Retrieves a specific diagnostic order by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnostic order ID
 *     responses:
 *       200:
 *         description: Diagnostic order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic order not found
 *       500:
 *         description: Internal server error
 */
router.get("/diagnostic-orders/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_ORDER_READ"), dgo_controller_1.getDiagnosticOrderByIdController);
/**
 * @swagger
 * /api/v1/diagnostic-orders/{id}:
 *   put:
 *     tags:
 *       - Diagnostic Orders
 *     summary: Update diagnostic order
 *     description: Updates an existing diagnostic order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnostic order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clinicalNotes:
 *                 type: string
 *                 example: "Updated clinical notes."
 *     responses:
 *       200:
 *         description: Diagnostic order updated successfully
 *       400:
 *         description: Cannot update diagnostic order of a cancelled encounter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic order not found
 *       500:
 *         description: Internal server error
 */
router.put("/diagnostic-orders/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_ORDER_UPDATE"), dgo_controller_1.updateDiagnosticOrderController);
/**
 * @swagger
 * /api/v1/diagnostic-order-items/{id}:
 *   put:
 *     tags:
 *       - Diagnostic Orders
 *     summary: Update diagnostic order item
 *     description: Updates an individual diagnostic order item.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnostic order item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               status:
 *                 type: string
 *                 example: COMPLETED
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:00:00Z"
 *               sampleCollectedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:30:00Z"
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:45:00Z"
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T11:00:00Z"
 *               instructions:
 *                 type: string
 *                 example: "Sample processed successfully."
 *     responses:
 *       200:
 *         description: Diagnostic order item updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic order item not found
 *       500:
 *         description: Internal server error
 */
router.put("/diagnostic-order-items/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DIAGNOSTIC_RESULT_UPDATE"), dgo_controller_1.updateDiagnosticOrderItemController);
exports.default = router;
