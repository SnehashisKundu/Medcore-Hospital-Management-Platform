"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleController = createRoleController;
exports.getAllRolesController = getAllRolesController;
exports.getRoleByIdController = getRoleByIdController;
exports.updateRoleController = updateRoleController;
exports.deleteRoleController = deleteRoleController;
const role_service_1 = require("./role.service");
async function createRoleController(req, res) {
    try {
        const role = await (0, role_service_1.createRole)({
            name: req.body.name,
            description: req.body.description,
            createdById: req.user.id,
        });
        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROLE_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Role already exists",
            });
        }
        console.error("Create role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllRolesController(req, res) {
    try {
        const roles = await (0, role_service_1.getAllRoles)();
        return res.status(200).json({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        console.error("Get all roles error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getRoleByIdController(req, res) {
    try {
        const role = await (0, role_service_1.getRoleById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: role,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        console.error("Get role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateRoleController(req, res) {
    try {
        const role = await (0, role_service_1.updateRole)(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            isActive: req.body.isActive,
            updatedById: req.user.id,
        });
        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: role,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        if (error instanceof Error &&
            error.message === "ROLE_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Role already exists",
            });
        }
        if (error instanceof Error &&
            error.message === "SYSTEM_ROLE_CANNOT_BE_RENAMED") {
            return res.status(403).json({
                success: false,
                message: "System role cannot be renamed",
            });
        }
        console.error("Update role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteRoleController(req, res) {
    try {
        const role = await (0, role_service_1.deleteRole)(req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            message: "Role deactivated successfully",
            data: role,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        if (error instanceof Error &&
            error.message === "SYSTEM_ROLE_CANNOT_BE_DELETED") {
            return res.status(403).json({
                success: false,
                message: "System role cannot be deleted",
            });
        }
        console.error("Delete role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
