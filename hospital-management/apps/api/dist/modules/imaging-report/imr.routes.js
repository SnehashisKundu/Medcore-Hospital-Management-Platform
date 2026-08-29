"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imr_controller_1 = require("./imr.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/imaging-reports:
 *   post:
 *     tags:
 *       - Imaging Reports
 *     summary: Create an imaging report
 *     description: Creates an imaging report for a diagnostic order item.
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
 *               findings:
 *                 type: string
 *                 example: "No focal consolidation or pleural effusion identified."
 *               impression:
 *                 type: string
 *                 example: "No acute cardiopulmonary abnormality."
 *               conclusion:
 *                 type: string
 *                 example: "Normal chest radiograph."
 *               reportedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:30:00Z"
 *     responses:
 *       201:
 *         description: Imaging report created successfully
 *       400:
 *         description: Invalid imaging test, inactive diagnostic test, cancelled order item, or invalid reported date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnostic order item or reporter not found
 *       409:
 *         description: Imaging report already exists
 *       500:
 *         description: Internal server error
 */
router.post("/imaging-reports", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("IMAGING_RESULT_UPDATE"), imr_controller_1.createImagingReportController);
/**
 * @swagger
 * /api/v1/imaging-reports:
 *   get:
 *     tags:
 *       - Imaging Reports
 *     summary: Get all imaging reports
 *     description: Retrieves all imaging reports.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Imaging reports retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/imaging-reports", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("IMAGING_RESULT_READ"), imr_controller_1.getImagingReportsController);
/**
 * @swagger
 * /api/v1/imaging-reports/{id}:
 *   get:
 *     tags:
 *       - Imaging Reports
 *     summary: Get imaging report by ID
 *     description: Retrieves a specific imaging report by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Imaging report ID
 *     responses:
 *       200:
 *         description: Imaging report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Imaging report not found
 *       500:
 *         description: Internal server error
 */
router.get("/imaging-reports/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("IMAGING_RESULT_READ"), imr_controller_1.getImagingReportByIdController);
/**
 * @swagger
 * /api/v1/imaging-reports/{id}:
 *   put:
 *     tags:
 *       - Imaging Reports
 *     summary: Update imaging report
 *     description: Updates an existing imaging report.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Imaging report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosticOrderItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               reportedById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               findings:
 *                 type: string
 *                 example: "No focal consolidation identified."
 *               impression:
 *                 type: string
 *                 example: "No acute abnormality."
 *               conclusion:
 *                 type: string
 *                 example: "Normal study."
 *               reportedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:30:00Z"
 *     responses:
 *       200:
 *         description: Imaging report updated successfully
 *       400:
 *         description: Invalid update, empty findings, empty impression, empty conclusion, or invalid reported date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Imaging report not found
 *       500:
 *         description: Internal server error
 */
router.put("/imaging-reports/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("IMAGING_RESULT_UPDATE"), imr_controller_1.updateImagingReportController);
exports.default = router;
