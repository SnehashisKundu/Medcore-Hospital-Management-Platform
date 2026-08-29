"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ds_controller_1 = require("./ds.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/discharge-summaries:
 *   post:
 *     tags:
 *       - Discharge Summaries
 *     summary: Create a discharge summary
 *     description: Creates a discharge summary for an active admission and discharges the patient.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admissionId
 *             properties:
 *               admissionId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               finalDiagnosis:
 *                 type: string
 *                 nullable: true
 *                 example: "Acute appendicitis"
 *               hospitalCourse:
 *                 type: string
 *                 nullable: true
 *                 example: "Patient underwent successful treatment and remained clinically stable."
 *               conditionAtDischarge:
 *                 type: string
 *                 nullable: true
 *                 example: "Stable"
 *               dischargeAdvice:
 *                 type: string
 *                 nullable: true
 *                 example: "Take prescribed medications and return for review if symptoms worsen."
 *               dietAdvice:
 *                 type: string
 *                 nullable: true
 *                 example: "Regular diet as tolerated"
 *               activityAdvice:
 *                 type: string
 *                 nullable: true
 *                 example: "Avoid strenuous activity for one week"
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-09-05T10:00:00Z"
 *     responses:
 *       201:
 *         description: Patient discharged successfully
 *       400:
 *         description: Admission ID is missing, follow-up date is invalid, or admission is not active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Admission not found
 *       409:
 *         description: Discharge summary already exists for this admission
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DISCHARGE_SUMMARY_CREATE"), ds_controller_1.createDischargeSummaryController);
/**
 * @swagger
 * /api/v1/discharge-summaries:
 *   get:
 *     tags:
 *       - Discharge Summaries
 *     summary: Get discharge summaries
 *     description: Retrieves discharge summaries. Optionally filters by admission ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: admissionId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter discharge summaries by admission ID
 *     responses:
 *       200:
 *         description: Discharge summaries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DISCHARGE_SUMMARY_READ"), ds_controller_1.getDischargeSummariesController);
/**
 * @swagger
 * /api/v1/discharge-summaries/{id}:
 *   get:
 *     tags:
 *       - Discharge Summaries
 *     summary: Get discharge summary by ID
 *     description: Retrieves a specific discharge summary.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Discharge summary ID
 *     responses:
 *       200:
 *         description: Discharge summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Discharge summary not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DISCHARGE_SUMMARY_READ"), ds_controller_1.getDischargeSummaryByIdController);
exports.default = router;
