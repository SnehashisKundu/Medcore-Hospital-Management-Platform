import { Request, Response } from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "./dpt.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDepartmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const hospitalId = String(req.params.hospitalId);
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const department = await createDepartment(
      hospitalId,
      req.body
    );

    // Audit CREATE
    await createAuditLog({
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
  } catch (error) {
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

export async function getDepartmentsController(
  req: Request,
  res: Response
) {
  try {
    const hospitalId = String(req.params.hospitalId);

    const departments = await getDepartments(hospitalId);

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "HOSPITAL_NOT_FOUND"
    ) {
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

export async function getDepartmentByIdController(
  req: Request,
  res: Response
) {
  try {
    const hospitalId = String(req.params.hospitalId);
    const departmentId = String(req.params.departmentId);

    const department = await getDepartmentById(
      hospitalId,
      departmentId
    );

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DEPARTMENT_NOT_FOUND"
    ) {
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

export async function updateDepartmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const hospitalId = String(req.params.hospitalId);
    const departmentId = String(req.params.departmentId);

    const { name, code, description } = req.body;

    const updated = await updateDepartment(
      hospitalId,
      departmentId,
      { name, code, description }
    );

    // Audit UPDATE
    await createAuditLog({
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
  } catch (error) {
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

export async function deleteDepartmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const hospitalId = String(req.params.hospitalId);
    const departmentId = String(req.params.departmentId);

    const department = await deleteDepartment(
      hospitalId,
      departmentId
    );

    // Audit DELETE
    await createAuditLog({
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
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DEPARTMENT_NOT_FOUND"
    ) {
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