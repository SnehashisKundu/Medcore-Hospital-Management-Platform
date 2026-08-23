import { Request, Response } from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "./role.service";
import { AuthRequest } from "../auth/auth.middleware";

export async function createRoleController(
  req: AuthRequest,
  res: Response
) {
  try {
    const role = await createRole({
      name: req.body.name,
      description: req.body.description,
      createdById: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROLE_ALREADY_EXISTS"
    ) {
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

export async function getAllRolesController(
  req: Request,
  res: Response
) {
  try {
    const roles = await getAllRoles();

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get all roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getRoleByIdController(
  req: Request,
  res: Response
) {
  try {
    const role = await getRoleById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: role,
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

    console.error("Get role error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateRoleController(
  req: AuthRequest,
  res: Response
) {
  try {
    const role = await updateRole(
      req.params.id as string,
      {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive,
        updatedById: req.user!.id,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
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
      error.message === "ROLE_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Role already exists",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SYSTEM_ROLE_CANNOT_BE_RENAMED"
    ) {
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

export async function deleteRoleController(
  req: AuthRequest,
  res: Response
) {
  try {
    const role = await deleteRole(
      req.params.id as string,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Role deactivated successfully",
      data: role,
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
      error.message === "SYSTEM_ROLE_CANNOT_BE_DELETED"
    ) {
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