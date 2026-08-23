import { Request, Response } from "express";

import {
  createCharge,
  getCharges,
  getChargeById,
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from "./bil.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createChargeController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    if (
      !body.hospitalId ||
      !body.patientId ||
      !body.type ||
      !body.description ||
      body.unitPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hospital ID, patient ID, type, description and unit price are required",
      });
    }

    const charge = await createCharge(body);

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId: charge.hospitalId,
      action: "CREATE",
      entityType: "CHARGE",
      entityId: charge.id,
      metadata: {
        amount: charge.amount.toString(),
        type: charge.type,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Charge created successfully",
      data: charge,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        HOSPITAL_NOT_FOUND: [
          404,
          "Hospital not found",
        ],
        PATIENT_NOT_FOUND: [
          404,
          "Patient not found",
        ],
        ENCOUNTER_NOT_FOUND: [
          404,
          "Encounter not found",
        ],
        INVALID_AMOUNT: [
          400,
          "Invalid amount",
        ],
      };

      const response = map[error.message];

      if (response) {
        return res.status(response[0]).json({
          success: false,
          message: response[1],
        });
      }
    }

    console.error("Create charge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getChargesController(
  _req: Request,
  res: Response
) {
  try {
    const charges = await getCharges();

    return res.status(200).json({
      success: true,
      data: charges,
    });
  } catch (error) {
    console.error("Get charges error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getChargeByIdController(
  req: Request,
  res: Response
) {
  try {
    const charge = await getChargeById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: charge,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CHARGE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Charge not found",
      });
    }

    console.error("Get charge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createInvoiceController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    if (
      !body.hospitalId ||
      !body.patientId ||
      !Array.isArray(body.chargeIds) ||
      body.chargeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hospital ID, patient ID and charge IDs are required",
      });
    }

    const invoice = await createInvoice(body);

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId: invoice.hospitalId,
      action: "CREATE",
      entityType: "INVOICE",
      entityId: invoice.id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount:
          invoice.totalAmount.toString(),
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        CHARGES_REQUIRED: [
          400,
          "At least one charge is required",
        ],
        HOSPITAL_NOT_FOUND: [
          404,
          "Hospital not found",
        ],
        PATIENT_NOT_FOUND: [
          404,
          "Patient not found",
        ],
        INVALID_CHARGES: [
          400,
          "Invalid or already billed charges",
        ],
        CHARGE_ALREADY_INVOICED: [
          409,
          "One or more charges are already invoiced",
        ],
        INVALID_AMOUNT: [
          400,
          "Invalid amount",
        ],
        INVALID_TOTAL: [
          400,
          "Invoice total cannot be negative",
        ],
      };

      const response = map[error.message];

      if (response) {
        return res.status(response[0]).json({
          success: false,
          message: response[1],
        });
      }
    }

    console.error("Create invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getInvoicesController(
  _req: Request,
  res: Response
) {
  try {
    const invoices = await getInvoices();

    return res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getInvoiceByIdController(
  req: Request,
  res: Response
) {
  try {
    const invoice = await getInvoiceById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVOICE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    console.error("Get invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateInvoiceController(
  req: AuthRequest,
  res: Response
) {
  try {
    const invoice = await updateInvoice(
      req.params.id as string,
      req.body ?? {}
    );

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId: invoice.hospitalId,
      action: "UPDATE",
      entityType: "INVOICE",
      entityId: invoice.id,
      metadata: {
        status: invoice.status,
        totalAmount:
          invoice.totalAmount.toString(),
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "INVOICE_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      if (
        error.message === "INVOICE_ALREADY_PAID"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid invoice cannot be modified",
        });
      }

      if (
        error.message === "INVALID_TOTAL"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice total cannot be negative",
        });
      }
    }

    console.error("Update invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}