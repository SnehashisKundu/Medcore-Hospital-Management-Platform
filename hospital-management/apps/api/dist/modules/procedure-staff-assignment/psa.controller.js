"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcedureStaffAssignmentController = createProcedureStaffAssignmentController;
exports.getProcedureStaffAssignmentsController = getProcedureStaffAssignmentsController;
exports.getProcedureStaffAssignmentByIdController = getProcedureStaffAssignmentByIdController;
exports.updateProcedureStaffAssignmentController = updateProcedureStaffAssignmentController;
exports.deleteProcedureStaffAssignmentController = deleteProcedureStaffAssignmentController;
const psa_service_1 = require("./psa.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createProcedureStaffAssignmentController(req, res) {
    try {
        const body = req.body ?? {};
        const { procedureOrderId, userId, role, } = body;
        if (!procedureOrderId || !userId || !role) {
            return res.status(400).json({
                success: false,
                message: "Procedure order ID, user ID and role are required",
            });
        }
        const normalizedRole = String(role)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
        const validRoles = {
            SURGEON: "PRIMARY_SURGEON",
            PRIMARY_SURGEON: "PRIMARY_SURGEON",
            ASSISTANT_SURGEON: "ASSISTANT_SURGEON",
            ANESTHETIST: "ANESTHETIST",
            NURSE: "NURSE",
            TECHNICIAN: "TECHNICIAN",
            OTHER: "OTHER",
        };
        const resolvedRole = validRoles[normalizedRole];
        if (!resolvedRole) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Use PRIMARY_SURGEON, ASSISTANT_SURGEON, ANESTHETIST, NURSE, TECHNICIAN, or OTHER.",
            });
        }
        const assignment = await (0, psa_service_1.createProcedureStaffAssignment)({
            procedureOrderId,
            userId,
            role: resolvedRole,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: assignment.procedureOrder.encounter.hospitalId,
            action: "CREATE",
            entityType: "PROCEDURE_STAFF_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                procedureOrderId: assignment.procedureOrderId,
                assignedUserId: assignment.userId,
                role: assignment.role,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Procedure staff assigned successfully",
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                PROCEDURE_ORDER_NOT_FOUND: [
                    404,
                    "Procedure order not found",
                ],
                USER_NOT_FOUND: [
                    404,
                    "User not found",
                ],
                STAFF_ALREADY_ASSIGNED: [
                    409,
                    "Staff member is already assigned with this role",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Create procedure staff assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getProcedureStaffAssignmentsController(_req, res) {
    try {
        const assignments = await (0, psa_service_1.getProcedureStaffAssignments)();
        return res.status(200).json({
            success: true,
            data: assignments,
        });
    }
    catch (error) {
        console.error("Get procedure staff assignments error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getProcedureStaffAssignmentByIdController(req, res) {
    try {
        const assignment = await (0, psa_service_1.getProcedureStaffAssignmentById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Procedure staff assignment not found",
            });
        }
        console.error("Get procedure staff assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateProcedureStaffAssignmentController(req, res) {
    try {
        const { role } = req.body ?? {};
        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required",
            });
        }
        const normalizedRole = String(role)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
        const validRoles = {
            SURGEON: "PRIMARY_SURGEON",
            PRIMARY_SURGEON: "PRIMARY_SURGEON",
            ASSISTANT_SURGEON: "ASSISTANT_SURGEON",
            ANESTHETIST: "ANESTHETIST",
            NURSE: "NURSE",
            TECHNICIAN: "TECHNICIAN",
            OTHER: "OTHER",
        };
        const resolvedRole = validRoles[normalizedRole];
        if (!resolvedRole) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Use PRIMARY_SURGEON, ASSISTANT_SURGEON, ANESTHETIST, NURSE, TECHNICIAN, or OTHER.",
            });
        }
        const assignment = await (0, psa_service_1.updateProcedureStaffAssignment)(req.params.id, resolvedRole);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: assignment.procedureOrder.encounter.hospitalId,
            action: "UPDATE",
            entityType: "PROCEDURE_STAFF_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                procedureOrderId: assignment.procedureOrderId,
                assignedUserId: assignment.userId,
                role: assignment.role,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Procedure staff assignment updated successfully",
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND: [
                    404,
                    "Procedure staff assignment not found",
                ],
                STAFF_ALREADY_ASSIGNED: [
                    409,
                    "Staff member is already assigned with this role",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Update procedure staff assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteProcedureStaffAssignmentController(req, res) {
    try {
        const assignment = await (0, psa_service_1.deleteProcedureStaffAssignment)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: assignment.procedureOrder.encounter.hospitalId,
            action: "DELETE",
            entityType: "PROCEDURE_STAFF_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                procedureOrderId: assignment.procedureOrderId,
                assignedUserId: assignment.userId,
                role: assignment.role,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Procedure staff assignment deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Procedure staff assignment not found",
            });
        }
        console.error("Delete procedure staff assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
