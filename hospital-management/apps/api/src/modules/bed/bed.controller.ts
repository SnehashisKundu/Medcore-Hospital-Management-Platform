import { Request, Response } from "express";

import {
  createBed,
  getBeds,
  getBedAvailabilitySummary,
  getBedById,
  updateBed,
  deleteBed,
} from "./bed.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createBedController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { roomId, bedNumber, status, dailyCharge } = req.body ?? {};

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    if (!bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Bed number is required",
      });
    }

    const bed = await createBed({
      roomId,
      bedNumber,
      status,
      dailyCharge,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: bed.room.ward.hospitalId,
      action: "CREATE",
      entityType: "BED",
      entityId: bed.id,
      metadata: {
        roomId: bed.roomId,
        bedNumber: bed.bedNumber,
        status: bed.status,
        dailyCharge: bed.dailyCharge,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Bed created successfully",
      data: bed,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ROOM_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      if (error.message === "BED_NUMBER_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Bed number already exists in this room",
        });
      }
    }

    console.error("Create bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getBedsController(
  req: Request,
  res: Response
) {
  try {
    const roomId =
      typeof req.query.roomId === "string"
        ? req.query.roomId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const beds = await getBeds(roomId, status);

    return res.status(200).json({
      success: true,
      data: beds,
    });
  } catch (error) {
    console.error("Get beds error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getBedAvailabilitySummaryController(
  req: Request,
  res: Response
) {
  try {
    const hospitalId =
      typeof req.query.hospitalId === "string"
        ? req.query.hospitalId
        : undefined;

    const summary =
      await getBedAvailabilitySummary(hospitalId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(
      "Get bed availability summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function getBedByIdController(
  req: Request,
  res: Response
) {
  try {
    const bed = await getBedById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: bed,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "BED_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    console.error("Get bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateBedController(
  req: AuthRequest,
  res: Response
) {
  try {
    const bed = await updateBed(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: bed.room.ward.hospitalId,
      action: "UPDATE",
      entityType: "BED",
      entityId: bed.id,
      metadata: {
        roomId: bed.roomId,
        bedNumber: bed.bedNumber,
        status: bed.status,
        dailyCharge: bed.dailyCharge,
        isActive: bed.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Bed updated successfully",
      data: bed,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BED_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Bed not found",
        });
      }

      if (error.message === "BED_NUMBER_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Bed number already exists in this room",
        });
      }
    }

    console.error("Update bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteBedController(
  req: AuthRequest,
  res: Response
) {
  try {
    const bed = await deleteBed(req.params.id as string);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: bed.room.ward.hospitalId,
      action: "DELETE",
      entityType: "BED",
      entityId: bed.id,
      metadata: {
        roomId: bed.roomId,
        bedNumber: bed.bedNumber,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Bed deleted successfully",
      data: bed,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BED_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Bed not found",
        });
      }

      if (error.message === "OCCUPIED_BED_CANNOT_BE_DELETED") {
        return res.status(400).json({
          success: false,
          message: "Occupied bed cannot be deleted",
        });
      }
    }

    console.error("Delete bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}