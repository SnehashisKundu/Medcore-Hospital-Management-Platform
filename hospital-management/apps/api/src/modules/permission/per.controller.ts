import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";

import {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  logPermissionAudit,
} from "./per.service";

export async function createPermissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const permission = await createPermission({
      name: req.body.name,
      description: req.body.description,
    });

    await logPermissionAudit(
      req.user!.id,
      "CREATE",
      permission
    );

    return res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PERMISSION_NAME_EXISTS"
    ) {
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

export async function getPermissionsController(
  _req: Request,
  res: Response
) {
  try {
    const permissions = await getPermissions();

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Get permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPermissionByIdController(
  req: Request,
  res: Response
) {
  try {
    const permission = await getPermissionById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PERMISSION_NOT_FOUND"
    ) {
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

export async function updatePermissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const permission = await updatePermission(
      req.params.id as string,
      {
        name: req.body.name,
        description: req.body.description,
      }
    );

    await logPermissionAudit(
      req.user!.id,
      "UPDATE",
      permission
    );

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: permission,
    });
  } catch (error) {
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
      error.message === "PERMISSION_NAME_EXISTS"
    ) {
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

export async function deletePermissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const permission = await deletePermission(
      req.params.id as string
    );

    await logPermissionAudit(
      req.user!.id,
      "DELETE",
      permission
    );

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
      data: permission,
    });
  } catch (error) {
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
      error.message === "PERMISSION_ASSIGNED_TO_ROLE"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete permission because it is assigned to one or more roles",
      });
    }

    console.error("Delete permission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}