import { Request, Response } from "express";

import {
  createProcedureStaffAssignment,
  getProcedureStaffAssignments,
  getProcedureStaffAssignmentById,
  updateProcedureStaffAssignment,
  deleteProcedureStaffAssignment,
} from "./psa.service";

import type {
  ProcedureStaffRole,
} from "../../generated/prisma/client";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createProcedureStaffAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      procedureOrderId,
      userId,
      role,
    } = body;

    if (!procedureOrderId || !userId || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Procedure order ID, user ID and role are required",
      });
    }

    const normalizedRole = String(role)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const validRoles: Record<string, ProcedureStaffRole> = {
      SURGEON: "PRIMARY_SURGEON",
      PRIMARY_SURGEON: "PRIMARY_SURGEON",
      ASSISTANT_SURGEON: "ASSISTANT_SURGEON",
      ANESTHETIST: "ANESTHETIST",
      NURSE: "NURSE",
      TECHNICIAN: "TECHNICIAN",
      OTHER: "OTHER",
    };

    const resolvedRole = validRoles[normalizedRole];

    if (!resolvedRole) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Use PRIMARY_SURGEON, ASSISTANT_SURGEON, ANESTHETIST, NURSE, TECHNICIAN, or OTHER.",
      });
    }

    const assignment =
      await createProcedureStaffAssignment({
        procedureOrderId,
        userId,
        role: resolvedRole,
      });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        assignment.procedureOrder.encounter.hospitalId,
      action: "CREATE",
      entityType: "PROCEDURE_STAFF_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        procedureOrderId:
          assignment.procedureOrderId,
        assignedUserId:
          assignment.userId,
        role: assignment.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Procedure staff assigned successfully",
      data: assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        PROCEDURE_ORDER_NOT_FOUND: [
          404,
          "Procedure order not found",
        ],

        USER_NOT_FOUND: [
          404,
          "User not found",
        ],

        STAFF_ALREADY_ASSIGNED: [
          409,
          "Staff member is already assigned with this role",
        ],
      };

      const response = map[error.message];

      if (response) {
        return res.status(response[0]).json({
          success: false,
          message: response[1],
        });
      }
    }

    console.error(
      "Create procedure staff assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProcedureStaffAssignmentsController(
  _req: Request,
  res: Response
) {
  try {
    const assignments =
      await getProcedureStaffAssignments();

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error(
      "Get procedure staff assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProcedureStaffAssignmentByIdController(
  req: Request,
  res: Response
) {
  try {
    const assignment =
      await getProcedureStaffAssignmentById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Procedure staff assignment not found",
      });
    }

    console.error(
      "Get procedure staff assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateProcedureStaffAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { role } = req.body ?? {};

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const normalizedRole = String(role)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const validRoles: Record<string, ProcedureStaffRole> = {
      SURGEON: "PRIMARY_SURGEON",
      PRIMARY_SURGEON: "PRIMARY_SURGEON",
      ASSISTANT_SURGEON: "ASSISTANT_SURGEON",
      ANESTHETIST: "ANESTHETIST",
      NURSE: "NURSE",
      TECHNICIAN: "TECHNICIAN",
      OTHER: "OTHER",
    };

    const resolvedRole = validRoles[normalizedRole];

    if (!resolvedRole) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Use PRIMARY_SURGEON, ASSISTANT_SURGEON, ANESTHETIST, NURSE, TECHNICIAN, or OTHER.",
      });
    }

    const assignment =
      await updateProcedureStaffAssignment(
        req.params.id as string,
        resolvedRole
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        assignment.procedureOrder.encounter.hospitalId,
      action: "UPDATE",
      entityType: "PROCEDURE_STAFF_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        procedureOrderId:
          assignment.procedureOrderId,
        assignedUserId:
          assignment.userId,
        role: assignment.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Procedure staff assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND: [
          404,
          "Procedure staff assignment not found",
        ],

        STAFF_ALREADY_ASSIGNED: [
          409,
          "Staff member is already assigned with this role",
        ],
      };

      const response = map[error.message];

      if (response) {
        return res.status(response[0]).json({
          success: false,
          message: response[1],
        });
      }
    }

    console.error(
      "Update procedure staff assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteProcedureStaffAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const assignment =
      await deleteProcedureStaffAssignment(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        assignment.procedureOrder.encounter.hospitalId,
      action: "DELETE",
      entityType: "PROCEDURE_STAFF_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        procedureOrderId:
          assignment.procedureOrderId,
        assignedUserId:
          assignment.userId,
        role: assignment.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Procedure staff assignment deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Procedure staff assignment not found",
      });
    }

    console.error(
      "Delete procedure staff assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}