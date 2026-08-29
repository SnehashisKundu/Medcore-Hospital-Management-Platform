"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const role_controller_1 = require("./role.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create a role
 *     description: Creates a new role. The authenticated user is recorded as the creator.
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
 *                 example: "PHYSIOTHERAPIST"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Role for physiotherapy staff"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), role_controller_1.createRoleController);
/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     description: Retrieves all roles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), role_controller_1.getAllRolesController);
/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     description: Retrieves a specific role by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), role_controller_1.getRoleByIdController);
/**
 * @swagger
 * /api/v1/roles/{id}:
 *   patch:
 *     tags:
 *       - Roles
 *     summary: Update a role
 *     description: Updates an existing role. System roles cannot be renamed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "PHYSIOTHERAPIST"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated role description"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: System role cannot be renamed or insufficient permissions
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), role_controller_1.updateRoleController);
/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Deactivate a role
 *     description: Deactivates a role. System roles cannot be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: System role cannot be deleted or insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), role_controller_1.deleteRoleController);
exports.default = router;
