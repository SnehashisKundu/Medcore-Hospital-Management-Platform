"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spc_controller_1 = require("./spc.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/specializations:
 *   post:
 *     tags:
 *       - Specializations
 *     summary: Create a specialization
 *     description: Creates a new medical specialization.
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cardiology"
 *               code:
 *                 type: string
 *                 example: "CARD"
 *               description:
 *                 type: string
 *                 example: "Medical specialization focused on the cardiovascular system."
 *     responses:
 *       201:
 *         description: Specialization created successfully
 *       400:
 *         description: Specialization name and code are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Specialization code already exists
 *       500:
 *         description: Internal server error
 */
router.post("/specializations", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("SPECIALIZATION_CREATE"), spc_controller_1.createSpecializationController);
/**
 * @swagger
 * /api/v1/specializations:
 *   get:
 *     tags:
 *       - Specializations
 *     summary: Get all specializations
 *     description: Retrieves all medical specializations.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/specializations", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("SPECIALIZATION_READ"), spc_controller_1.getSpecializationsController);
/**
 * @swagger
 * /api/v1/specializations/{id}:
 *   get:
 *     tags:
 *       - Specializations
 *     summary: Get specialization by ID
 *     description: Retrieves a specific specialization by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Specialization retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Internal server error
 */
router.get("/specializations/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("SPECIALIZATION_READ"), spc_controller_1.getSpecializationByIdController);
exports.default = router;
