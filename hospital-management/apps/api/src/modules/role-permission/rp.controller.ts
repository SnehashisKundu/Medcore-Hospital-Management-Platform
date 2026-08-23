import { Request, Response } from "express";
import {
  assignPermissionToRole,
  getAllRolePermissions,
  getPermissionsByRoleId,
  removePermissionFromRole,
} from "./rp.service";
import { AuthRequest } from "../auth/auth.middleware";

export async function assignPermissionToRoleController(
  req: AuthRequest,
  res: Response
) {
  try {
    const rolePermission = await assignPermissionToRole({
      roleId: req.body.roleId,
      permissionId: req.body.permissionId,
      assignedById: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      message: "Permission assigned to role successfully",
      data: rolePermission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROLE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PERMISSION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ROLE_PERMISSION_ALREADY_EXISTS"
    ) {
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

export async function getAllRolePermissionsController(
  _req: Request,
  res: Response
) {
  try {
    const rolePermissions = await getAllRolePermissions();

    return res.status(200).json({
      success: true,
      data: rolePermissions,
    });
  } catch (error) {
    console.error("Get all role permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPermissionsByRoleIdController(
  req: Request,
  res: Response
) {
  try {
    const rolePermissions = await getPermissionsByRoleId(
      req.params.roleId as string
    );

    return res.status(200).json({
      success: true,
      data: rolePermissions,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROLE_NOT_FOUND"
    ) {
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

export async function removePermissionFromRoleController(
  req: AuthRequest,
  res: Response
) {
  try {
    const rolePermission = await removePermissionFromRole(
      req.params.id as string,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Permission removed from role successfully",
      data: {
        id: rolePermission.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROLE_PERMISSION_NOT_FOUND"
    ) {
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