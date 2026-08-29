"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const rp_controller_1 = require("./rp.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/v1/role-permissions:
 *   post:
 *     tags:
 *       - Role Permissions
 *     summary: Assign a permission to a role
 *     description: Assigns an existing permission to an existing role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               permissionId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *     responses:
 *       201:
 *         description: Permission assigned to role successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role or permission not found
 *       409:
 *         description: Permission is already assigned to this role
 *       500:
 *         description: Internal server error
 */
router.post("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), rp_controller_1.assignPermissionToRoleController);
/**
 * @swagger
 * /api/v1/role-permissions:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get all role permissions
 *     description: Retrieves all role-permission mappings.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), rp_controller_1.getAllRolePermissionsController);
/**
 * @swagger
 * /api/v1/role-permissions/role/{roleId}:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get permissions assigned to a role
 *     description: Retrieves all permissions assigned to a specific role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get("/role/:roleId", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), rp_controller_1.getPermissionsByRoleIdController);
/**
 * @swagger
 * /api/v1/role-permissions/{id}:
 *   delete:
 *     tags:
 *       - Role Permissions
 *     summary: Remove a permission from a role
 *     description: Removes an existing role-permission mapping.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role-permission mapping ID
 *     responses:
 *       200:
 *         description: Permission removed from role successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role permission mapping not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGE"), rp_controller_1.removePermissionFromRoleController);
exports.default = router;
