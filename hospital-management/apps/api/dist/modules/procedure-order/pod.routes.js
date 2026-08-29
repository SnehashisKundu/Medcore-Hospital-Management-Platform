"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pod_controller_1 = require("./pod.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/procedure-orders:
 *   post:
 *     tags:
 *       - Procedure Orders
 *     summary: Create a procedure order
 *     description: Creates a procedure order for an encounter. The authenticated user is recorded as the ordering user.
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
 *               - procedureId
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               admissionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               procedureId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Patient requires surgical intervention"
 *               instructions:
 *                 type: string
 *                 nullable: true
 *                 example: "Keep patient NPO after midnight"
 *               scheduledStart:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-08-30T09:00:00Z"
 *               scheduledEnd:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-08-30T10:30:00Z"
 *     responses:
 *       201:
 *         description: Procedure order created successfully
 *       400:
 *         description: Required fields are missing, admission is invalid/inactive, patient mismatch, or schedule is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter, procedure, user, or admission not found
 *       500:
 *         description: Internal server error
 */
router.post("/procedure-orders", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_ORDER_CREATE"), pod_controller_1.createProcedureOrderController);
/**
 * @swagger
 * /api/v1/procedure-orders:
 *   get:
 *     tags:
 *       - Procedure Orders
 *     summary: Get all procedure orders
 *     description: Retrieves all procedure orders.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procedure orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/procedure-orders", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_ORDER_READ"), pod_controller_1.getProcedureOrdersController);
/**
 * @swagger
 * /api/v1/procedure-orders/{id}:
 *   get:
 *     tags:
 *       - Procedure Orders
 *     summary: Get procedure order by ID
 *     description: Retrieves a specific procedure order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure order ID
 *     responses:
 *       200:
 *         description: Procedure order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure order not found
 *       500:
 *         description: Internal server error
 */
router.get("/procedure-orders/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_ORDER_READ"), pod_controller_1.getProcedureOrderByIdController);
/**
 * @swagger
 * /api/v1/procedure-orders/{id}:
 *   put:
 *     tags:
 *       - Procedure Orders
 *     summary: Update a procedure order
 *     description: Updates an existing procedure order. Completed or cancelled procedure orders cannot be modified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               admissionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated clinical reason"
 *               instructions:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated pre-operative instructions"
 *               scheduledStart:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-08-30T09:00:00Z"
 *               scheduledEnd:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-08-30T10:30:00Z"
 *               status:
 *                 type: string
 *                 example: SCHEDULED
 *     responses:
 *       200:
 *         description: Procedure order updated successfully
 *       400:
 *         description: Completed or cancelled procedure order cannot be modified, or schedule is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure order not found
 *       500:
 *         description: Internal server error
 */
router.put("/procedure-orders/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_ORDER_UPDATE"), pod_controller_1.updateProcedureOrderController);
exports.default = router;
