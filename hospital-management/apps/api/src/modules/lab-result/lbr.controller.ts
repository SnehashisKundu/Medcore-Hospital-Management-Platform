import { Request, Response } from "express";

import {
  createLabResult,
  getLabResults,
  getLabResultById,
  updateLabResult,
} from "./lbr.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createLabResultController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      diagnosticOrderItemId,
      reportedById,
    } = body;

    if (!diagnosticOrderItemId || !reportedById) {
      return res.status(400).json({
        success: false,
        message:
          "Diagnostic order item ID and reporter ID are required",
      });
    }

    const result = await createLabResult(body);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        result.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
      action: "CREATE",
      entityType: "LAB_RESULT",
      entityId: result.id,
      metadata: {
        diagnosticOrderItemId: result.diagnosticOrderItemId,
        reportedById: result.reportedById,
        valueCount: result.values.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Lab result created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "DIAGNOSTIC_ORDER_ITEM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Diagnostic order item not found",
        });
      }

      if (
        error.message ===
        "LAB_RESULT_ALREADY_EXISTS"
      ) {
        return res.status(409).json({
          success: false,
          message: "Lab result already exists",
        });
      }

      if (error.message === "REPORTER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Reporter not found",
        });
      }
    }

    console.error("Create lab result error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getLabResultsController(
  _req: Request,
  res: Response
) {
  try {
    const results = await getLabResults();

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get lab results error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getLabResultByIdController(
  req: Request,
  res: Response
) {
  try {
    const result = await getLabResultById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "LAB_RESULT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Lab result not found",
      });
    }

    console.error("Get lab result error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateLabResultController(
  req: AuthRequest,
  res: Response
) {
  try {
    const result = await updateLabResult(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        result.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
      action: "UPDATE",
      entityType: "LAB_RESULT",
      entityId: result.id,
      metadata: {
        diagnosticOrderItemId: result.diagnosticOrderItemId,
        reportedById: result.reportedById,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Lab result updated successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "LAB_RESULT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Lab result not found",
      });
    }

    console.error("Update lab result error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}