import { Router } from "express";

import {
  createMedicineDispenseController,
  getMedicineDispensesController,
  getMedicineDispenseByIdController,
} from "./pmd.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/medicine-dispenses:
 *   post:
 *     tags:
 *       - Medicine Dispenses
 *     summary: Dispense medicines
 *     description: Dispenses one or more medicines against a prescription.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prescriptionId
 *               - dispensedById
 *               - items
 *             properties:
 *               prescriptionId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               dispensedById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - prescriptionItemId
 *                     - medicineStockId
 *                     - quantity
 *                   properties:
 *                     prescriptionItemId:
 *                       type: string
 *                       format: uuid
 *                       example: "12345678-1234-1234-1234-123456789014"
 *                     medicineStockId:
 *                       type: string
 *                       format: uuid
 *                       example: "12345678-1234-1234-1234-123456789015"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 10
 *     responses:
 *       201:
 *         description: Medicine dispensed successfully
 *       400:
 *         description: Missing required fields, stock medicine mismatch, insufficient stock, or invalid quantity
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Prescription, dispenser, prescription item, or medicine stock not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/medicine-dispenses",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  createMedicineDispenseController
);

/**
 * @swagger
 * /api/v1/medicine-dispenses:
 *   get:
 *     tags:
 *       - Medicine Dispenses
 *     summary: Get all medicine dispenses
 *     description: Retrieves all medicine dispensing records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicine dispenses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/medicine-dispenses",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  getMedicineDispensesController
);

/**
 * @swagger
 * /api/v1/medicine-dispenses/{id}:
 *   get:
 *     tags:
 *       - Medicine Dispenses
 *     summary: Get medicine dispense by ID
 *     description: Retrieves a specific medicine dispensing record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medicine dispense ID
 *     responses:
 *       200:
 *         description: Medicine dispense retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine dispense not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/medicine-dispenses/:id",
  authenticate,
  requirePermission("PHARMACY_DISPENSE"),
  getMedicineDispenseByIdController
);

export default router;