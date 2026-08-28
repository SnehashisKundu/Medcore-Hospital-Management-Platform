import { Router } from "express";

import {
  createPatientController,
  getPatientsController,
  getPatientByIdController,
  updatePatientController,
  deletePatientController,
} from "./pat.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

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
router.post(
  "/patients",
  authenticate,
  requirePermission("PATIENT_CREATE"),
  createPatientController
);

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
router.get(
  "/patients",
  authenticate,
  requirePermission("PATIENT_READ"),
  getPatientsController
);

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
router.get(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getPatientByIdController
);

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
router.put(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updatePatientController
);

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
router.delete(
  "/patients/:id",
  authenticate,
  requirePermission("PATIENT_DELETE"),
  deletePatientController
);

export default router;