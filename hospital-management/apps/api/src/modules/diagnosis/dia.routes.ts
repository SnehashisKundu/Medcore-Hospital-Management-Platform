import { Router } from "express";

import {
  createDiagnosisController,
  getDiagnosesController,
  getDiagnosisByIdController,
  updateDiagnosisController,
} from "./dia.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/diagnoses:
 *   post:
 *     tags:
 *       - Diagnoses
 *     summary: Create a diagnosis
 *     description: Creates a diagnosis for a patient encounter.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encounterId
 *               - type
 *               - diagnosisName
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               type:
 *                 type: string
 *                 example: "CLINICAL"
 *               diagnosisName:
 *                 type: string
 *                 example: "Acute Bronchitis"
 *               icd10Code:
 *                 type: string
 *                 example: "J20.9"
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Diagnosis created successfully
 *       400:
 *         description: Required fields are missing or encounter is cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter or diagnosing user not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/diagnoses",
  authenticate,
  requirePermission("DIAGNOSIS_CREATE"),
  createDiagnosisController
);

/**
 * @swagger
 * /api/v1/diagnoses:
 *   get:
 *     tags:
 *       - Diagnoses
 *     summary: Get all diagnoses
 *     description: Retrieves all diagnosis records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnoses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/diagnoses",
  authenticate,
  requirePermission("DIAGNOSIS_READ"),
  getDiagnosesController
);

/**
 * @swagger
 * /api/v1/diagnoses/{id}:
 *   get:
 *     tags:
 *       - Diagnoses
 *     summary: Get diagnosis by ID
 *     description: Retrieves a specific diagnosis by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnosis ID
 *     responses:
 *       200:
 *         description: Diagnosis retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnosis not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/diagnoses/:id",
  authenticate,
  requirePermission("DIAGNOSIS_READ"),
  getDiagnosisByIdController
);

/**
 * @swagger
 * /api/v1/diagnoses/{id}:
 *   put:
 *     tags:
 *       - Diagnoses
 *     summary: Update diagnosis
 *     description: Updates an existing diagnosis.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diagnosis ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               type:
 *                 type: string
 *                 example: "CLINICAL"
 *               diagnosisName:
 *                 type: string
 *                 example: "Acute Bronchitis"
 *               icd10Code:
 *                 type: string
 *                 example: "J20.9"
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Diagnosis updated successfully
 *       400:
 *         description: Cannot update diagnosis of a cancelled encounter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Diagnosis not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/diagnoses/:id",
  authenticate,
  requirePermission("DIAGNOSIS_UPDATE"),
  updateDiagnosisController
);

export default router;