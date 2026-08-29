"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alg_controller_1 = require("./alg.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/allergies:
 *   post:
 *     tags:
 *       - Allergies
 *     summary: Create a patient allergy
 *     description: Creates a new allergy record for a patient.
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
 *               - allergen
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 example: "5968fdae-3097-4ed7-8b8c-231f6650c664"
 *               allergen:
 *                 type: string
 *                 example: "Penicillin"
 *               severity:
 *                 type: string
 *                 example: "SEVERE"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Allergy created successfully
 *       400:
 *         description: Patient ID and allergen are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.post("/allergies", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), alg_controller_1.createAllergyController);
/**
 * @swagger
 * /api/v1/allergies:
 *   get:
 *     tags:
 *       - Allergies
 *     summary: Get all allergies
 *     description: Retrieves all patient allergy records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Allergies retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/allergies", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), alg_controller_1.getAllergiesController);
/**
 * @swagger
 * /api/v1/allergies/{id}:
 *   get:
 *     tags:
 *       - Allergies
 *     summary: Get allergy by ID
 *     description: Retrieves a specific allergy record by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allergy ID
 *     responses:
 *       200:
 *         description: Allergy retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Allergy not found
 *       500:
 *         description: Internal server error
 */
router.get("/allergies/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_READ"), alg_controller_1.getAllergyByIdController);
/**
 * @swagger
 * /api/v1/allergies/{id}:
 *   put:
 *     tags:
 *       - Allergies
 *     summary: Update a patient allergy
 *     description: Updates an existing allergy record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allergy ID
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
 *                 example: "5968fdae-3097-4ed7-8b8c-231f6650c664"
 *               allergen:
 *                 type: string
 *                 example: "Penicillin"
 *               severity:
 *                 type: string
 *                 example: "SEVERE"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Allergy updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Allergy not found
 *       500:
 *         description: Internal server error
 */
router.put("/allergies/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), alg_controller_1.updateAllergyController);
/**
 * @swagger
 * /api/v1/allergies/{id}:
 *   delete:
 *     tags:
 *       - Allergies
 *     summary: Delete a patient allergy
 *     description: Deletes an existing allergy record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allergy ID
 *     responses:
 *       200:
 *         description: Allergy deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Allergy not found
 *       500:
 *         description: Internal server error
 */
router.delete("/allergies/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PATIENT_UPDATE"), alg_controller_1.deleteAllergyController);
exports.default = router;
