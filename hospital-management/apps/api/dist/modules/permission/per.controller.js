"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPermissionController = createPermissionController;
exports.getPermissionsController = getPermissionsController;
exports.getPermissionByIdController = getPermissionByIdController;
exports.updatePermissionController = updatePermissionController;
exports.deletePermissionController = deletePermissionController;
const per_service_1 = require("./per.service");
async function createPermissionController(req, res) {
    try {
        const permission = await (0, per_service_1.createPermission)({
            name: req.body.name,
            description: req.body.description,
        });
        await (0, per_service_1.logPermissionAudit)(req.user.id, "CREATE", permission);
        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PERMISSION_NAME_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Permission name already exists",
            });
        }
        console.error("Create permission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPermissionsController(_req, res) {
    try {
        const permissions = await (0, per_service_1.getPermissions)();
        return res.status(200).json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        console.error("Get permissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPermissionByIdController(req, res) {
    try {
        const permission = await (0, per_service_1.getPermissionById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: permission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PERMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }
        console.error("Get permission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updatePermissionController(req, res) {
    try {
        const permission = await (0, per_service_1.updatePermission)(req.params.id, {
            name: req.body.name,
            description: req.body.description,
        });
        await (0, per_service_1.logPermissionAudit)(req.user.id, "UPDATE", permission);
        return res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: permission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PERMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }
        if (error instanceof Error &&
            error.message === "PERMISSION_NAME_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Permission name already exists",
            });
        }
        console.error("Update permission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deletePermissionController(req, res) {
    try {
        const permission = await (0, per_service_1.deletePermission)(req.params.id);
        await (0, per_service_1.logPermissionAudit)(req.user.id, "DELETE", permission);
        return res.status(200).json({
            success: true,
            message: "Permission deleted successfully",
            data: permission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PERMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }
        if (error instanceof Error &&
            error.message === "PERMISSION_ASSIGNED_TO_ROLE") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete permission because it is assigned to one or more roles",
            });
        }
        console.error("Delete permission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
