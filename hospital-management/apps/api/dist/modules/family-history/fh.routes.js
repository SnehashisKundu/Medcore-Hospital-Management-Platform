"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fh_controller_1 = require("./fh.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
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
router.post("/family-history", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), fh_controller_1.createFamilyHistoryController);
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
router.get("/family-history", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), fh_controller_1.getFamilyHistoriesController);
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
router.get("/family-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), fh_controller_1.getFamilyHistoryByIdController);
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
router.put("/family-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), fh_controller_1.updateFamilyHistoryController);
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
router.delete("/family-history/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), fh_controller_1.deleteFamilyHistoryController);
exports.default = router;
