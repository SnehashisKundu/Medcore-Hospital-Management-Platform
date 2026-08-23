import { Request, Response } from "express";

import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
} from "./pay.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createPaymentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      invoiceId,
      amount,
      method,
    } = body;

    if (
      !invoiceId ||
      amount === undefined ||
      !method
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice ID, amount and payment method are required",
      });
    }

    const payment = await createPayment(body);

    if (!payment) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId: payment?.invoice?.hospitalId,
      action: "CREATE",
      entityType: "PAYMENT",
      entityId: payment.id,
      metadata: {
        invoiceId: payment.invoiceId,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        blockchainTxId:
          payment.blockchainTxId,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        INVALID_AMOUNT: [
          400,
          "Payment amount must be greater than zero",
        ],

        INVOICE_NOT_FOUND: [
          404,
          "Invoice not found",
        ],

        INVOICE_NOT_PAYABLE: [
          400,
          "Invoice is not available for payment",
        ],

        INVOICE_ALREADY_PAID: [
          400,
          "Invoice is already fully paid",
        ],

        PAYMENT_EXCEEDS_DUE: [
          400,
          "Payment amount exceeds remaining invoice amount",
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

    console.error(
      "Create payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPaymentsController(
  _req: Request,
  res: Response
) {
  try {
    const payments = await getPayments();

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error(
      "Get payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPaymentByIdController(
  req: Request,
  res: Response
) {
  try {
    const payment = await getPaymentById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PAYMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updatePaymentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const payment = await updatePayment(
      req.params.id as string,
      req.body ?? {}
    );

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      hospitalId: payment.invoice?.hospitalId,
      action: "UPDATE",
      entityType: "PAYMENT",
      entityId: payment.id,
      metadata: {
        invoiceId: payment.invoiceId,
        amount: payment.amount.toString(),
        status: payment.status,
        transactionReference:
          payment.transactionReference,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "PAYMENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      if (
        error.message ===
        "PAYMENT_ALREADY_REFUNDED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Refunded payment cannot be modified",
        });
      }
    }

    console.error(
      "Update payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}