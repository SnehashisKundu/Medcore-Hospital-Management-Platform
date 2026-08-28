import { Router } from "express";

import {
  createClinicalNoteController,
  getClinicalNotesController,
  getClinicalNoteByIdController,
  updateClinicalNoteController,
} from "./cn.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

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
router.post(
  "/clinical-notes",
  authenticate,
  requirePermission("CLINICAL_NOTE_CREATE"),
  createClinicalNoteController
);

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
router.get(
  "/clinical-notes",
  authenticate,
  requirePermission("CLINICAL_NOTE_READ"),
  getClinicalNotesController
);

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
router.get(
  "/clinical-notes/:id",
  authenticate,
  requirePermission("CLINICAL_NOTE_READ"),
  getClinicalNoteByIdController
);

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
router.put(
  "/clinical-notes/:id",
  authenticate,
  requirePermission("CLINICAL_NOTE_UPDATE"),
  updateClinicalNoteController
);

export default router;