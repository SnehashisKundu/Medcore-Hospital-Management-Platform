import { Request, Response } from "express";

import {
  createMedicationHistory,
  getMedicationHistories,
  getMedicationHistoryById,
  updateMedicationHistory,
  deleteMedicationHistory,
} from "./mth.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const medicationHistoryErrorMap: Record<string, [number, string]> = {
  PATIENT_NOT_FOUND: [404, "Patient not found"],

  MEDICATION_HISTORY_NOT_FOUND: [
    404,
    "Medication history not found",
  ],
};

function handleMedicationHistoryError(
  error: unknown,
  res: Response,
  label: string
) {
  if (
    error instanceof Error &&
    medicationHistoryErrorMap[error.message]
  ) {
    const [status, message] =
      medicationHistoryErrorMap[error.message];

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

export async function createMedicationHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { patientId, medicineName } = req.body ?? {};

    if (!patientId || !medicineName) {
      return res.status(400).json({
        success: false,
        message:
          "patientId and medicineName are required",
      });
    }

    const medicationHistory =
      await createMedicationHistory(req.body);

    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PATIENT_MEDICATION_HISTORY",
      entityId: medicationHistory.id,
      metadata: {
        patientId: medicationHistory.patientId,
        medicineName: medicationHistory.medicineName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Medication history created successfully",
      data: medicationHistory,
    });
  } catch (error) {
    return handleMedicationHistoryError(
      error,
      res,
      "Create medication history error"
    );
  }
}

export async function getMedicationHistoriesController(
  _req: Request,
  res: Response
) {
  try {
    const medicationHistories =
      await getMedicationHistories();

    return res.status(200).json({
      success: true,
      data: medicationHistories,
    });
  } catch (error) {
    return handleMedicationHistoryError(
      error,
      res,
      "Get medication histories error"
    );
  }
}

export async function getMedicationHistoryByIdController(
  req: Request,
  res: Response
) {
  try {
    const medicationHistory =
      await getMedicationHistoryById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: medicationHistory,
    });
  } catch (error) {
    return handleMedicationHistoryError(
      error,
      res,
      "Get medication history error"
    );
  }
}

export async function updateMedicationHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const medicationHistory =
      await updateMedicationHistory(
        req.params.id as string,
        req.body ?? {}
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PATIENT_MEDICATION_HISTORY",
      entityId: medicationHistory.id,
      metadata: {
        patientId: medicationHistory.patientId,
        medicineName: medicationHistory.medicineName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Medication history updated successfully",
      data: medicationHistory,
    });
  } catch (error) {
    return handleMedicationHistoryError(
      error,
      res,
      "Update medication history error"
    );
  }
}

export async function deleteMedicationHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const medicationHistory =
      await deleteMedicationHistory(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PATIENT_MEDICATION_HISTORY",
      entityId: medicationHistory.id,
      metadata: {
        patientId: medicationHistory.patientId,
        medicineName: medicationHistory.medicineName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Medication history deleted successfully",
    });
  } catch (error) {
    return handleMedicationHistoryError(
      error,
      res,
      "Delete medication history error"
    );
  }
}