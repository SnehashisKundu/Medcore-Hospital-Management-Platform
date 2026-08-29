"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPermissionToRoleController = assignPermissionToRoleController;
exports.getAllRolePermissionsController = getAllRolePermissionsController;
exports.getPermissionsByRoleIdController = getPermissionsByRoleIdController;
exports.removePermissionFromRoleController = removePermissionFromRoleController;
const rp_service_1 = require("./rp.service");
async function assignPermissionToRoleController(req, res) {
    try {
        const rolePermission = await (0, rp_service_1.assignPermissionToRole)({
            roleId: req.body.roleId,
            permissionId: req.body.permissionId,
            assignedById: req.user.id,
        });
        return res.status(201).json({
            success: true,
            message: "Permission assigned to role successfully",
            data: rolePermission,
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
            error.message === "PERMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }
        if (error instanceof Error &&
            error.message === "ROLE_PERMISSION_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Permission is already assigned to this role",
            });
        }
        console.error("Assign permission to role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllRolePermissionsController(_req, res) {
    try {
        const rolePermissions = await (0, rp_service_1.getAllRolePermissions)();
        return res.status(200).json({
            success: true,
            data: rolePermissions,
        });
    }
    catch (error) {
        console.error("Get all role permissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPermissionsByRoleIdController(req, res) {
    try {
        const rolePermissions = await (0, rp_service_1.getPermissionsByRoleId)(req.params.roleId);
        return res.status(200).json({
            success: true,
            data: rolePermissions,
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
        console.error("Get role permissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function removePermissionFromRoleController(req, res) {
    try {
        const rolePermission = await (0, rp_service_1.removePermissionFromRole)(req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            message: "Permission removed from role successfully",
            data: {
                id: rolePermission.id,
            },
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROLE_PERMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role permission mapping not found",
            });
        }
        console.error("Remove permission from role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
