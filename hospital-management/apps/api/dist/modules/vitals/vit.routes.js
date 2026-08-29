"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vit_controller_1 = require("./vit.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/vitals:
 *   post:
 *     tags:
 *       - Vitals
 *     summary: Record patient vitals
 *     description: Records vital signs for a patient encounter.
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
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               temperatureCelsius:
 *                 type: number
 *                 format: float
 *                 example: 37.2
 *               pulseRate:
 *                 type: number
 *                 example: 78
 *               oxygenSaturation:
 *                 type: number
 *                 format: float
 *                 example: 98
 *     responses:
 *       201:
 *         description: Vital created successfully
 *       400:
 *         description: Encounter ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Encounter or recorder user not found
 *       500:
 *         description: Internal server error
 */
router.post("/vitals", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("VITALS_CREATE"), vit_controller_1.createVitalController);
/**
 * @swagger
 * /api/v1/vitals:
 *   get:
 *     tags:
 *       - Vitals
 *     summary: Get all vitals
 *     description: Retrieves all recorded vital signs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vitals retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/vitals", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("VITALS_READ"), vit_controller_1.getVitalsController);
/**
 * @swagger
 * /api/v1/vitals/{id}:
 *   get:
 *     tags:
 *       - Vitals
 *     summary: Get vital by ID
 *     description: Retrieves a specific vital record by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vital record ID
 *     responses:
 *       200:
 *         description: Vital retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vital not found
 *       500:
 *         description: Internal server error
 */
router.get("/vitals/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("VITALS_READ"), vit_controller_1.getVitalByIdController);
/**
 * @swagger
 * /api/v1/vitals/{id}:
 *   put:
 *     tags:
 *       - Vitals
 *     summary: Update vital record
 *     description: Updates an existing vital record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vital record ID
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
 *               temperatureCelsius:
 *                 type: number
 *                 format: float
 *                 example: 37.2
 *               pulseRate:
 *                 type: number
 *                 example: 78
 *               oxygenSaturation:
 *                 type: number
 *                 format: float
 *                 example: 98
 *     responses:
 *       200:
 *         description: Vital updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Vital not found
 *       500:
 *         description: Internal server error
 */
router.put("/vitals/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("VITALS_UPDATE"), vit_controller_1.updateVitalController);
exports.default = router;
