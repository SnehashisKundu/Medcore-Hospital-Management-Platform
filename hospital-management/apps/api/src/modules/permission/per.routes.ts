import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  createPermissionController,
  getPermissionsController,
  getPermissionByIdController,
  updatePermissionController,
  deletePermissionController,
} from "./per.controller";

const router = Router();

router.use(authenticate);

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
router.post(
  "/",
  requirePermission("ROLE_MANAGE"),
  createPermissionController
);

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
router.get(
  "/",
  requirePermission("ROLE_MANAGE"),
  getPermissionsController
);

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
router.get(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  getPermissionByIdController
);

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
router.patch(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  updatePermissionController
);

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
router.delete(
  "/:id",
  requirePermission("ROLE_MANAGE"),
  deletePermissionController
);

export default router;