"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const psc_controller_1 = require("./psc.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/prescriptions:
 *   post:
 *     tags:
 *       - Prescriptions
 *     summary: Create a prescription
 *     description: Creates a prescription with one or more medicines for a patient encounter.
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
 *               - prescribedById
 *               - items
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               prescribedById:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               instructions:
 *                 type: string
 *                 nullable: true
 *                 example: "Take medicines regularly and complete the prescribed course."
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineId
 *                     - dosage
 *                     - frequency
 *                     - duration
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                       format: uuid
 *                       example: "12345678-1234-1234-1234-123456789014"
 *                     dosage:
 *                       type: string
 *                       example: "500 mg"
 *                     frequency:
 *                       type: string
 *                       example: "TWICE_DAILY"
 *                     duration:
 *                       type: string
 *                       example: "5 days"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 10
 *                     timing:
 *                       type: string
 *                       example: "AFTER_FOOD"
 *                       enum:
 *                         - BEFORE_FOOD
 *                         - AFTER_FOOD
 *                         - WITH_FOOD
 *                         - ANYTIME
 *                     route:
 *                       type: string
 *                       example: "ORAL"
 *                       enum:
 *                         - ORAL
 *                         - IV
 *                         - IM
 *                         - TOPICAL
 *                         - INHALATION
 *                         - EYE_DROP
 *                         - EAR_DROP
 *                         - OTHER
 *                     remarks:
 *                       type: string
 *                       example: "Take with water."
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid prescription data, missing items, invalid medicine details, invalid quantity, timing, route, duplicate medicine, or cancelled encounter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter, prescriber, or medicine not found
 *       500:
 *         description: Internal server error
 */
router.post("/prescriptions", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PRESCRIPTION_CREATE"), psc_controller_1.createPrescriptionController);
/**
 * @swagger
 * /api/v1/prescriptions:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: Get all prescriptions
 *     description: Retrieves all prescriptions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/prescriptions", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PRESCRIPTION_READ"), psc_controller_1.getPrescriptionsController);
/**
 * @swagger
 * /api/v1/prescriptions/{id}/pdf:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: Download prescription PDF
 *     description: Generates and downloads a prescription as a PDF document.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid prescription ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Internal server error
 */
router.get("/prescriptions/:id/pdf", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PRESCRIPTION_READ"), psc_controller_1.downloadPrescriptionPdfController);
/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: Get prescription by ID
 *     description: Retrieves a specific prescription by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription retrieved successfully
 *       400:
 *         description: Invalid prescription ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Internal server error
 */
router.get("/prescriptions/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PRESCRIPTION_READ"), psc_controller_1.getPrescriptionByIdController);
/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   put:
 *     tags:
 *       - Prescriptions
 *     summary: Update prescription
 *     description: Updates an active prescription. Manual status changes are limited to CANCELLED.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instructions:
 *                 type: string
 *                 nullable: true
 *                 example: "Take medicines after meals."
 *               status:
 *                 type: string
 *                 enum:
 *                   - CANCELLED
 *                 example: "CANCELLED"
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       400:
 *         description: Invalid update, cancelled prescription, inactive prescription, invalid status transition, or empty update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Internal server error
 */
router.put("/prescriptions/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PRESCRIPTION_UPDATE"), psc_controller_1.updatePrescriptionController);
exports.default = router;
