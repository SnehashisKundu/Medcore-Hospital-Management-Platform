import { Request, Response } from "express";

import {
  createImagingReport,
  getImagingReports,
  getImagingReportById,
  updateImagingReport,
} from "./imr.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createImagingReportController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const { diagnosticOrderItemId } = body;

    if (!diagnosticOrderItemId) {
      return res.status(400).json({
        success: false,
        message: "Diagnostic order item ID is required",
      });
    }

    const report = await createImagingReport(body);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        report.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
      action: "CREATE",
      entityType: "IMAGING_REPORT",
      entityId: report.id,
      metadata: {
        diagnosticOrderItemId: report.diagnosticOrderItemId,
        reportedById: report.reportedById,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Imaging report created successfully",
      data: report,
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
        "IMAGING_REPORT_ALREADY_EXISTS"
      ) {
        return res.status(409).json({
          success: false,
          message: "Imaging report already exists",
        });
      }

      if (error.message === "REPORTER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Reporter not found",
        });
      }
    }

    console.error(
      "Create imaging report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getImagingReportsController(
  _req: Request,
  res: Response
) {
  try {
    const reports = await getImagingReports();

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error(
      "Get imaging reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getImagingReportByIdController(
  req: Request,
  res: Response
) {
  try {
    const report = await getImagingReportById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "IMAGING_REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Imaging report not found",
      });
    }

    console.error(
      "Get imaging report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateImagingReportController(
  req: AuthRequest,
  res: Response
) {
  try {
    const report = await updateImagingReport(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        report.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
      action: "UPDATE",
      entityType: "IMAGING_REPORT",
      entityId: report.id,
      metadata: {
        diagnosticOrderItemId: report.diagnosticOrderItemId,
        reportedById: report.reportedById,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Imaging report updated successfully",
      data: report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "IMAGING_REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Imaging report not found",
      });
    }

    console.error(
      "Update imaging report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}