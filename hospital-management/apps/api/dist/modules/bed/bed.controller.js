"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBedController = createBedController;
exports.getBedsController = getBedsController;
exports.getBedAvailabilitySummaryController = getBedAvailabilitySummaryController;
exports.getBedByIdController = getBedByIdController;
exports.updateBedController = updateBedController;
exports.deleteBedController = deleteBedController;
const bed_service_1 = require("./bed.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createBedController(req, res) {
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
        const bed = await (0, bed_service_1.createBed)({
            roomId,
            bedNumber,
            status,
            dailyCharge,
        });
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
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
async function getBedsController(req, res) {
    try {
        const roomId = typeof req.query.roomId === "string"
            ? req.query.roomId
            : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const beds = await (0, bed_service_1.getBeds)(roomId, status);
        return res.status(200).json({
            success: true,
            data: beds,
        });
    }
    catch (error) {
        console.error("Get beds error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getBedAvailabilitySummaryController(req, res) {
    try {
        const hospitalId = typeof req.query.hospitalId === "string"
            ? req.query.hospitalId
            : undefined;
        const summary = await (0, bed_service_1.getBedAvailabilitySummary)(hospitalId);
        return res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        console.error("Get bed availability summary error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getBedByIdController(req, res) {
    try {
        const bed = await (0, bed_service_1.getBedById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: bed,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "BED_NOT_FOUND") {
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
async function updateBedController(req, res) {
    try {
        const bed = await (0, bed_service_1.updateBed)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
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
async function deleteBedController(req, res) {
    try {
        const bed = await (0, bed_service_1.deleteBed)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
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
    }
    catch (error) {
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
