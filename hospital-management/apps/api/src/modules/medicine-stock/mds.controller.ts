import { Request, Response } from "express";

import {
  createMedicineStock,
  getMedicineStocks,
  getMedicineStockById,
  updateMedicineStock,
} from "./mds.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createMedicineStockController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      hospitalId,
      medicineId,
      batchNumber,
      expiryDate,
      purchasePrice,
      sellingPrice,
      quantityAvailable,
    } = body;

    if (
      !hospitalId ||
      !medicineId ||
      !batchNumber ||
      !expiryDate ||
      purchasePrice === undefined ||
      sellingPrice === undefined ||
      quantityAvailable === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hospital ID, medicine ID, batch number, expiry date, prices and quantity are required",
      });
    }

    const stock = await createMedicineStock(body);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: stock.hospitalId,
      action: "CREATE",
      entityType: "MEDICINE_STOCK",
      entityId: stock.id,
      metadata: {
        medicineId: stock.medicineId,
        batchNumber: stock.batchNumber,
        quantityAvailable: stock.quantityAvailable,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Medicine stock created successfully",
      data: stock,
    });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<string, [number, string]> = {
        HOSPITAL_NOT_FOUND: [
          404,
          "Hospital not found",
        ],

        MEDICINE_NOT_FOUND: [
          404,
          "Medicine not found",
        ],

        SUPPLIER_NOT_FOUND: [
          404,
          "Supplier not found",
        ],

        STOCK_ALREADY_EXISTS: [
          409,
          "Medicine stock with this batch already exists",
        ],

        INVALID_QUANTITY: [
          400,
          "Quantity cannot be negative",
        ],

        INVALID_PRICE: [
          400,
          "Price cannot be negative",
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
      "Create medicine stock error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicineStocksController(
  _req: Request,
  res: Response
) {
  try {
    const stocks = await getMedicineStocks();

    return res.status(200).json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error(
      "Get medicine stocks error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMedicineStockByIdController(
  req: Request,
  res: Response
) {
  try {
    const stock = await getMedicineStockById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "STOCK_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock not found",
      });
    }

    console.error(
      "Get medicine stock error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateMedicineStockController(
  req: AuthRequest,
  res: Response
) {
  try {
    const stock = await updateMedicineStock(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: stock.hospitalId,
      action: "UPDATE",
      entityType: "MEDICINE_STOCK",
      entityId: stock.id,
      metadata: {
        medicineId: stock.medicineId,
        batchNumber: stock.batchNumber,
        quantityAvailable: stock.quantityAvailable,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Medicine stock updated successfully",
      data: stock,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "STOCK_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Medicine stock not found",
        });
      }

      if (error.message === "SUPPLIER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      if (error.message === "INVALID_QUANTITY") {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
      }

      if (error.message === "INVALID_PRICE") {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }
    }

    console.error(
      "Update medicine stock error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}