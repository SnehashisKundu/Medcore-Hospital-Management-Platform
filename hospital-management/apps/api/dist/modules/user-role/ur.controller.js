"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserRoleController = assignUserRoleController;
exports.getAllUserRolesController = getAllUserRolesController;
exports.getUserRolesByUserIdController = getUserRolesByUserIdController;
exports.removeUserRoleController = removeUserRoleController;
const ur_service_1 = require("./ur.service");
async function assignUserRoleController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { userId, roleId, hospitalId, } = req.body;
        if (!userId || !roleId) {
            return res.status(400).json({
                success: false,
                message: "userId and roleId are required",
            });
        }
        const result = await (0, ur_service_1.assignUserRole)({
            userId,
            roleId,
            hospitalId,
            assignedById: req.user.id,
        });
        return res.status(201).json({
            success: true,
            message: "Role assigned successfully",
            data: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const errorMap = {
                USER_NOT_FOUND: {
                    status: 404,
                    message: "User not found",
                },
                USER_INACTIVE: {
                    status: 400,
                    message: "User is inactive",
                },
                ROLE_NOT_FOUND: {
                    status: 404,
                    message: "Role not found",
                },
                HOSPITAL_NOT_FOUND: {
                    status: 404,
                    message: "Hospital not found",
                },
                HOSPITAL_INACTIVE: {
                    status: 400,
                    message: "Hospital is inactive",
                },
                HOSPITAL_ID_REQUIRED: {
                    status: 400,
                    message: "hospitalId is required for this role",
                },
                SUPER_ADMIN_CANNOT_HAVE_HOSPITAL: {
                    status: 400,
                    message: "SUPER_ADMIN cannot be assigned to a hospital",
                },
                ROLE_ALREADY_ASSIGNED: {
                    status: 409,
                    message: "Role is already assigned to this user",
                },
            };
            const mapped = errorMap[error.message];
            if (mapped) {
                return res.status(mapped.status).json({
                    success: false,
                    message: mapped.message,
                });
            }
        }
        console.error("Assign user role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllUserRolesController(req, res) {
    try {
        const data = await (0, ur_service_1.getAllUserRoles)();
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("Get all user roles error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getUserRolesByUserIdController(req, res) {
    try {
        const { userId } = req.params;
        const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
        if (!normalizedUserId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }
        const data = await (0, ur_service_1.getUserRolesByUserId)(normalizedUserId);
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        console.error("Get user roles error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function removeUserRoleController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { id } = req.params;
        const normalizedId = Array.isArray(id) ? id[0] : id;
        if (!normalizedId) {
            return res.status(400).json({
                success: false,
                message: "id is required",
            });
        }
        const result = await (0, ur_service_1.removeUserRole)(normalizedId, req.user.id);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                id: result.id,
            },
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "USER_ROLE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User role assignment not found",
            });
        }
        console.error("Remove user role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
