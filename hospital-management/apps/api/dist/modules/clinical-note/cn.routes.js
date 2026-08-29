"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cn_controller_1 = require("./cn.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/clinical-notes:
 *   post:
 *     tags:
 *       - Clinical Notes
 *     summary: Create a clinical note
 *     description: Creates a clinical note for a patient encounter.
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
 *               - createdById
 *               - noteType
 *               - content
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               createdById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               noteType:
 *                 type: string
 *                 example: "PROGRESS_NOTE"
 *               content:
 *                 type: string
 *                 example: "Patient reports improvement in symptoms. Continue current treatment."
 *     responses:
 *       201:
 *         description: Clinical note created successfully
 *       400:
 *         description: Required fields are missing or encounter is cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter or creator user not found
 *       500:
 *         description: Internal server error
 */
router.post("/clinical-notes", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("CLINICAL_NOTE_CREATE"), cn_controller_1.createClinicalNoteController);
/**
 * @swagger
 * /api/v1/clinical-notes:
 *   get:
 *     tags:
 *       - Clinical Notes
 *     summary: Get all clinical notes
 *     description: Retrieves all clinical notes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clinical notes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/clinical-notes", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("CLINICAL_NOTE_READ"), cn_controller_1.getClinicalNotesController);
/**
 * @swagger
 * /api/v1/clinical-notes/{id}:
 *   get:
 *     tags:
 *       - Clinical Notes
 *     summary: Get clinical note by ID
 *     description: Retrieves a specific clinical note by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Clinical note ID
 *     responses:
 *       200:
 *         description: Clinical note retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Clinical note not found
 *       500:
 *         description: Internal server error
 */
router.get("/clinical-notes/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("CLINICAL_NOTE_READ"), cn_controller_1.getClinicalNoteByIdController);
/**
 * @swagger
 * /api/v1/clinical-notes/{id}:
 *   put:
 *     tags:
 *       - Clinical Notes
 *     summary: Update clinical note
 *     description: Updates an existing clinical note.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Clinical note ID
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
 *               createdById:
 *                 type: string
 *                 format: uuid
 *               noteType:
 *                 type: string
 *                 example: "PROGRESS_NOTE"
 *               content:
 *                 type: string
 *                 example: "Patient is stable and responding well to treatment."
 *     responses:
 *       200:
 *         description: Clinical note updated successfully
 *       400:
 *         description: Cannot update clinical note of a cancelled encounter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Clinical note not found
 *       500:
 *         description: Internal server error
 */
router.put("/clinical-notes/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("CLINICAL_NOTE_UPDATE"), cn_controller_1.updateClinicalNoteController);
exports.default = router;
