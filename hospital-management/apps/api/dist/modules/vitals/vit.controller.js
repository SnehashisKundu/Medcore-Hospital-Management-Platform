"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVitalController = createVitalController;
exports.getVitalsController = getVitalsController;
exports.getVitalByIdController = getVitalByIdController;
exports.updateVitalController = updateVitalController;
const vit_service_1 = require("./vit.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createVitalController(req, res) {
    try {
        const { encounterId } = req.body;
        if (!encounterId) {
            return res.status(400).json({
                success: false,
                message: "Encounter ID is required",
            });
        }
        const vital = await (0, vit_service_1.createVital)(req.body);
        // Get encounter with hospital context
        const vitalWithEncounter = await (0, vit_service_1.getVitalById)(vital.id);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: vitalWithEncounter.encounter.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "VITAL",
            entityId: vital.id,
            metadata: {
                encounterId: vital.encounterId,
                temperatureCelsius: vital.temperatureCelsius,
                pulseRate: vital.pulseRate,
                oxygenSaturation: vital.oxygenSaturation,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Vital created successfully",
            data: vital,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "ENCOUNTER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Encounter not found",
                });
            }
            if (error.message === "RECORDER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Recorder user not found",
                });
            }
        }
        console.error("Create vital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getVitalsController(_req, res) {
    try {
        const vitals = await (0, vit_service_1.getVitals)();
        return res.status(200).json({
            success: true,
            data: vitals,
        });
    }
    catch (error) {
        console.error("Get vitals error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getVitalByIdController(req, res) {
    try {
        const vital = await (0, vit_service_1.getVitalById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: vital,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "VITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Vital not found",
            });
        }
        console.error("Get vital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateVitalController(req, res) {
    try {
        const vital = await (0, vit_service_1.updateVital)(req.params.id, req.body);
        // Get encounter with hospital context
        const vitalWithEncounter = await (0, vit_service_1.getVitalById)(vital.id);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: vitalWithEncounter.encounter.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "VITAL",
            entityId: vital.id,
            metadata: {
                encounterId: vital.encounterId,
                temperatureCelsius: vital.temperatureCelsius,
                pulseRate: vital.pulseRate,
                oxygenSaturation: vital.oxygenSaturation,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Vital updated successfully",
            data: vital,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "VITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Vital not found",
            });
        }
        console.error("Update vital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
