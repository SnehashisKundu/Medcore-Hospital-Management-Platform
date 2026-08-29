"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dpt_controller_1 = require("./dpt.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/hospitals/{hospitalId}/departments:
 *   post:
 *     tags:
 *       - Departments
 *     summary: Create a department
 *     description: Creates a new department within a hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
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
 *                 example: "Department for cardiovascular care."
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Department name and code are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       409:
 *         description: Department code already exists in this hospital
 *       500:
 *         description: Internal server error
 */
router.post("/hospitals/:hospitalId/departments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DEPARTMENT_CREATE"), dpt_controller_1.createDepartmentController);
/**
 * @swagger
 * /api/v1/hospitals/{hospitalId}/departments:
 *   get:
 *     tags:
 *       - Departments
 *     summary: Get departments of a hospital
 *     description: Retrieves all departments belonging to a hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get("/hospitals/:hospitalId/departments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DEPARTMENT_READ"), dpt_controller_1.getDepartmentsController);
/**
 * @swagger
 * /api/v1/hospitals/{hospitalId}/departments/{departmentId}:
 *   get:
 *     tags:
 *       - Departments
 *     summary: Get department by ID
 *     description: Retrieves a specific department belonging to a hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get("/hospitals/:hospitalId/departments/:departmentId", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DEPARTMENT_READ"), dpt_controller_1.getDepartmentByIdController);
/**
 * @swagger
 * /api/v1/hospitals/{hospitalId}/departments/{departmentId}:
 *   patch:
 *     tags:
 *       - Departments
 *     summary: Update a department
 *     description: Updates an existing department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cardiology"
 *               code:
 *                 type: string
 *                 example: "CARD"
 *               description:
 *                 type: string
 *                 example: "Department for cardiovascular care."
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Department not found
 *       409:
 *         description: Department code already exists in this hospital
 *       500:
 *         description: Internal server error
 */
router.patch("/hospitals/:hospitalId/departments/:departmentId", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DEPARTMENT_UPDATE"), dpt_controller_1.updateDepartmentController);
/**
 * @swagger
 * /api/v1/hospitals/{hospitalId}/departments/{departmentId}:
 *   delete:
 *     tags:
 *       - Departments
 *     summary: Delete a department
 *     description: Deletes an existing department from a hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.delete("/hospitals/:hospitalId/departments/:departmentId", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DEPARTMENT_DELETE"), dpt_controller_1.deleteDepartmentController);
exports.default = router;
