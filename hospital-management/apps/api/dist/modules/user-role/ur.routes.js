"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const ur_controller_1 = require("./ur.controller");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/v1/user-roles:
 *   post:
 *     tags:
 *       - User Roles
 *     summary: Assign a role to a user
 *     description: Assigns a role to a user, optionally scoped to a hospital. SUPER_ADMIN cannot be assigned to a hospital.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "12345678-1234-1234-1234-123456789014"
 *     responses:
 *       201:
 *         description: Role assigned successfully
 *       400:
 *         description: Invalid role assignment, inactive user/hospital, missing hospital ID, or SUPER_ADMIN assigned to a hospital
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User, role, or hospital not found
 *       409:
 *         description: Role is already assigned to the user
 *       500:
 *         description: Internal server error
 */
router.post("/", (0, permission_middleware_1.requirePermission)("USER_ROLE_ASSIGN"), ur_controller_1.assignUserRoleController);
/**
 * @swagger
 * /api/v1/user-roles:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Get all user role assignments
 *     description: Retrieves all user-role assignments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", (0, permission_middleware_1.requirePermission)("USER_ROLE_READ"), ur_controller_1.getAllUserRolesController);
/**
 * @swagger
 * /api/v1/user-roles/user/{userId}:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Get roles assigned to a user
 *     description: Retrieves all roles assigned to a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/user/:userId", (0, permission_middleware_1.requirePermission)("USER_ROLE_READ"), ur_controller_1.getUserRolesByUserIdController);
/**
 * @swagger
 * /api/v1/user-roles/{id}:
 *   delete:
 *     tags:
 *       - User Roles
 *     summary: Remove a user role assignment
 *     description: Removes an existing role assignment from a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User role assignment ID
 *     responses:
 *       200:
 *         description: User role assignment removed successfully
 *       400:
 *         description: User role assignment ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User role assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", (0, permission_middleware_1.requirePermission)("USER_ROLE_REMOVE"), ur_controller_1.removeUserRoleController);
exports.default = router;
