"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pat_controller_1 = require("./pat.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/patients:
 *   post:
 *     tags:
 *       - Patients
 *     summary: Create a new patient
 *     description: Creates a new patient record.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post("/patients", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_CREATE"), pat_controller_1.createPatientController);
/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get all patients
 *     description: Retrieves a list of patients.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/patients", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), pat_controller_1.getPatientsController);
/**
 * @swagger
 * /api/v1/patients/{id}:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get patient by ID
 *     description: Retrieves a single patient using their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.get("/patients/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), pat_controller_1.getPatientByIdController);
/**
 * @swagger
 * /api/v1/patients/{id}:
 *   put:
 *     tags:
 *       - Patients
 *     summary: Update patient
 *     description: Updates an existing patient record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.put("/patients/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), pat_controller_1.updatePatientController);
/**
 * @swagger
 * /api/v1/patients/{id}:
 *   delete:
 *     tags:
 *       - Patients
 *     summary: Delete patient
 *     description: Deletes a patient record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.delete("/patients/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_DELETE"), pat_controller_1.deletePatientController);
exports.default = router;
