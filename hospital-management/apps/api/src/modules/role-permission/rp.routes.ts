import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  assignPermissionToRoleController,
  getAllRolePermissionsController,
  getPermissionsByRoleIdController,
  removePermissionFromRoleController,
} from "./rp.controller";

const router = Router();

router.use(authenticate);

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
router.post(
  "/",
  requirePermission("ROLE_MANAGE"),
  assignPermissionToRoleController
);

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
router.get(
  "/",
  requirePermission("ROLE_MANAGE"),
  getAllRolePermissionsController
);

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
router.get(
  "/role/:roleId",
  requirePermission("ROLE_MANAGE"),
  getPermissionsByRoleIdController
);

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
router.delete(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  removePermissionFromRoleController
);

export default router;