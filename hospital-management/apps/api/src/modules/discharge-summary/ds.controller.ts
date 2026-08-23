import { Request, Response } from "express";

import {
  createDischargeSummary,
  getDischargeSummaries,
  getDischargeSummaryById,
} from "./ds.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDischargeSummaryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      admissionId,
      finalDiagnosis,
      hospitalCourse,
      conditionAtDischarge,
      dischargeAdvice,
      dietAdvice,
      activityAdvice,
      followUpDate,
    } = body;

    if (!admissionId) {
      return res.status(400).json({
        success: false,
        message: "Admission ID is required",
      });
    }

    if (
      followUpDate !== undefined &&
      Number.isNaN(
        new Date(followUpDate).getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Follow-up date must be valid",
      });
    }

    const dischargeSummary =
      await createDischargeSummary({
        admissionId,
        preparedById: req.user!.id,
        finalDiagnosis,
        hospitalCourse,
        conditionAtDischarge,
        dischargeAdvice,
        dietAdvice,
        activityAdvice,
        followUpDate,
      });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: dischargeSummary!.admission.hospitalId,
      action: "CREATE",
      entityType: "DISCHARGE_SUMMARY",
      entityId: dischargeSummary!.id,
      metadata: {
        admissionId,
        admissionNumber:
          dischargeSummary!.admission.admissionNumber,
        patientId:
          dischargeSummary!.admission.patientId,
        finalDiagnosis:
          dischargeSummary!.finalDiagnosis,
        conditionAtDischarge:
          dischargeSummary!.conditionAtDischarge,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Patient discharged successfully",
      data: dischargeSummary,
    });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<
        string,
        { status: number; message: string }
      > = {
        ADMISSION_NOT_FOUND: {
          status: 404,
          message: "Admission not found",
        },
        ADMISSION_NOT_ACTIVE: {
          status: 400,
          message: "Admission is not active",
        },
        DISCHARGE_SUMMARY_ALREADY_EXISTS: {
          status: 409,
          message:
            "Discharge summary already exists for this admission",
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

    console.error(
      "Create discharge summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDischargeSummariesController(
  req: Request,
  res: Response
) {
  try {
    const admissionId =
      typeof req.query.admissionId === "string"
        ? req.query.admissionId
        : undefined;

    const dischargeSummaries =
      await getDischargeSummaries(admissionId);

    return res.status(200).json({
      success: true,
      data: dischargeSummaries,
    });
  } catch (error) {
    console.error(
      "Get discharge summaries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDischargeSummaryByIdController(
  req: Request,
  res: Response
) {
  try {
    const dischargeSummary =
      await getDischargeSummaryById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: dischargeSummary,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "DISCHARGE_SUMMARY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Discharge summary not found",
      });
    }

    console.error(
      "Get discharge summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}