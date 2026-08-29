"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ds_controller_1 = require("./ds.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/doctor-schedules:
 *   post:
 *     tags:
 *       - Doctor Schedules
 *     summary: Create a doctor schedule
 *     description: Creates a weekly schedule for a doctor assigned to a hospital and department.
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
 *               - departmentId
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *               - slotDurationMinutes
 *             properties:
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: Day of week represented by a numeric value.
 *                 example: 1
 *               startTime:
 *                 type: string
 *                 pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "17:00"
 *               slotDurationMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 example: 30
 *     responses:
 *       201:
 *         description: Doctor schedule created successfully
 *       400:
 *         description: Invalid time format, invalid time range, invalid slot duration, non-divisible schedule duration, or doctor is not assigned to the department
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Active doctor-hospital assignment or department not found
 *       409:
 *         description: Schedule already exists or conflicts with an existing schedule
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_SCHEDULE_CREATE"), ds_controller_1.createDoctorScheduleController);
/**
 * @swagger
 * /api/v1/doctor-schedules:
 *   get:
 *     tags:
 *       - Doctor Schedules
 *     summary: Get all doctor schedules
 *     description: Retrieves all doctor schedules.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_SCHEDULE_READ"), ds_controller_1.getDoctorSchedulesController);
/**
 * @swagger
 * /api/v1/doctor-schedules/{id}:
 *   get:
 *     tags:
 *       - Doctor Schedules
 *     summary: Get doctor schedule by ID
 *     description: Retrieves a specific doctor schedule.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor schedule ID
 *     responses:
 *       200:
 *         description: Doctor schedule retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor schedule not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_SCHEDULE_READ"), ds_controller_1.getDoctorScheduleByIdController);
/**
 * @swagger
 * /api/v1/doctor-schedules/{id}:
 *   put:
 *     tags:
 *       - Doctor Schedules
 *     summary: Update a doctor schedule
 *     description: Updates an existing doctor schedule.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor schedule ID
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
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 example: 1
 *               startTime:
 *                 type: string
 *                 pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "17:00"
 *               slotDurationMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 example: 30
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Doctor schedule updated successfully
 *       400:
 *         description: Invalid time format, invalid time range, invalid slot duration, non-divisible schedule duration, or doctor is not assigned to the department
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor schedule, doctor-hospital assignment, or department not found
 *       409:
 *         description: Schedule conflicts with an existing schedule
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_SCHEDULE_UPDATE"), ds_controller_1.updateDoctorScheduleController);
/**
 * @swagger
 * /api/v1/doctor-schedules/{id}:
 *   delete:
 *     tags:
 *       - Doctor Schedules
 *     summary: Deactivate a doctor schedule
 *     description: Deactivates an existing doctor schedule.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor schedule ID
 *     responses:
 *       200:
 *         description: Doctor schedule deactivated successfully
 *       400:
 *         description: Doctor schedule is already inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor schedule not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_SCHEDULE_DELETE"), ds_controller_1.deleteDoctorScheduleController);
exports.default = router;
