import { Router } from "express";

import {
  createChargeController,
  getChargesController,
  getChargeByIdController,
  createInvoiceController,
  getInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
} from "./bil.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/charges:
 *   post:
 *     tags:
 *       - Billing
 *     summary: Create a charge
 *     description: Creates a billing charge for a patient.
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
 *               - patientId
 *               - type
 *               - description
 *               - unitPrice
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *               type:
 *                 type: string
 *                 example: "CONSULTATION"
 *               description:
 *                 type: string
 *                 example: "Doctor consultation fee"
 *               unitPrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 500
 *     responses:
 *       201:
 *         description: Charge created successfully
 *       400:
 *         description: Required fields are missing or amount is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital, patient, or encounter not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/charges",
  authenticate,
  requirePermission("BILLING_CREATE"),
  createChargeController
);

/**
 * @swagger
 * /api/v1/charges:
 *   get:
 *     tags:
 *       - Billing
 *     summary: Get all charges
 *     description: Retrieves all billing charges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Charges retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/charges",
  authenticate,
  requirePermission("BILLING_READ"),
  getChargesController
);

/**
 * @swagger
 * /api/v1/charges/{id}:
 *   get:
 *     tags:
 *       - Billing
 *     summary: Get charge by ID
 *     description: Retrieves a specific billing charge.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Charge ID
 *     responses:
 *       200:
 *         description: Charge retrieved successfully
 *       401:
 *         description: Unauthorized
 *       * 403:
 *         description: Insufficient permissions
 *       * 404:
 *         description: Charge not found
 *       * 500:
 *         description: Internal server error
 */
router.get(
  "/charges/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getChargeByIdController
);

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     tags:
 *       - Billing
 *     summary: Create an invoice
 *     description: Creates an invoice from one or more billing charges.
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
 *               - patientId
 *               - chargeIds
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               chargeIds:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "12345678-1234-1234-1234-123456789014"
 *                   - "12345678-1234-1234-1234-123456789015"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Required fields are missing, charges are invalid, amount is invalid, or invoice total is negative
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital or patient not found
 *       409:
 *         description: One or more charges are already invoiced
 *       500:
 *         description: Internal server error
 */
router.post(
  "/invoices",
  authenticate,
  requirePermission("BILLING_CREATE"),
  createInvoiceController
);

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     tags:
 *       - Billing
 *     summary: Get all invoices
 *     description: Retrieves all invoices.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/invoices",
  authenticate,
  requirePermission("BILLING_READ"),
  getInvoicesController
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     tags:
 *       - Billing
 *     summary: Get invoice by ID
 *     description: Retrieves a specific invoice by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/invoices/:id",
  authenticate,
  requirePermission("BILLING_READ"),
  getInvoiceByIdController
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   put:
 *     tags:
 *       - Billing
 *     summary: Update invoice
 *     description: Updates an invoice. Paid invoices cannot be modified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
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
 *                 example: PENDING
 *               totalAmount:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 1500
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       400:
 *         description: Paid invoice cannot be modified or invoice total is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/invoices/:id",
  authenticate,
  requirePermission("BILLING_UPDATE"),
  updateInvoiceController
);

export default router;