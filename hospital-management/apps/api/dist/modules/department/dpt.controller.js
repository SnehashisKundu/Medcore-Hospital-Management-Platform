"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartmentController = createDepartmentController;
exports.getDepartmentsController = getDepartmentsController;
exports.getDepartmentByIdController = getDepartmentByIdController;
exports.updateDepartmentController = updateDepartmentController;
exports.deleteDepartmentController = deleteDepartmentController;
const dpt_service_1 = require("./dpt.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDepartmentController(req, res) {
    try {
        const hospitalId = String(req.params.hospitalId);
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required",
            });
        }
        const department = await (0, dpt_service_1.createDepartment)(hospitalId, req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DEPARTMENT",
            entityId: department.id,
            metadata: {
                name: department.name,
                code: department.code,
                description: department.description,
                isActive: department.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "HOSPITAL_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Hospital not found",
                });
            }
            if (error.message === "DEPARTMENT_CODE_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Department code already exists in this hospital",
                });
            }
        }
        console.error("Create department error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDepartmentsController(req, res) {
    try {
        const hospitalId = String(req.params.hospitalId);
        const departments = await (0, dpt_service_1.getDepartments)(hospitalId);
        return res.status(200).json({
            success: true,
            data: departments,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }
        console.error("Get departments error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDepartmentByIdController(req, res) {
    try {
        const hospitalId = String(req.params.hospitalId);
        const departmentId = String(req.params.departmentId);
        const department = await (0, dpt_service_1.getDepartmentById)(hospitalId, departmentId);
        return res.status(200).json({
            success: true,
            data: department,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DEPARTMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }
        console.error("Get department error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDepartmentController(req, res) {
    try {
        const hospitalId = String(req.params.hospitalId);
        const departmentId = String(req.params.departmentId);
        const { name, code, description } = req.body;
        const updated = await (0, dpt_service_1.updateDepartment)(hospitalId, departmentId, { name, code, description });
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DEPARTMENT",
            entityId: updated.id,
            metadata: {
                name: updated.name,
                code: updated.code,
                description: updated.description,
                isActive: updated.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: updated,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "DEPARTMENT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }
            if (error.message === "DEPARTMENT_CODE_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Department code already exists in this hospital",
                });
            }
        }
        console.error("Update department error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteDepartmentController(req, res) {
    try {
        const hospitalId = String(req.params.hospitalId);
        const departmentId = String(req.params.departmentId);
        const department = await (0, dpt_service_1.deleteDepartment)(hospitalId, departmentId);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "DEPARTMENT",
            entityId: department.id,
            metadata: {
                name: department.name,
                code: department.code,
                description: department.description,
                isActive: department.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DEPARTMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }
        console.error("Delete department error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
