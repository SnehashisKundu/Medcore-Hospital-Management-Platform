import { Request, Response } from "express";

import {
  createDiagnosticOrder,
  getDiagnosticOrders,
  getDiagnosticOrderById,
  updateDiagnosticOrder,
  updateDiagnosticOrderItem,
} from "./dgo.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDiagnosticOrderController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      encounterId,
      orderedById,
      items,
    } = body;

    if (
      !encounterId ||
      !orderedById ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Encounter ID, ordered by ID and at least one diagnostic item are required",
      });
    }

    const order = await createDiagnosticOrder(body);

    await createAuditLog({
      hospitalId: order.encounter.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "DIAGNOSTIC_ORDER",
      entityId: order.id,
      metadata: {
        encounterId: order.encounterId,
        orderedById: order.orderedById,
        clinicalNotes: order.clinicalNotes,
        itemCount: order.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Diagnostic order created successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ENCOUNTER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Encounter not found",
        });
      }

      if (error.message === "ENCOUNTER_CANCELLED") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot create diagnostic order for a cancelled encounter",
        });
      }

      if (error.message === "ORDERED_BY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Ordering doctor not found",
        });
      }

      if (error.message === "DIAGNOSTIC_ITEMS_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "At least one diagnostic test is required",
        });
      }

      if (error.message === "DIAGNOSTIC_TEST_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Diagnostic test not found",
        });
      }

      if (error.message === "DIAGNOSTIC_TEST_INACTIVE") {
        return res.status(400).json({
          success: false,
          message: "Diagnostic test is inactive",
        });
      }
    }

    console.error("Create diagnostic order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDiagnosticOrdersController(
  _req: Request,
  res: Response
) {
  try {
    const orders = await getDiagnosticOrders();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get diagnostic orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDiagnosticOrderByIdController(
  req: Request,
  res: Response
) {
  try {
    const order = await getDiagnosticOrderById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DIAGNOSTIC_ORDER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Diagnostic order not found",
      });
    }

    console.error("Get diagnostic order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateDiagnosticOrderController(
  req: AuthRequest,
  res: Response
) {
  try {
    const order = await updateDiagnosticOrder(
      req.params.id as string,
      req.body
    );

    await createAuditLog({
      hospitalId: order.encounter.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DIAGNOSTIC_ORDER",
      entityId: order.id,
      metadata: {
        clinicalNotes: order.clinicalNotes,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Diagnostic order updated successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DIAGNOSTIC_ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Diagnostic order not found",
        });
      }

      if (error.message === "ENCOUNTER_CANCELLED") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot update diagnostic order of a cancelled encounter",
        });
      }
    }

    console.error("Update diagnostic order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateDiagnosticOrderItemController(
  req: AuthRequest,
  res: Response
) {
  try {
    const item = await updateDiagnosticOrderItem(
      req.params.id as string,
      req.body
    );

    await createAuditLog({
      hospitalId:
        item.diagnosticOrder.encounter.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DIAGNOSTIC_ORDER_ITEM",
      entityId: item.id,
      metadata: {
        diagnosticOrderId: item.diagnosticOrderId,
        diagnosticTestId: item.diagnosticTestId,
        status: item.status,
        scheduledAt: item.scheduledAt,
        sampleCollectedAt: item.sampleCollectedAt,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        instructions: item.instructions,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Diagnostic order item updated successfully",
      data: item,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "DIAGNOSTIC_ORDER_ITEM_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Diagnostic order item not found",
      });
    }

    console.error(
      "Update diagnostic order item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}