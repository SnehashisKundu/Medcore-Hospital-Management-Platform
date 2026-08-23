import { Request, Response } from "express";

import {
  createEncounter,
  getEncounters,
  getEncounterById,
  updateEncounter,
  deleteEncounter,
} from "./enc.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createEncounterController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      hospitalId,
      patientId,
      encounterNumber,
      consultationType,
    } = req.body;

    if (
      !hospitalId ||
      !patientId ||
      !encounterNumber ||
      !consultationType
    ) {
      return res.status(400).json({
        success: false,
        message: "Required encounter fields are missing",
      });
    }

    const encounter = await createEncounter(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId: encounter.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "ENCOUNTER",
      entityId: encounter.id,
      metadata: {
        encounterNumber: encounter.encounterNumber,
        consultationType: encounter.consultationType,
        status: encounter.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Encounter created successfully",
      data: encounter,
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

    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "APPOINTMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_ALREADY_EXISTS_FOR_APPOINTMENT"
    ) {
      return res.status(409).json({
        success: false,
        message: "An encounter already exists for this appointment",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_ALREADY_EXISTS_FOR_EMERGENCY_CASE"
    ) {
      return res.status(409).json({
        success: false,
        message: "An encounter already exists for this emergency case",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor is not assigned to this hospital",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor department assignment not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_NUMBER_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Encounter number already exists",
      });
    }

    console.error("Create encounter error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getEncountersController(
  _req: Request,
  res: Response
) {
  try {
    const encounters = await getEncounters();

    return res.status(200).json({
      success: true,
      data: encounters,
    });
  } catch (error) {
    console.error("Get encounters error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getEncounterByIdController(
  req: Request,
  res: Response
) {
  try {
    const encounter = await getEncounterById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: encounter,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    console.error("Get encounter error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateEncounterController(
  req: AuthRequest,
  res: Response
) {
  try {
    const encounter = await updateEncounter(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: encounter.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "ENCOUNTER",
      entityId: encounter.id,
      metadata: {
        encounterNumber: encounter.encounterNumber,
        consultationType: encounter.consultationType,
        status: encounter.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Encounter updated successfully",
      data: encounter,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    console.error("Update encounter error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteEncounterController(
  req: AuthRequest,
  res: Response
) {
  try {
    const encounter = await deleteEncounter(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId: encounter.hospitalId,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "ENCOUNTER",
      entityId: encounter.id,
      metadata: {
        encounterNumber: encounter.encounterNumber,
        consultationType: encounter.consultationType,
        status: encounter.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Encounter cancelled successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    console.error("Delete encounter error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}