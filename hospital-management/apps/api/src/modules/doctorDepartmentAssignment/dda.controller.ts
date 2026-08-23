import { Request, Response } from "express";

import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "./dda.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      doctorHospitalId,
      departmentId,
      specializationId,
    } = req.body;

    if (
      !doctorHospitalId ||
      !departmentId ||
      !specializationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor hospital ID, department ID and specialization ID are required",
      });
    }

    const assignment = await createAssignment(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId: assignment.doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        doctorHospitalId: assignment.doctorHospitalId,
        departmentId: assignment.departmentId,
        specializationId: assignment.specializationId,
        isPrimary: assignment.isPrimary,
        isActive: assignment.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Doctor department assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor hospital assignment not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_INACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Doctor hospital assignment is inactive",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DEPARTMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this hospital",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SPECIALIZATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ASSIGNMENT_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor is already assigned to this department and specialization",
      });
    }

    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAssignmentsController(
  _req: Request,
  res: Response
) {
  try {
    const assignments = await getAssignments();

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAssignmentByIdController(
  req: Request,
  res: Response
) {
  try {
    const assignment = await getAssignmentById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const assignment = await updateAssignment(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: assignment.doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        doctorHospitalId: assignment.doctorHospitalId,
        departmentId: assignment.departmentId,
        specializationId: assignment.specializationId,
        isPrimary: assignment.isPrimary,
        isActive: assignment.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Doctor department assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteAssignmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const assignment = await deleteAssignment(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId: assignment.doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "DOCTOR_DEPARTMENT_ASSIGNMENT",
      entityId: assignment.id,
      metadata: {
        doctorHospitalId: assignment.doctorHospitalId,
        departmentId: assignment.departmentId,
        specializationId: assignment.specializationId,
        isPrimary: assignment.isPrimary,
        isActive: assignment.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Doctor department assignment deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}