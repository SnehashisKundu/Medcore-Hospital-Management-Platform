"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apt_controller_1 = require("./apt.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Create an appointment
 *     description: Creates an appointment after validating the doctor schedule, leave status, and existing appointments.
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
 *               - doctorHospitalId
 *               - doctorDepartmentAssignmentId
 *               - appointmentNumber
 *               - scheduledStart
 *               - scheduledEnd
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "940a1c09-55d7-4a14-8734-d31b2dbb444a"
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "5968fdae-3097-4ed7-8b8c-231f6650c664"
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "940a1c09-55d7-4a14-8734-d31b2dbb444a"
 *               doctorDepartmentAssignmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               appointmentNumber:
 *                 type: string
 *                 example: "APT-2026-001"
 *               scheduledStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-02T10:30:00.000Z"
 *               scheduledEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-02T11:00:00.000Z"
 *               type:
 *                 type: string
 *                 example: CONSULTATION
 *               priority:
 *                 type: string
 *                 example: NORMAL
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Required fields missing or invalid appointment date/range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital, patient, doctor assignment, or department assignment not found
 *       409:
 *         description: Appointment number already exists, doctor unavailable, doctor on leave, invalid schedule slot, or appointment slot already booked
 *       500:
 *         description: Internal server error
 */
router.post("/appointments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("APPOINTMENT_CREATE"), apt_controller_1.createAppointmentController);
/**
 * @swagger
 * /api/v1/appointments:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all appointments
 *     description: Retrieves all appointments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/appointments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("APPOINTMENT_READ"), apt_controller_1.getAppointmentsController);
/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get appointment by ID
 *     description: Retrieves an appointment using its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.get("/appointments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("APPOINTMENT_READ"), apt_controller_1.getAppointmentByIdController);
/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Update appointment
 *     description: Updates an existing appointment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *               doctorDepartmentAssignmentId:
 *                 type: string
 *                 format: uuid
 *               appointmentNumber:
 *                 type: string
 *                 example: "APT-2026-001"
 *               scheduledStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-02T10:30:00.000Z"
 *               scheduledEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-02T11:00:00.000Z"
 *               type:
 *                 type: string
 *                 example: CONSULTATION
 *               priority:
 *                 type: string
 *                 example: NORMAL
 *               status:
 *                 type: string
 *                 example: BOOKED
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Invalid appointment date or time range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Appointment or related resource not found
 *       409:
 *         description: Appointment conflict or doctor unavailable
 *       500:
 *         description: Internal server error
 */
router.put("/appointments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("APPOINTMENT_UPDATE"), apt_controller_1.updateAppointmentController);
/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   delete:
 *     tags:
 *       - Appointments
 *     summary: Delete appointment
 *     description: Deletes an existing appointment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/appointments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("APPOINTMENT_DELETE"), apt_controller_1.deleteAppointmentController);
exports.default = router;
