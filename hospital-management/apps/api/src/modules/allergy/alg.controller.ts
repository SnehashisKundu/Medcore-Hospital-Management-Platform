import { Request, Response } from "express";

import {
  createAllergy,
  getAllergies,
  getAllergyById,
  updateAllergy,
  deleteAllergy,
} from "./alg.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createAllergyController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { patientId, allergen } = req.body ?? {};

    if (!patientId || !allergen) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and allergen are required",
      });
    }

    const allergy = await createAllergy(req.body);

    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PATIENT_ALLERGY",
      entityId: allergy.id,
      metadata: {
        patientId: allergy.patientId,
        allergen: allergy.allergen,
        severity: allergy.severity,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Allergy created successfully",
      data: allergy,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    console.error("Create allergy error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAllergiesController(
  _req: Request,
  res: Response
) {
  try {
    const allergies = await getAllergies();

    return res.status(200).json({
      success: true,
      data: allergies,
    });
  } catch (error) {
    console.error("Get allergies error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAllergyByIdController(
  req: Request,
  res: Response
) {
  try {
    const allergy = await getAllergyById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: allergy,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ALLERGY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Allergy not found",
      });
    }

    console.error("Get allergy error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateAllergyController(
  req: AuthRequest,
  res: Response
) {
  try {
    const allergy = await updateAllergy(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PATIENT_ALLERGY",
      entityId: allergy.id,
      metadata: {
        patientId: allergy.patientId,
        allergen: allergy.allergen,
        severity: allergy.severity,
        isActive: allergy.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Allergy updated successfully",
      data: allergy,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ALLERGY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Allergy not found",
      });
    }

    console.error("Update allergy error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteAllergyController(
  req: AuthRequest,
  res: Response
) {
  try {
    const allergy = await deleteAllergy(
      req.params.id as string
    );

    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PATIENT_ALLERGY",
      entityId: allergy.id,
      metadata: {
        patientId: allergy.patientId,
        allergen: allergy.allergen,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Allergy deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ALLERGY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Allergy not found",
      });
    }

    console.error("Delete allergy error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}