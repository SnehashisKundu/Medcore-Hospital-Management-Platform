import { Router } from "express";

import {
  createFamilyHistoryController,
  getFamilyHistoriesController,
  getFamilyHistoryByIdController,
  updateFamilyHistoryController,
  deleteFamilyHistoryController,
} from "./fh.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/family-history:
 *   post:
 *     tags:
 *       - Family History
 *     summary: Create family history
 *     description: Creates a family history record for a patient.
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
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               diabetes:
 *                 type: boolean
 *                 example: true
 *               hypertension:
 *                 type: boolean
 *                 example: false
 *               cancer:
 *                 type: boolean
 *                 example: false
 *               cardiac:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Family history created successfully
 *       400:
 *         description: Patient ID is required
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
  "/family-history",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  createFamilyHistoryController
);

/**
 * @swagger
 * /api/v1/family-history:
 *   get:
 *     tags:
 *       - Family History
 *     summary: Get all family histories
 *     description: Retrieves all patient family history records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family histories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/family-history",
  authenticate,
  requirePermission("PATIENT_READ"),
  getFamilyHistoriesController
);

/**
 * @swagger
 * /api/v1/family-history/{id}:
 *   get:
 *     tags:
 *       - Family History
 *     summary: Get family history by ID
 *     description: Retrieves a specific patient family history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family history ID
 *     responses:
 *       200:
 *         description: Family history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Family history not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_READ"),
  getFamilyHistoryByIdController
);

/**
 * @swagger
 * /api/v1/family-history/{id}:
 *   put:
 *     tags:
 *       - Family History
 *     summary: Update family history
 *     description: Updates an existing patient family history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family history ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               diabetes:
 *                 type: boolean
 *                 example: true
 *               hypertension:
 *                 type: boolean
 *                 example: false
 *               cancer:
 *                 type: boolean
 *                 example: false
 *               cardiac:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Family history updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient or family history not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  updateFamilyHistoryController
);

/**
 * @swagger
 * /api/v1/family-history/{id}:
 *   delete:
 *     tags:
 *       - Family History
 *     summary: Delete family history
 *     description: Deletes an existing patient family history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family history ID
 *     responses:
 *       200:
 *         description: Family history deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Family history not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/family-history/:id",
  authenticate,
  requirePermission("PATIENT_UPDATE"),
  deleteFamilyHistoryController
);

export default router;