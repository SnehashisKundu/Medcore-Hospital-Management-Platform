"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enc_controller_1 = require("./enc.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/encounters:
 *   post:
 *     tags:
 *       - Encounters
 *     summary: Create an encounter
 *     description: Creates a new patient encounter.
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
 *               - encounterNumber
 *               - consultationType
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "940a1c09-55d7-4a14-8734-d31b2dbb444a"
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "5968fdae-3097-4ed7-8b8c-231f6650c664"
 *               encounterNumber:
 *                 type: string
 *                 example: "ENC-2026-001"
 *               consultationType:
 *                 type: string
 *                 example: "GENERAL_CONSULTATION"
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               emergencyCaseId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *     responses:
 *       201:
 *         description: Encounter created successfully
 *       400:
 *         description: Required encounter fields are missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital, patient, appointment, doctor, or department assignment not found
 *       409:
 *         description: Encounter already exists or encounter number already exists
 *       500:
 *         description: Internal server error
 */
router.post("/encounters", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ENCOUNTER_CREATE"), enc_controller_1.createEncounterController);
/**
 * @swagger
 * /api/v1/encounters:
 *   get:
 *     tags:
 *       - Encounters
 *     summary: Get all encounters
 *     description: Retrieves all patient encounters.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Encounters retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/encounters", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ENCOUNTER_READ"), enc_controller_1.getEncountersController);
/**
 * @swagger
 * /api/v1/encounters/{id}:
 *   get:
 *     tags:
 *       - Encounters
 *     summary: Get encounter by ID
 *     description: Retrieves an encounter using its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Encounter ID
 *     responses:
 *       200:
 *         description: Encounter retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter not found
 *       500:
 *         description: Internal server error
 */
router.get("/encounters/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ENCOUNTER_READ"), enc_controller_1.getEncounterByIdController);
/**
 * @swagger
 * /api/v1/encounters/{id}:
 *   put:
 *     tags:
 *       - Encounters
 *     summary: Update encounter
 *     description: Updates an existing patient encounter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Encounter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encounterNumber:
 *                 type: string
 *                 example: "ENC-2026-001"
 *               consultationType:
 *                 type: string
 *                 example: "GENERAL_CONSULTATION"
 *               status:
 *                 type: string
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Encounter updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter not found
 *       500:
 *         description: Internal server error
 */
router.put("/encounters/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ENCOUNTER_UPDATE"), enc_controller_1.updateEncounterController);
/**
 * @swagger
 * /api/v1/encounters/{id}:
 *   delete:
 *     tags:
 *       - Encounters
 *     summary: Delete encounter
 *     description: Cancels an existing patient encounter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Encounter ID
 *     responses:
 *       200:
 *         description: Encounter cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter not found
 *       500:
 *         description: Internal server error
 */
router.delete("/encounters/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("ENCOUNTER_DELETE"), enc_controller_1.deleteEncounterController);
exports.default = router;
