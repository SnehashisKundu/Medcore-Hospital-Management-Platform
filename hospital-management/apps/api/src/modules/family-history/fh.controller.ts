import { Request, Response } from "express";

import {
  createFamilyHistory,
  getFamilyHistories,
  getFamilyHistoryById,
  updateFamilyHistory,
  deleteFamilyHistory,
} from "./fh.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const familyHistoryErrorMap: Record<string, [number, string]> = {
  PATIENT_NOT_FOUND: [404, "Patient not found"],
  FAMILY_HISTORY_NOT_FOUND: [404, "Family history not found"],
};

function handleFamilyHistoryError(
  error: unknown,
  res: Response,
  label: string
) {
  if (
    error instanceof Error &&
    familyHistoryErrorMap[error.message]
  ) {
    const [status, message] =
      familyHistoryErrorMap[error.message];

    return res.status(status).json({
      success: false,
      message,
    });
  }

  console.error(`${label}:`, error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function createFamilyHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { patientId } = req.body ?? {};

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    const familyHistory = await createFamilyHistory(
      req.body
    );

    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PATIENT_FAMILY_HISTORY",
      entityId: familyHistory.id,
      metadata: {
        patientId: familyHistory.patientId,
        diabetes: familyHistory.diabetes,
        hypertension: familyHistory.hypertension,
        cancer: familyHistory.cancer,
        cardiac: familyHistory.cardiac,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Family history created successfully",
      data: familyHistory,
    });
  } catch (error) {
    return handleFamilyHistoryError(
      error,
      res,
      "Create family history error"
    );
  }
}

export async function getFamilyHistoriesController(
  _req: Request,
  res: Response
) {
  try {
    const familyHistories =
      await getFamilyHistories();

    return res.status(200).json({
      success: true,
      data: familyHistories,
    });
  } catch (error) {
    return handleFamilyHistoryError(
      error,
      res,
      "Get family histories error"
    );
  }
}

export async function getFamilyHistoryByIdController(
  req: Request,
  res: Response
) {
  try {
    const familyHistory =
      await getFamilyHistoryById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: familyHistory,
    });
  } catch (error) {
    return handleFamilyHistoryError(
      error,
      res,
      "Get family history error"
    );
  }
}

export async function updateFamilyHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const familyHistory =
      await updateFamilyHistory(
        req.params.id as string,
        req.body ?? {}
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PATIENT_FAMILY_HISTORY",
      entityId: familyHistory.id,
      metadata: {
        patientId: familyHistory.patientId,
        diabetes: familyHistory.diabetes,
        hypertension: familyHistory.hypertension,
        cancer: familyHistory.cancer,
        cardiac: familyHistory.cardiac,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Family history updated successfully",
      data: familyHistory,
    });
  } catch (error) {
    return handleFamilyHistoryError(
      error,
      res,
      "Update family history error"
    );
  }
}

export async function deleteFamilyHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const familyHistory =
      await deleteFamilyHistory(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PATIENT_FAMILY_HISTORY",
      entityId: familyHistory.id,
      metadata: {
        patientId: familyHistory.patientId,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Family history deleted successfully",
    });
  } catch (error) {
    return handleFamilyHistoryError(
      error,
      res,
      "Delete family history error"
    );
  }
}