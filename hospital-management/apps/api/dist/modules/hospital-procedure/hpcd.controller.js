"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHospitalProcedureController = createHospitalProcedureController;
exports.getHospitalProceduresController = getHospitalProceduresController;
exports.getHospitalProcedureByIdController = getHospitalProcedureByIdController;
exports.updateHospitalProcedureController = updateHospitalProcedureController;
exports.deleteHospitalProcedureController = deleteHospitalProcedureController;
const hpcd_service_1 = require("./hpcd.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createHospitalProcedureController(req, res) {
    try {
        const body = req.body ?? {};
        const { hospitalId, procedureId, basePrice, estimatedDurationMinutes, isAvailable, } = body;
        if (!hospitalId ||
            !procedureId ||
            basePrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID, procedure ID and base price are required",
            });
        }
        const hospitalProcedure = await (0, hpcd_service_1.createHospitalProcedure)({
            hospitalId,
            procedureId,
            basePrice: Number(basePrice),
            estimatedDurationMinutes: estimatedDurationMinutes !== undefined
                ? Number(estimatedDurationMinutes)
                : undefined,
            isAvailable,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: hospitalProcedure.hospitalId,
            action: "CREATE",
            entityType: "HOSPITAL_PROCEDURE",
            entityId: hospitalProcedure.id,
            metadata: {
                procedureId: hospitalProcedure.procedureId,
                basePrice: hospitalProcedure.basePrice.toString(),
                estimatedDurationMinutes: hospitalProcedure.estimatedDurationMinutes,
                isAvailable: hospitalProcedure.isAvailable,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Hospital procedure created successfully",
            data: hospitalProcedure,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                HOSPITAL_NOT_FOUND: [
                    404,
                    "Hospital not found",
                ],
                PROCEDURE_NOT_FOUND: [
                    404,
                    "Procedure not found",
                ],
                HOSPITAL_PROCEDURE_ALREADY_EXISTS: [
                    409,
                    "This procedure is already assigned to this hospital",
                ],
                INVALID_BASE_PRICE: [
                    400,
                    "Base price cannot be negative",
                ],
                INVALID_DURATION: [
                    400,
                    "Estimated duration cannot be negative",
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
        console.error("Create hospital procedure error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getHospitalProceduresController(req, res) {
    try {
        const hospitalId = typeof req.query.hospitalId === "string"
            ? req.query.hospitalId
            : undefined;
        const procedureId = typeof req.query.procedureId === "string"
            ? req.query.procedureId
            : undefined;
        const latitude = typeof req.query.latitude === "string"
            ? Number(req.query.latitude)
            : undefined;
        const longitude = typeof req.query.longitude === "string"
            ? Number(req.query.longitude)
            : undefined;
        const sort = typeof req.query.sort === "string"
            ? req.query.sort
            : undefined;
        if (latitude !== undefined &&
            Number.isNaN(latitude)) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be a valid number",
            });
        }
        if (longitude !== undefined &&
            Number.isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be a valid number",
            });
        }
        if ((latitude !== undefined &&
            longitude === undefined) ||
            (latitude === undefined &&
                longitude !== undefined)) {
            return res.status(400).json({
                success: false,
                message: "Both latitude and longitude are required for distance calculation",
            });
        }
        if (latitude !== undefined &&
            (latitude < -90 || latitude > 90)) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be between -90 and 90",
            });
        }
        if (longitude !== undefined &&
            (longitude < -180 || longitude > 180)) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be between -180 and 180",
            });
        }
        if (sort !== undefined &&
            sort !== "price" &&
            sort !== "distance") {
            return res.status(400).json({
                success: false,
                message: "Sort must be either price or distance",
            });
        }
        if (sort === "distance" &&
            (latitude === undefined ||
                longitude === undefined)) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required when sorting by distance",
            });
        }
        const hospitalProcedures = await (0, hpcd_service_1.getHospitalProcedures)(hospitalId, procedureId, latitude, longitude, sort);
        return res.status(200).json({
            success: true,
            data: hospitalProcedures,
        });
    }
    catch (error) {
        console.error("Get hospital procedures error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getHospitalProcedureByIdController(req, res) {
    try {
        const hospitalProcedure = await (0, hpcd_service_1.getHospitalProcedureById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: hospitalProcedure,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "HOSPITAL_PROCEDURE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Hospital procedure not found",
            });
        }
        console.error("Get hospital procedure error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateHospitalProcedureController(req, res) {
    try {
        const body = req.body ?? {};
        const hospitalProcedure = await (0, hpcd_service_1.updateHospitalProcedure)(req.params.id, {
            basePrice: body.basePrice !== undefined
                ? Number(body.basePrice)
                : undefined,
            estimatedDurationMinutes: body.estimatedDurationMinutes !== undefined
                ? Number(body.estimatedDurationMinutes)
                : undefined,
            isAvailable: body.isAvailable,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: hospitalProcedure.hospitalId,
            action: "UPDATE",
            entityType: "HOSPITAL_PROCEDURE",
            entityId: hospitalProcedure.id,
            metadata: {
                procedureId: hospitalProcedure.procedureId,
                basePrice: hospitalProcedure.basePrice.toString(),
                estimatedDurationMinutes: hospitalProcedure.estimatedDurationMinutes,
                isAvailable: hospitalProcedure.isAvailable,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Hospital procedure updated successfully",
            data: hospitalProcedure,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                HOSPITAL_PROCEDURE_NOT_FOUND: [
                    404,
                    "Hospital procedure not found",
                ],
                INVALID_BASE_PRICE: [
                    400,
                    "Base price cannot be negative",
                ],
                INVALID_DURATION: [
                    400,
                    "Estimated duration cannot be negative",
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
        console.error("Update hospital procedure error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteHospitalProcedureController(req, res) {
    try {
        const hospitalProcedure = await (0, hpcd_service_1.deleteHospitalProcedure)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: hospitalProcedure.hospitalId,
            action: "DELETE",
            entityType: "HOSPITAL_PROCEDURE",
            entityId: hospitalProcedure.id,
            metadata: {
                procedureId: hospitalProcedure.procedureId,
                basePrice: hospitalProcedure.basePrice.toString(),
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Hospital procedure deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "HOSPITAL_PROCEDURE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Hospital procedure not found",
            });
        }
        console.error("Delete hospital procedure error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
