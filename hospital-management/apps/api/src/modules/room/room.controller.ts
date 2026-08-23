import { Request, Response } from "express";

import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "./room.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createRoomController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      wardId,
      roomNumber,
      name,
      dailyCharge,
    } = body;

    if (!wardId) {
      return res.status(400).json({
        success: false,
        message: "Ward ID is required",
      });
    }

    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: "Room number is required",
      });
    }

    const room = await createRoom({
      wardId,
      roomNumber,
      name,
      dailyCharge,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: room.ward.hospitalId,
      action: "CREATE",
      entityType: "ROOM",
      entityId: room.id,
      metadata: {
        wardId: room.wardId,
        roomNumber: room.roomNumber,
        name: room.name,
        dailyCharge: room.dailyCharge,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "WARD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Ward not found",
        });
      }

      if (error.message === "ROOM_NUMBER_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Room number already exists in this ward",
        });
      }
    }

    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getRoomsController(
  req: Request,
  res: Response
) {
  try {
    const wardId =
      typeof req.query.wardId === "string"
        ? req.query.wardId
        : undefined;

    const rooms = await getRooms(wardId);

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getRoomByIdController(
  req: Request,
  res: Response
) {
  try {
    const room = await getRoomById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROOM_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    console.error("Get room error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateRoomController(
  req: AuthRequest,
  res: Response
) {
  try {
    const room = await updateRoom(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: room.ward.hospitalId,
      action: "UPDATE",
      entityType: "ROOM",
      entityId: room.id,
      metadata: {
        wardId: room.wardId,
        roomNumber: room.roomNumber,
        name: room.name,
        dailyCharge: room.dailyCharge,
        isActive: room.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ROOM_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      if (error.message === "ROOM_NUMBER_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Room number already exists in this ward",
        });
      }
    }

    console.error("Update room error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteRoomController(
  req: AuthRequest,
  res: Response
) {
  try {
    const room = await deleteRoom(
      req.params.id as string
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: req.user?.roles?.[0]?.hospitalId ?? undefined,
      action: "DELETE",
      entityType: "ROOM",
      entityId: room.id,
      metadata: {
        wardId: room.wardId,
        roomNumber: room.roomNumber,
        name: room.name,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: room,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROOM_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    console.error("Delete room error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}