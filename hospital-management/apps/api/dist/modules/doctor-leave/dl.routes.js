"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dl_controller_1 = require("./dl.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/doctor-leaves:
 *   post:
 *     tags:
 *       - Doctor Leaves
 *     summary: Create a doctor leave
 *     description: Creates a leave period for a doctor-hospital assignment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorHospitalId
 *               - startAt
 *               - endAt
 *             properties:
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-01T09:00:00Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-05T18:00:00Z"
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Personal leave"
 *     responses:
 *       201:
 *         description: Doctor leave created successfully
 *       400:
 *         description: Required fields missing, invalid date, or invalid leave range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Active doctor-hospital assignment not found
 *       409:
 *         description: Doctor leave conflicts with an existing leave period
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_LEAVE_CREATE"), dl_controller_1.createDoctorLeaveController);
/**
 * @swagger
 * /api/v1/doctor-leaves:
 *   get:
 *     tags:
 *       - Doctor Leaves
 *     summary: Get all doctor leaves
 *     description: Retrieves all doctor leave records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor leaves retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_LEAVE_READ"), dl_controller_1.getDoctorLeavesController);
/**
 * @swagger
 * /api/v1/doctor-leaves/{id}:
 *   get:
 *     tags:
 *       - Doctor Leaves
 *     summary: Get doctor leave by ID
 *     description: Retrieves a specific doctor leave record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor leave ID
 *     responses:
 *       200:
 *         description: Doctor leave retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor leave not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_LEAVE_READ"), dl_controller_1.getDoctorLeaveByIdController);
/**
 * @swagger
 * /api/v1/doctor-leaves/{id}:
 *   put:
 *     tags:
 *       - Doctor Leaves
 *     summary: Update a doctor leave
 *     description: Updates an existing doctor leave record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-01T09:00:00Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-05T18:00:00Z"
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated personal leave"
 *     responses:
 *       200:
 *         description: Doctor leave updated successfully
 *       400:
 *         description: Invalid date or invalid leave range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor leave or active doctor-hospital assignment not found
 *       409:
 *         description: Doctor leave conflicts with an existing leave period
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_LEAVE_UPDATE"), dl_controller_1.updateDoctorLeaveController);
exports.default = router;
