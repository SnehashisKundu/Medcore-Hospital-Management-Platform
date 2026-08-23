import { Request, Response } from "express";

import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
} from "./med.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createMedicineController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      name,
      genericName,
      strength,
      dosageForm,
    } = req.body ?? {};

    if (!name || !strength || !dosageForm) {
      return res.status(400).json({
        success: false,
        message: "Name, strength and dosage form are required",
      });
    }

    const medicine = await createMedicine(req.body);

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "MEDICINE",
      entityId: medicine.id,
      metadata: {
        name: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        isActive: medicine.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data: medicine,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "MEDICINE_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Medicine already exists",
      });
    }

    console.error("Create medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicinesController(
  _req: Request,
  res: Response
) {
  try {
    const medicines = await getMedicines();

    return res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicineByIdController(
  req: Request,
  res: Response
) {
  try {
    const medicine = await getMedicineById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "MEDICINE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    console.error("Get medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateMedicineController(
  req: AuthRequest,
  res: Response
) {
  try {
    const medicine = await updateMedicine(
      req.params.id as string,
      req.body ?? {}
    );

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "MEDICINE",
      entityId: medicine.id,
      metadata: {
        name: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        isActive: medicine.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: medicine,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MEDICINE_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }

      if (error.message === "MEDICINE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Medicine already exists",
        });
      }
    }

    console.error("Update medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}