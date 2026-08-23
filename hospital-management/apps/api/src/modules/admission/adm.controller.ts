import { Request, Response } from "express";

import {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
} from "./adm.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createAdmissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      hospitalId,
      patientId,
      encounterId,
      encounter_id,
      admissionNumber,
      reason,
    } = req.body ?? {};

    const resolvedEncounterId =
      encounterId ?? encounter_id ?? undefined;

    if (!hospitalId || !patientId || !admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID, patient ID and admission number are required",
      });
    }

    const admission = await createAdmission({
      hospitalId,
      patientId,
      encounterId: resolvedEncounterId,
      admissionNumber,
      reason,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: admission.hospitalId,
      action: "CREATE",
      entityType: "ADMISSION",
      entityId: admission.id,
      metadata: {
        patientId: admission.patientId,
        encounterId: admission.encounterId,
        admissionNumber: admission.admissionNumber,
        reason: admission.reason,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Admission created successfully",
      data: admission,
    });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<string, { status: number; message: string }> = {
        HOSPITAL_NOT_FOUND: {
          status: 404,
          message: "Hospital not found",
        },
        PATIENT_NOT_FOUND: {
          status: 404,
          message: "Patient not found",
        },
        ENCOUNTER_NOT_FOUND: {
          status: 404,
          message: "Encounter not found",
        },
        ADMISSION_NUMBER_ALREADY_EXISTS: {
          status: 409,
          message: "Admission number already exists in this hospital",
        },
      };

      const knownError = errors[error.message];

      if (knownError) {
        return res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
      }
    }

    console.error("Create admission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAdmissionsController(
  req: Request,
  res: Response
) {
  try {
    const hospitalId =
      typeof req.query.hospitalId === "string"
        ? req.query.hospitalId
        : undefined;

    const patientId =
      typeof req.query.patientId === "string"
        ? req.query.patientId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const admissions = await getAdmissions(
      hospitalId,
      patientId,
      status
    );

    return res.status(200).json({
      success: true,
      data: admissions,
    });
  } catch (error) {
    console.error("Get admissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAdmissionByIdController(
  req: Request,
  res: Response
) {
  try {
    const admission = await getAdmissionById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: admission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ADMISSION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    console.error("Get admission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateAdmissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const admission = await updateAdmission(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: admission.hospitalId,
      action: "UPDATE",
      entityType: "ADMISSION",
      entityId: admission.id,
      metadata: {
        status: admission.status,
        reason: admission.reason,
        dischargedAt: admission.dischargedAt,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Admission updated successfully",
      data: admission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ADMISSION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    console.error("Update admission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteAdmissionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const admission = await deleteAdmission(
      req.params.id as string
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: admission.hospitalId,
      action: "DELETE",
      entityType: "ADMISSION",
      entityId: admission.id,
      metadata: {
        patientId: admission.patientId,
        admissionNumber: admission.admissionNumber,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Admission deleted successfully",
      data: admission,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ADMISSION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Admission not found",
        });
      }

      if (error.message === "ACTIVE_ADMISSION_CANNOT_BE_DELETED") {
        return res.status(400).json({
          success: false,
          message: "Active admission cannot be deleted",
        });
      }
    }

    console.error("Delete admission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}