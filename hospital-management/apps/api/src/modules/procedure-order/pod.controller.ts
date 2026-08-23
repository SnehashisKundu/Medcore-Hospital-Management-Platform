import { Request, Response } from "express";

import {
  createProcedureOrder,
  getProcedureOrders,
  getProcedureOrderById,
  updateProcedureOrder,
} from "./pod.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createProcedureOrderController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      encounterId,
      admissionId,
      procedureId,
      reason,
      instructions,
      scheduledStart,
      scheduledEnd,
    } = body;

    if (!encounterId || !procedureId) {
      return res.status(400).json({
        success: false,
        message:
          "Encounter ID and procedure ID are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const procedureOrder =
      await createProcedureOrder({
        encounterId,
        admissionId,
        procedureId,
        orderedById: req.user.id,
        reason,
        instructions,
        scheduledStart,
        scheduledEnd,
      });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        procedureOrder.encounter.hospitalId,
      action: "CREATE",
      entityType: "PROCEDURE_ORDER",
      entityId: procedureOrder.id,
      metadata: {
        encounterId:
          procedureOrder.encounterId,
        admissionId:
          procedureOrder.admissionId,
        procedureId:
          procedureOrder.procedureId,
        orderedById:
          procedureOrder.orderedById,
        status: procedureOrder.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Procedure order created successfully",
      data: procedureOrder,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        ENCOUNTER_NOT_FOUND: [
          404,
          "Encounter not found",
        ],

        PROCEDURE_NOT_FOUND: [
          404,
          "Procedure not found",
        ],

        USER_NOT_FOUND: [
          404,
          "User not found",
        ],

        ADMISSION_NOT_FOUND: [
          404,
          "Admission not found",
        ],

        ADMISSION_ENCOUNTER_MISMATCH: [
          400,
          "Admission and encounter do not belong to the same patient",
        ],

        ADMISSION_NOT_ACTIVE: [
          400,
          "Admission is not currently active",
        ],

        INVALID_SCHEDULE: [
          400,
          "Scheduled end time must be after scheduled start time",
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
      "Create procedure order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProcedureOrdersController(
  _req: Request,
  res: Response
) {
  try {
    const procedureOrders =
      await getProcedureOrders();

    return res.status(200).json({
      success: true,
      data: procedureOrders,
    });
  } catch (error) {
    console.error(
      "Get procedure orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProcedureOrderByIdController(
  req: Request,
  res: Response
) {
  try {
    const procedureOrder =
      await getProcedureOrderById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: procedureOrder,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "PROCEDURE_ORDER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Procedure order not found",
      });
    }

    console.error(
      "Get procedure order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateProcedureOrderController(
  req: AuthRequest,
  res: Response
) {
  try {
    const procedureOrder =
      await updateProcedureOrder(
        req.params.id as string,
        req.body ?? {}
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        procedureOrder.encounter.hospitalId,
      action: "UPDATE",
      entityType: "PROCEDURE_ORDER",
      entityId: procedureOrder.id,
      metadata: {
        encounterId:
          procedureOrder.encounterId,
        admissionId:
          procedureOrder.admissionId,
        procedureId:
          procedureOrder.procedureId,
        status: procedureOrder.status,
        scheduledStart:
          procedureOrder.scheduledStart,
        scheduledEnd:
          procedureOrder.scheduledEnd,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Procedure order updated successfully",
      data: procedureOrder,
    });
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, [number, string]> = {
        PROCEDURE_ORDER_NOT_FOUND: [
          404,
          "Procedure order not found",
        ],

        PROCEDURE_ORDER_NOT_MODIFIABLE: [
          400,
          "Completed or cancelled procedure order cannot be modified",
        ],

        INVALID_SCHEDULE: [
          400,
          "Scheduled end time must be after scheduled start time",
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
      "Update procedure order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}