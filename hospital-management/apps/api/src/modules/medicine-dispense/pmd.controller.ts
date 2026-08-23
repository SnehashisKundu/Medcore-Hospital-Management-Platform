import { Request, Response } from "express";

import {
  createMedicineDispense,
  getMedicineDispenses,
  getMedicineDispenseById,
} from "./pmd.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createMedicineDispenseController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      prescriptionId,
      dispensedById,
      items,
    } = body;

    if (
      !prescriptionId ||
      !dispensedById ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Prescription ID, dispenser ID and at least one item are required",
      });
    }

    const dispense =
      await createMedicineDispense(body);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: dispense.prescription.encounter.hospitalId,
      action: "CREATE",
      entityType: "MEDICINE_DISPENSE",
      entityId: dispense.id,
      metadata: {
        prescriptionId: dispense.prescriptionId,
        dispensedById: dispense.dispensedById,
        itemCount: dispense.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Medicine dispensed successfully",
      data: dispense,
    });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<string, [number, string]> = {
        DISPENSE_ITEMS_REQUIRED: [
          400,
          "At least one dispense item is required",
        ],
        PRESCRIPTION_NOT_FOUND: [
          404,
          "Prescription not found",
        ],
        DISPENSER_NOT_FOUND: [
          404,
          "Dispenser not found",
        ],
        PRESCRIPTION_ITEM_NOT_FOUND: [
          404,
          "Prescription item not found",
        ],
        MEDICINE_STOCK_NOT_FOUND: [
          404,
          "Medicine stock not found",
        ],
        STOCK_MEDICINE_MISMATCH: [
          400,
          "Stock medicine does not match prescription medicine",
        ],
        INSUFFICIENT_STOCK: [
          400,
          "Insufficient medicine stock",
        ],
        INVALID_QUANTITY: [
          400,
          "Quantity must be greater than zero",
        ],
      };

      const response = errors[error.message];

      if (response) {
        return res.status(response[0]).json({
          success: false,
          message: response[1],
        });
      }
    }

    console.error(
      "Create medicine dispense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicineDispensesController(
  _req: Request,
  res: Response
) {
  try {
    const dispenses = await getMedicineDispenses();

    return res.status(200).json({
      success: true,
      data: dispenses,
    });
  } catch (error) {
    console.error(
      "Get medicine dispenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicineDispenseByIdController(
  req: Request,
  res: Response
) {
  try {
    const dispense =
      await getMedicineDispenseById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: dispense,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DISPENSE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Medicine dispense not found",
      });
    }

    console.error(
      "Get medicine dispense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}