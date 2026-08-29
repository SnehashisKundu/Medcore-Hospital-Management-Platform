"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
const prisma_1 = require("../config/prisma");
function requirePermission(permissionName) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }
            // Platform SUPER_ADMIN bypass
            const isSuperAdmin = req.user.roles.some((item) => item.role === "SUPER_ADMIN");
            if (isSuperAdmin) {
                return next();
            }
            const permission = await prisma_1.prisma.userRole.findFirst({
                where: {
                    userId: req.user.id,
                    role: {
                        rolePermissions: {
                            some: {
                                permission: {
                                    name: permissionName,
                                },
                            },
                        },
                    },
                },
            });
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action",
                });
            }
            next();
        }
        catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
}
