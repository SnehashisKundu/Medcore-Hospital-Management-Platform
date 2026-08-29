"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWardController = createWardController;
exports.getWardsController = getWardsController;
exports.getWardByIdController = getWardByIdController;
exports.updateWardController = updateWardController;
exports.deleteWardController = deleteWardController;
const ward_service_1 = require("./ward.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createWardController(req, res) {
    try {
        const body = req.body ?? {};
        const { hospitalId, name, code, type, floor, } = body;
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            });
        }
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Ward name is required",
            });
        }
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Ward code is required",
            });
        }
        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Ward type is required",
            });
        }
        if (floor === undefined || floor === null) {
            return res.status(400).json({
                success: false,
                message: "Floor is required",
            });
        }
        const ward = await (0, ward_service_1.createWard)(body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: ward.hospitalId,
            action: "CREATE",
            entityType: "WARD",
            entityId: ward.id,
            metadata: {
                name: ward.name,
                code: ward.code,
                type: ward.type,
                floor: ward.floor ?? null,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Ward created successfully",
            data: ward,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "HOSPITAL_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Hospital not found",
                });
            }
            if (error.message === "WARD_CODE_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Ward code already exists in this hospital",
                });
            }
        }
        console.error("Create ward error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getWardsController(req, res) {
    try {
        const hospitalId = typeof req.query.hospitalId === "string"
            ? req.query.hospitalId
            : undefined;
        const wards = await (0, ward_service_1.getWards)(hospitalId);
        return res.status(200).json({
            success: true,
            data: wards,
        });
    }
    catch (error) {
        console.error("Get wards error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getWardByIdController(req, res) {
    try {
        const ward = await (0, ward_service_1.getWardById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: ward,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "WARD_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Ward not found",
            });
        }
        console.error("Get ward error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateWardController(req, res) {
    try {
        const ward = await (0, ward_service_1.updateWard)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: ward.hospitalId,
            action: "UPDATE",
            entityType: "WARD",
            entityId: ward.id,
            metadata: {
                name: ward.name,
                code: ward.code,
                type: ward.type,
                floor: ward.floor ?? null,
                isActive: ward.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Ward updated successfully",
            data: ward,
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
            if (error.message === "WARD_CODE_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Ward code already exists in this hospital",
                });
            }
        }
        console.error("Update ward error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteWardController(req, res) {
    try {
        const ward = await (0, ward_service_1.deleteWard)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: ward.hospitalId,
            action: "DELETE",
            entityType: "WARD",
            entityId: ward.id,
            metadata: {
                name: ward.name,
                code: ward.code,
                type: ward.type,
                floor: ward.floor ?? null,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Ward deleted successfully",
            data: ward,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "WARD_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Ward not found",
            });
        }
        console.error("Delete ward error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
