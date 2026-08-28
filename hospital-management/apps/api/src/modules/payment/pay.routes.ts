import { Router } from "express";

import {
  createPaymentController,
  getPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
} from "./pay.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create a payment
 *     description: Creates a payment against an invoice.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - amount
 *               - method
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               amount:
 *                 type: number
 *                 format: double
 *                 exclusiveMinimum: 0
 *                 example: 1500
 *               method:
 *                 type: string
 *                 example: "CASH"
 *               transactionReference:
 *                 type: string
 *                 example: "TXN-20260829-001"
 *               blockchainTxId:
 *                 type: string
 *                 nullable: true
 *                 example: "0xabc123..."
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid amount, invoice is not payable, invoice is already fully paid, or payment exceeds remaining amount
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/payments",
  authenticate,
  requirePermission("PAYMENT_CREATE"),
  createPaymentController
);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get all payments
 *     description: Retrieves all payment records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/payments",
  authenticate,
  requirePermission("BILLING_READ"),
  getPaymentsController
);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment by ID
 *     description: Retrieves a specific payment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/payments/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getPaymentByIdController
);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   put:
 *     tags:
 *       - Payments
 *     summary: Update payment
 *     description: Updates an existing payment. Refunded payments cannot be modified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *                 example: 1500
 *               method:
 *                 type: string
 *                 example: "CARD"
 *               status:
 *                 type: string
 *                 example: "COMPLETED"
 *               transactionReference:
 *                 type: string
 *                 example: "TXN-20260829-002"
 *               blockchainTxId:
 *                 type: string
 *                 nullable: true
 *                 example: "0xdef456..."
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       400:
 *         description: Refunded payment cannot be modified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/payments/:id",
  authenticate,
  requirePermission("PAYMENT_UPDATE"),
  updatePaymentController
);

export default router;