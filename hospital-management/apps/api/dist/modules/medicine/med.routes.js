"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const med_controller_1 = require("./med.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/medicines:
 *   post:
 *     tags:
 *       - Medicines
 *     summary: Create a medicine
 *     description: Creates a new medicine in the medicine catalogue.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - strength
 *               - dosageForm
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paracetamol"
 *               genericName:
 *                 type: string
 *                 example: "Acetaminophen"
 *               strength:
 *                 type: string
 *                 example: "500 mg"
 *               dosageForm:
 *                 type: string
 *                 example: "TABLET"
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       400:
 *         description: Name, strength and dosage form are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Medicine already exists
 *       500:
 *         description: Internal server error
 */
router.post("/medicines", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_CREATE"), med_controller_1.createMedicineController);
/**
 * @swagger
 * /api/v1/medicines:
 *   get:
 *     tags:
 *       - Medicines
 *     summary: Get all medicines
 *     description: Retrieves all medicines from the medicine catalogue.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicines retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/medicines", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_READ"), med_controller_1.getMedicinesController);
/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   get:
 *     tags:
 *       - Medicines
 *     summary: Get medicine by ID
 *     description: Retrieves a specific medicine using its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine not found
 *       500:
 *         description: Internal server error
 */
router.get("/medicines/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_READ"), med_controller_1.getMedicineByIdController);
/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   put:
 *     tags:
 *       - Medicines
 *     summary: Update medicine
 *     description: Updates an existing medicine.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medicine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paracetamol"
 *               genericName:
 *                 type: string
 *                 example: "Acetaminophen"
 *               strength:
 *                 type: string
 *                 example: "500 mg"
 *               dosageForm:
 *                 type: string
 *                 example: "TABLET"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine not found
 *       409:
 *         description: Medicine already exists
 *       500:
 *         description: Internal server error
 */
router.put("/medicines/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("MEDICINE_UPDATE"), med_controller_1.updateMedicineController);
exports.default = router;
