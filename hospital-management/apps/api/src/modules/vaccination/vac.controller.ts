import { Request, Response } from "express";

import {
  createVaccination,
  getVaccinations,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
} from "./vac.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const vaccinationErrorMap: Record<string, [number, string]> = {
  PATIENT_NOT_FOUND: [404, "Patient not found"],

  VACCINATION_NOT_FOUND: [404, "Vaccination not found"],

  INVALID_VACCINATION_DATE: [
    400,
    "Invalid vaccination date format",
  ],
};

function handleVaccinationError(
  error: unknown,
  res: Response,
  label: string
) {
  if (
    error instanceof Error &&
    vaccinationErrorMap[error.message]
  ) {
    const [status, message] =
      vaccinationErrorMap[error.message];

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

export async function createVaccinationController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      patientId,
      vaccineName,
      administeredDate,
    } = req.body ?? {};

    if (
      !patientId ||
      !vaccineName ||
      !administeredDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "patientId, vaccineName and administeredDate are required",
      });
    }

    const vaccination = await createVaccination(
      req.body
    );

    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PATIENT_VACCINATION",
      entityId: vaccination.id,
      metadata: {
        patientId: vaccination.patientId,
        vaccineName: vaccination.vaccineName,
        administeredDate:
          vaccination.administeredDate,
        nextDueDate: vaccination.nextDueDate,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Vaccination created successfully",
      data: vaccination,
    });
  } catch (error) {
    return handleVaccinationError(
      error,
      res,
      "Create vaccination error"
    );
  }
}

export async function getVaccinationsController(
  _req: Request,
  res: Response
) {
  try {
    const vaccinations =
      await getVaccinations();

    return res.status(200).json({
      success: true,
      data: vaccinations,
    });
  } catch (error) {
    return handleVaccinationError(
      error,
      res,
      "Get vaccinations error"
    );
  }
}

export async function getVaccinationByIdController(
  req: Request,
  res: Response
) {
  try {
    const vaccination =
      await getVaccinationById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: vaccination,
    });
  } catch (error) {
    return handleVaccinationError(
      error,
      res,
      "Get vaccination error"
    );
  }
}

export async function updateVaccinationController(
  req: AuthRequest,
  res: Response
) {
  try {
    const vaccination =
      await updateVaccination(
        req.params.id as string,
        req.body ?? {}
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PATIENT_VACCINATION",
      entityId: vaccination.id,
      metadata: {
        patientId: vaccination.patientId,
        vaccineName: vaccination.vaccineName,
        administeredDate:
          vaccination.administeredDate,
        nextDueDate: vaccination.nextDueDate,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Vaccination updated successfully",
      data: vaccination,
    });
  } catch (error) {
    return handleVaccinationError(
      error,
      res,
      "Update vaccination error"
    );
  }
}

export async function deleteVaccinationController(
  req: AuthRequest,
  res: Response
) {
  try {
    const vaccination =
      await deleteVaccination(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PATIENT_VACCINATION",
      entityId: vaccination.id,
      metadata: {
        patientId: vaccination.patientId,
        vaccineName: vaccination.vaccineName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Vaccination deleted successfully",
    });
  } catch (error) {
    return handleVaccinationError(
      error,
      res,
      "Delete vaccination error"
    );
  }
}