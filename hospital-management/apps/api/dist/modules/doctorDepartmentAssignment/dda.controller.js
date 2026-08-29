"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignmentController = createAssignmentController;
exports.getAssignmentsController = getAssignmentsController;
exports.getAssignmentByIdController = getAssignmentByIdController;
exports.updateAssignmentController = updateAssignmentController;
exports.deleteAssignmentController = deleteAssignmentController;
const dda_service_1 = require("./dda.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createAssignmentController(req, res) {
    try {
        const { doctorHospitalId, departmentId, specializationId, } = req.body;
        if (!doctorHospitalId ||
            !departmentId ||
            !specializationId) {
            return res.status(400).json({
                success: false,
                message: "Doctor hospital ID, department ID and specialization ID are required",
            });
        }
        const assignment = await (0, dda_service_1.createAssignment)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: assignment.doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                doctorHospitalId: assignment.doctorHospitalId,
                departmentId: assignment.departmentId,
                specializationId: assignment.specializationId,
                isPrimary: assignment.isPrimary,
                isActive: assignment.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Doctor department assignment created successfully",
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor hospital assignment not found",
            });
        }
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Doctor hospital assignment is inactive",
            });
        }
        if (error instanceof Error &&
            error.message === "DEPARTMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Department not found for this hospital",
            });
        }
        if (error instanceof Error &&
            error.message === "SPECIALIZATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Specialization not found",
            });
        }
        if (error instanceof Error &&
            error.message === "ASSIGNMENT_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Doctor is already assigned to this department and specialization",
            });
        }
        console.error("Create assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAssignmentsController(_req, res) {
    try {
        const assignments = await (0, dda_service_1.getAssignments)();
        return res.status(200).json({
            success: true,
            data: assignments,
        });
    }
    catch (error) {
        console.error("Get assignments error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAssignmentByIdController(req, res) {
    try {
        const assignment = await (0, dda_service_1.getAssignmentById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }
        console.error("Get assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateAssignmentController(req, res) {
    try {
        const assignment = await (0, dda_service_1.updateAssignment)(req.params.id, req.body);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: assignment.doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                doctorHospitalId: assignment.doctorHospitalId,
                departmentId: assignment.departmentId,
                specializationId: assignment.specializationId,
                isPrimary: assignment.isPrimary,
                isActive: assignment.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor department assignment updated successfully",
            data: assignment,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }
        console.error("Update assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteAssignmentController(req, res) {
    try {
        const assignment = await (0, dda_service_1.deleteAssignment)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: assignment.doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
            entityId: assignment.id,
            metadata: {
                doctorHospitalId: assignment.doctorHospitalId,
                departmentId: assignment.departmentId,
                specializationId: assignment.specializationId,
                isPrimary: assignment.isPrimary,
                isActive: assignment.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor department assignment deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }
        console.error("Delete assignment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
