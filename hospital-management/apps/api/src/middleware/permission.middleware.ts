import { NextFunction, Response } from "express";
import { AuthRequest } from "../modules/auth/auth.middleware";
import { prisma } from "../config/prisma";

export function requirePermission(permissionName: string) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Platform SUPER_ADMIN bypass
      const isSuperAdmin = req.user.roles.some(
        (item) => item.role === "SUPER_ADMIN"
      );

      if (isSuperAdmin) {
        return next();
      }

      const permission = await prisma.userRole.findFirst({
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
    } catch (error) {
      console.error("Permission check error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}