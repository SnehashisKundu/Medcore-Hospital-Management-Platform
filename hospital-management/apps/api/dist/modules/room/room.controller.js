"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomController = createRoomController;
exports.getRoomsController = getRoomsController;
exports.getRoomByIdController = getRoomByIdController;
exports.updateRoomController = updateRoomController;
exports.deleteRoomController = deleteRoomController;
const room_service_1 = require("./room.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createRoomController(req, res) {
    try {
        const body = req.body ?? {};
        const { wardId, roomNumber, name, dailyCharge, } = body;
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
        const room = await (0, room_service_1.createRoom)({
            wardId,
            roomNumber,
            name,
            dailyCharge,
        });
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
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
async function getRoomsController(req, res) {
    try {
        const wardId = typeof req.query.wardId === "string"
            ? req.query.wardId
            : undefined;
        const rooms = await (0, room_service_1.getRooms)(wardId);
        return res.status(200).json({
            success: true,
            data: rooms,
        });
    }
    catch (error) {
        console.error("Get rooms error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getRoomByIdController(req, res) {
    try {
        const room = await (0, room_service_1.getRoomById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: room,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROOM_NOT_FOUND") {
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
async function updateRoomController(req, res) {
    try {
        const room = await (0, room_service_1.updateRoom)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
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
async function deleteRoomController(req, res) {
    try {
        const room = await (0, room_service_1.deleteRoom)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ROOM_NOT_FOUND") {
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
