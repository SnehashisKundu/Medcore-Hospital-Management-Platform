"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mth_controller_1 = require("./mth.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/medication-history:
 *   post:
 *     tags:
 *       - Medication History
 *     summary: Create medication history
 *     description: Creates a medication history record for a patient.
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
 *               - medicineName
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               medicineName:
 *                 type: string
 *                 example: "Paracetamol 500mg"
 *     responses:
 *       201:
 *         description: Medication history created successfully
 *       400:
 *         description: Patient ID or medicine name is missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.post("/medication-history", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), mth_controller_1.createMedicationHistoryController);
/**
 * @swagger
 * /api/v1/medication-history:
 *   get:
 *     tags:
 *       - Medication History
 *     summary: Get all medication histories
 *     description: Retrieves all patient medication history records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medication histories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/medication-history", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), mth_controller_1.getMedicationHistoriesController);
/**
 * @swagger
 * /api/v1/medication-history/{id}:
 *   get:
 *     tags:
 *       - Medication History
 *     summary: Get medication history by ID
 *     description: Retrieves a specific medication history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medication history ID
 *     responses:
 *       200:
 *         description: Medication history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medication history not found
 *       500:
 *         description: Internal server error
 */
router.get("/medication-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), mth_controller_1.getMedicationHistoryByIdController);
/**
 * @swagger
 * /api/v1/medication-history/{id}:
 *   put:
 *     tags:
 *       - Medication History
 *     summary: Update medication history
 *     description: Updates an existing medication history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medication history ID
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
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               medicineName:
 *                 type: string
 *                 example: "Paracetamol 650mg"
 *     responses:
 *       200:
 *         description: Medication history updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient or medication history not found
 *       500:
 *         description: Internal server error
 */
router.put("/medication-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), mth_controller_1.updateMedicationHistoryController);
/**
 * @swagger
 * /api/v1/medication-history/{id}:
 *   delete:
 *     tags:
 *       - Medication History
 *     summary: Delete medication history
 *     description: Deletes an existing medication history record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medication history ID
 *     responses:
 *       200:
 *         description: Medication history deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medication history not found
 *       500:
 *         description: Internal server error
 */
router.delete("/medication-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), mth_controller_1.deleteMedicationHistoryController);
exports.default = router;
