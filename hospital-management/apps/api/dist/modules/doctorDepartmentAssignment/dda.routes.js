"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dda_controller_1 = require("./dda.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/doctor-department-assignments:
 *   post:
 *     tags:
 *       - Doctor Department Assignments
 *     summary: Assign a doctor to a department
 *     description: Creates an assignment connecting a doctor-hospital relationship with a department and specialization.
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
 *               - specializationId
 *             properties:
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               specializationId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Doctor department assignment created successfully
 *       400:
 *         description: Required fields are missing or doctor-hospital assignment is inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor hospital assignment, department, or specialization not found
 *       409:
 *         description: Doctor is already assigned to this department and specialization
 *       500:
 *         description: Internal server error
 */
router.post("/doctor-department-assignments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DEPARTMENT_ASSIGNMENT_CREATE"), dda_controller_1.createAssignmentController);
/**
 * @swagger
 * /api/v1/doctor-department-assignments:
 *   get:
 *     tags:
 *       - Doctor Department Assignments
 *     summary: Get all doctor department assignments
 *     description: Retrieves all doctor department assignments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/doctor-department-assignments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DEPARTMENT_ASSIGNMENT_READ"), dda_controller_1.getAssignmentsController);
/**
 * @swagger
 * /api/v1/doctor-department-assignments/{id}:
 *   get:
 *     tags:
 *       - Doctor Department Assignments
 *     summary: Get assignment by ID
 *     description: Retrieves a specific doctor department assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor department assignment ID
 *     responses:
 *       200:
 *         description: Assignment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.get("/doctor-department-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DEPARTMENT_ASSIGNMENT_READ"), dda_controller_1.getAssignmentByIdController);
/**
 * @swagger
 * /api/v1/doctor-department-assignments/{id}:
 *   put:
 *     tags:
 *       - Doctor Department Assignments
 *     summary: Update doctor department assignment
 *     description: Updates an existing doctor department assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor department assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorHospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               specializationId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789014"
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Doctor department assignment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.put("/doctor-department-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DEPARTMENT_ASSIGNMENT_UPDATE"), dda_controller_1.updateAssignmentController);
/**
 * @swagger
 * /api/v1/doctor-department-assignments/{id}:
 *   delete:
 *     tags:
 *       - Doctor Department Assignments
 *     summary: Delete doctor department assignment
 *     description: Deletes an existing doctor department assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor department assignment ID
 *     responses:
 *       200:
 *         description: Doctor department assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/doctor-department-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DEPARTMENT_ASSIGNMENT_DELETE"), dda_controller_1.deleteAssignmentController);
exports.default = router;
