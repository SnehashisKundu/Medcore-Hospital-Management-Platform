import { Router } from "express";

import {
  createVaccinationController,
  getVaccinationsController,
  getVaccinationByIdController,
  updateVaccinationController,
  deleteVaccinationController,
} from "./vac.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/vaccinations:
 *   post:
 *     tags:
 *       - Vaccinations
 *     summary: Create a vaccination record
 *     description: Creates a vaccination record for a patient.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - vaccineName
 *               - administeredDate
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               vaccineName:
 *                 type: string
 *                 example: "Hepatitis B"
 *               administeredDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:00:00Z"
 *               nextDueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2027-08-29T10:00:00Z"
 *     responses:
 *       201:
 *         description: Vaccination created successfully
 *       400:
 *         description: Required fields are missing or vaccination date is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/vaccinations",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createVaccinationController
);

/**
 * @swagger
 * /api/v1/vaccinations:
 *   get:
 *     tags:
 *       - Vaccinations
 *     summary: Get all vaccinations
 *     description: Retrieves all vaccination records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vaccinations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vaccinations",
  authenticate,
  requirePermission("PATIENT_READ"),
  getVaccinationsController
);

/**
 * @swagger
 * /api/v1/vaccinations/{id}:
 *   get:
 *     tags:
 *       - Vaccinations
 *     summary: Get vaccination by ID
 *     description: Retrieves a specific vaccination record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vaccination ID
 *     responses:
 *       200:
 *         description: Vaccination retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vaccination not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getVaccinationByIdController
);

/**
 * @swagger
 * /api/v1/vaccinations/{id}:
 *   put:
 *     tags:
 *       - Vaccinations
 *     summary: Update a vaccination
 *     description: Updates an existing vaccination record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vaccination ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               vaccineName:
 *                 type: string
 *                 example: "Hepatitis B"
 *               administeredDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-29T10:00:00Z"
 *               nextDueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2027-08-29T10:00:00Z"
 *     responses:
 *       200:
 *         description: Vaccination updated successfully
 *       400:
 *         description: Invalid vaccination date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vaccination or patient not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateVaccinationController
);

/**
 * @swagger
 * /api/v1/vaccinations/{id}:
 *   delete:
 *     tags:
 *       - Vaccinations
 *     summary: Delete a vaccination
 *     description: Deletes an existing vaccination record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vaccination ID
 *     responses:
 *       200:
 *         description: Vaccination deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vaccination not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/vaccinations/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteVaccinationController
);

export default router;