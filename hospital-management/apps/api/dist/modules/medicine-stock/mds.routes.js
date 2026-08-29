"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mds_controller_1 = require("./mds.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/medicine-stocks:
 *   post:
 *     tags:
 *       - Medicine Stock
 *     summary: Create medicine stock
 *     description: Adds a medicine batch and its available stock to a hospital.
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
 *               - medicineId
 *               - batchNumber
 *               - expiryDate
 *               - purchasePrice
 *               - sellingPrice
 *               - quantityAvailable
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               medicineId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               batchNumber:
 *                 type: string
 *                 example: "PCM-2026-001"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2028-12-31T00:00:00Z"
 *               purchasePrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 25.50
 *               sellingPrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 30.00
 *               quantityAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 example: 500
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *     responses:
 *       201:
 *         description: Medicine stock created successfully
 *       400:
 *         description: Required fields are missing, quantity is negative, or price is negative
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital, medicine, or supplier not found
 *       409:
 *         description: Medicine stock with this batch already exists
 *       500:
 *         description: Internal server error
 */
router.post("/medicine-stocks", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_STOCK_CREATE"), mds_controller_1.createMedicineStockController);
/**
 * @swagger
 * /api/v1/medicine-stocks:
 *   get:
 *     tags:
 *       - Medicine Stock
 *     summary: Get all medicine stocks
 *     description: Retrieves all medicine stock records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicine stocks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/medicine-stocks", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_STOCK_READ"), mds_controller_1.getMedicineStocksController);
/**
 * @swagger
 * /api/v1/medicine-stocks/{id}:
 *   get:
 *     tags:
 *       - Medicine Stock
 *     summary: Get medicine stock by ID
 *     description: Retrieves a specific medicine stock record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medicine stock ID
 *     responses:
 *       200:
 *         description: Medicine stock retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine stock not found
 *       500:
 *         description: Internal server error
 */
router.get("/medicine-stocks/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_STOCK_READ"), mds_controller_1.getMedicineStockByIdController);
/**
 * @swagger
 * /api/v1/medicine-stocks/{id}:
 *   put:
 *     tags:
 *       - Medicine Stock
 *     summary: Update medicine stock
 *     description: Updates an existing medicine stock record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medicine stock ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               batchNumber:
 *                 type: string
 *                 example: "PCM-2026-001"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2028-12-31T00:00:00Z"
 *               purchasePrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 25.50
 *               sellingPrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 30.00
 *               quantityAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 example: 450
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *     responses:
 *       200:
 *         description: Medicine stock updated successfully
 *       400:
 *         description: Quantity or price cannot be negative
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine stock or supplier not found
 *       500:
 *         description: Internal server error
 */
router.put("/medicine-stocks/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_STOCK_UPDATE"), mds_controller_1.updateMedicineStockController);
exports.default = router;
