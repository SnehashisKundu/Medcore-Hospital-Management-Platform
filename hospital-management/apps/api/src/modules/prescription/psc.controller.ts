import { Request, Response } from "express";

import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
} from "./psc.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const CREATE_PRESCRIPTION_ERROR_MAP: Record<
  string,
  {
    status: number;
    message: string;
  }
> = {
  ENCOUNTER_NOT_FOUND: {
    status: 404,
    message: "Encounter not found",
  },
  ENCOUNTER_CANCELLED: {
    status: 400,
    message:
      "Cannot create prescription for a cancelled encounter",
  },
  PRESCRIBER_NOT_FOUND: {
    status: 404,
    message: "Prescriber not found",
  },
  PRESCRIPTION_ITEMS_REQUIRED: {
    status: 400,
    message:
      "At least one prescription item is required",
  },
  MEDICINE_NOT_FOUND: {
    status: 404,
    message: "Medicine not found",
  },
  INVALID_MEDICINE_TIMING: {
    status: 400,
    message:
      "Invalid medicine timing. Use BEFORE_FOOD, AFTER_FOOD, WITH_FOOD, ANYTIME or supported aliases like 'After meals'.",
  },
  INVALID_MEDICINE_ROUTE: {
    status: 400,
    message:
      "Invalid medicine route. Use ORAL, IV, IM, TOPICAL, INHALATION, EYE_DROP, EAR_DROP or OTHER.",
  },
};

export async function createPrescriptionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      encounterId,
      prescribedById,
      items,
    } = req.body;

    if (
      !encounterId ||
      !prescribedById ||
      !items
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Encounter ID, prescriber ID and prescription items are required",
      });
    }

    const prescription =
      await createPrescription(req.body);

    // Get encounter with hospital context
    const prescriptionWithEncounter =
      await getPrescriptionById(prescription.id);

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        prescriptionWithEncounter.encounter.hospitalId,
      action: "CREATE",
      entityType: "PRESCRIPTION",
      entityId: prescription.id,
      metadata: {
        encounterId: prescription.encounterId,
        prescribedById: prescription.prescribedById,
        status: prescription.status,
        instructions: prescription.instructions,
        itemCount: prescription.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    if (error instanceof Error) {
      const mappedError =
        CREATE_PRESCRIPTION_ERROR_MAP[error.message];

      if (mappedError) {
        return res.status(mappedError.status).json({
          success: false,
          message: mappedError.message,
        });
      }
    }

    console.error(
      "Create prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPrescriptionsController(
  _req: Request,
  res: Response
) {
  try {
    const prescriptions =
      await getPrescriptions();

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error(
      "Get prescriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPrescriptionByIdController(
  req: Request,
  res: Response
) {
  try {
    const prescription =
      await getPrescriptionById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PRESCRIPTION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    console.error(
      "Get prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updatePrescriptionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const prescription =
      await updatePrescription(
        req.params.id as string,
        req.body
      );

    // Get encounter with hospital context
    const prescriptionWithEncounter =
      await getPrescriptionById(prescription.id);

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        prescriptionWithEncounter.encounter.hospitalId,
      action: "UPDATE",
      entityType: "PRESCRIPTION",
      entityId: prescription.id,
      metadata: {
        encounterId: prescription.encounterId,
        prescribedById: prescription.prescribedById,
        status: prescription.status,
        instructions: prescription.instructions,
        itemCount: prescription.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "PRESCRIPTION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      if (
        error.message === "ENCOUNTER_CANCELLED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot update prescription of a cancelled encounter",
        });
      }
    }

    console.error(
      "Update prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}