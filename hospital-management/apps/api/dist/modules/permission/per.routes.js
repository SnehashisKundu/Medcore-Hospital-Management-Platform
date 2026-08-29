"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const per_controller_1 = require("./per.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Create a permission
 *     description: Creates a new permission.
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "PATIENT_READ"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Allows reading patient records"
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Permission name already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), per_controller_1.createPermissionController);
/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get all permissions
 *     description: Retrieves all permissions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), per_controller_1.getPermissionsController);
/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permission by ID
 *     description: Retrieves a specific permission by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), per_controller_1.getPermissionByIdController);
/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   patch:
 *     tags:
 *       - Permissions
 *     summary: Update a permission
 *     description: Updates an existing permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "PATIENT_READ"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Allows reading patient records"
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Permission name already exists
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), per_controller_1.updatePermissionController);
/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   delete:
 *     tags:
 *       - Permissions
 *     summary: Delete a permission
 *     description: Deletes a permission that is not assigned to any role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Permission is assigned to one or more roles
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), per_controller_1.deletePermissionController);
exports.default = router;
