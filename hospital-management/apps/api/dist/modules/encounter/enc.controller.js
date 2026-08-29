"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEncounterController = createEncounterController;
exports.getEncountersController = getEncountersController;
exports.getEncounterByIdController = getEncounterByIdController;
exports.updateEncounterController = updateEncounterController;
exports.deleteEncounterController = deleteEncounterController;
const enc_service_1 = require("./enc.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createEncounterController(req, res) {
    try {
        const { hospitalId, patientId, encounterNumber, consultationType, } = req.body;
        if (!hospitalId ||
            !patientId ||
            !encounterNumber ||
            !consultationType) {
            return res.status(400).json({
                success: false,
                message: "Required encounter fields are missing",
            });
        }
        const encounter = await (0, enc_service_1.createEncounter)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: encounter.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "ENCOUNTER",
            entityId: encounter.id,
            metadata: {
                encounterNumber: encounter.encounterNumber,
                consultationType: encounter.consultationType,
                status: encounter.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Encounter created successfully",
            data: encounter,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }
        if (error instanceof Error &&
            error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        if (error instanceof Error &&
            error.message === "APPOINTMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }
        if (error instanceof Error &&
            error.message === "ENCOUNTER_ALREADY_EXISTS_FOR_APPOINTMENT") {
            return res.status(409).json({
                success: false,
                message: "An encounter already exists for this appointment",
            });
        }
        if (error instanceof Error &&
            error.message === "ENCOUNTER_ALREADY_EXISTS_FOR_EMERGENCY_CASE") {
            return res.status(409).json({
                success: false,
                message: "An encounter already exists for this emergency case",
            });
        }
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor is not assigned to this hospital",
            });
        }
        if (error instanceof Error &&
            error.message === "DOCTOR_ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor department assignment not found",
            });
        }
        if (error instanceof Error &&
            error.message === "ENCOUNTER_NUMBER_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Encounter number already exists",
            });
        }
        console.error("Create encounter error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getEncountersController(_req, res) {
    try {
        const encounters = await (0, enc_service_1.getEncounters)();
        return res.status(200).json({
            success: true,
            data: encounters,
        });
    }
    catch (error) {
        console.error("Get encounters error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getEncounterByIdController(req, res) {
    try {
        const encounter = await (0, enc_service_1.getEncounterById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: encounter,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ENCOUNTER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Encounter not found",
            });
        }
        console.error("Get encounter error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateEncounterController(req, res) {
    try {
        const encounter = await (0, enc_service_1.updateEncounter)(req.params.id, req.body);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: encounter.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "ENCOUNTER",
            entityId: encounter.id,
            metadata: {
                encounterNumber: encounter.encounterNumber,
                consultationType: encounter.consultationType,
                status: encounter.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Encounter updated successfully",
            data: encounter,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ENCOUNTER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Encounter not found",
            });
        }
        console.error("Update encounter error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteEncounterController(req, res) {
    try {
        const encounter = await (0, enc_service_1.deleteEncounter)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: encounter.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "ENCOUNTER",
            entityId: encounter.id,
            metadata: {
                encounterNumber: encounter.encounterNumber,
                consultationType: encounter.consultationType,
                status: encounter.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Encounter cancelled successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ENCOUNTER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Encounter not found",
            });
        }
        console.error("Delete encounter error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
