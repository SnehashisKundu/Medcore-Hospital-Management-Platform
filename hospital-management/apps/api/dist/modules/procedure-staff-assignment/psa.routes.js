"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const psa_controller_1 = require("./psa.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/procedure-staff-assignments:
 *   post:
 *     tags:
 *       - Procedure Staff Assignments
 *     summary: Assign staff to a procedure order
 *     description: Assigns a user to a procedure order with a specific staff role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - procedureOrderId
 *               - userId
 *               - role
 *             properties:
 *               procedureOrderId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               role:
 *                 type: string
 *                 enum:
 *                   - PRIMARY_SURGEON
 *                   - ASSISTANT_SURGEON
 *                   - ANESTHETIST
 *                   - NURSE
 *                   - TECHNICIAN
 *                   - OTHER
 *                 example: PRIMARY_SURGEON
 *     responses:
 *       201:
 *         description: Procedure staff assigned successfully
 *       400:
 *         description: Required fields are missing or role is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure order or user not found
 *       409:
 *         description: Staff member is already assigned with this role
 *       500:
 *         description: Internal server error
 */
router.post("/procedure-staff-assignments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_STAFF_ASSIGNMENT_CREATE"), psa_controller_1.createProcedureStaffAssignmentController);
/**
 * @swagger
 * /api/v1/procedure-staff-assignments:
 *   get:
 *     tags:
 *       - Procedure Staff Assignments
 *     summary: Get all procedure staff assignments
 *     description: Retrieves all procedure staff assignments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procedure staff assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/procedure-staff-assignments", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_STAFF_ASSIGNMENT_READ"), psa_controller_1.getProcedureStaffAssignmentsController);
/**
 * @swagger
 * /api/v1/procedure-staff-assignments/{id}:
 *   get:
 *     tags:
 *       - Procedure Staff Assignments
 *     summary: Get procedure staff assignment by ID
 *     description: Retrieves a specific procedure staff assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure staff assignment ID
 *     responses:
 *       200:
 *         description: Procedure staff assignment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure staff assignment not found
 *       500:
 *         description: Internal server error
 */
router.get("/procedure-staff-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_STAFF_ASSIGNMENT_READ"), psa_controller_1.getProcedureStaffAssignmentByIdController);
/**
 * @swagger
 * /api/v1/procedure-staff-assignments/{id}:
 *   put:
 *     tags:
 *       - Procedure Staff Assignments
 *     summary: Update a procedure staff assignment
 *     description: Updates the staff role for an existing procedure staff assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure staff assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - PRIMARY_SURGEON
 *                   - ASSISTANT_SURGEON
 *                   - ANESTHETIST
 *                   - NURSE
 *                   - TECHNICIAN
 *                   - OTHER
 *                 example: ASSISTANT_SURGEON
 *     responses:
 *       200:
 *         description: Procedure staff assignment updated successfully
 *       400:
 *         description: Role is missing or invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure staff assignment not found
 *       409:
 *         description: Staff member is already assigned with this role
 *       500:
 *         description: Internal server error
 */
router.put("/procedure-staff-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_STAFF_ASSIGNMENT_UPDATE"), psa_controller_1.updateProcedureStaffAssignmentController);
/**
 * @swagger
 * /api/v1/procedure-staff-assignments/{id}:
 *   delete:
 *     tags:
 *       - Procedure Staff Assignments
 *     summary: Delete a procedure staff assignment
 *     description: Removes a staff assignment from a procedure order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure staff assignment ID
 *     responses:
 *       200:
 *         description: Procedure staff assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure staff assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/procedure-staff-assignments/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("PROCEDURE_STAFF_ASSIGNMENT_DELETE"), psa_controller_1.deleteProcedureStaffAssignmentController);
exports.default = router;
