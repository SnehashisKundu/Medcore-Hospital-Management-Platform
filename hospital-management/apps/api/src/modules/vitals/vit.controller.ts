import { Request, Response } from "express";

import {
  createVital,
  getVitals,
  getVitalById,
  updateVital,
} from "./vit.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createVitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { encounterId } = req.body;

    if (!encounterId) {
      return res.status(400).json({
        success: false,
        message: "Encounter ID is required",
      });
    }

    const vital = await createVital(req.body);

    // Get encounter with hospital context
    const vitalWithEncounter = await getVitalById(vital.id);

    // Audit CREATE
    await createAuditLog({
      hospitalId: vitalWithEncounter.encounter.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "VITAL",
      entityId: vital.id,
      metadata: {
        encounterId: vital.encounterId,
        temperatureCelsius: vital.temperatureCelsius,
        pulseRate: vital.pulseRate,
        oxygenSaturation: vital.oxygenSaturation,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Vital created successfully",
      data: vital,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ENCOUNTER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Encounter not found",
        });
      }

      if (error.message === "RECORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Recorder user not found",
        });
      }
    }

    console.error("Create vital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getVitalsController(
  _req: Request,
  res: Response
) {
  try {
    const vitals = await getVitals();

    return res.status(200).json({
      success: true,
      data: vitals,
    });
  } catch (error) {
    console.error("Get vitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getVitalByIdController(
  req: Request,
  res: Response
) {
  try {
    const vital = await getVitalById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: vital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "VITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Vital not found",
      });
    }

    console.error("Get vital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateVitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const vital = await updateVital(
      req.params.id as string,
      req.body
    );

    // Get encounter with hospital context
    const vitalWithEncounter = await getVitalById(vital.id);

    // Audit UPDATE
    await createAuditLog({
      hospitalId: vitalWithEncounter.encounter.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "VITAL",
      entityId: vital.id,
      metadata: {
        encounterId: vital.encounterId,
        temperatureCelsius: vital.temperatureCelsius,
        pulseRate: vital.pulseRate,
        oxygenSaturation: vital.oxygenSaturation,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Vital updated successfully",
      data: vital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "VITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Vital not found",
      });
    }

    console.error("Update vital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}