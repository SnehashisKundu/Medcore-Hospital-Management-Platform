"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosisController = createDiagnosisController;
exports.getDiagnosesController = getDiagnosesController;
exports.getDiagnosisByIdController = getDiagnosisByIdController;
exports.updateDiagnosisController = updateDiagnosisController;
const dia_service_1 = require("./dia.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDiagnosisController(req, res) {
    try {
        const { encounterId, type, diagnosisName, } = req.body;
        if (!encounterId ||
            !type ||
            !diagnosisName) {
            return res.status(400).json({
                success: false,
                message: "Encounter ID, diagnosis type and diagnosis name are required",
            });
        }
        const diagnosis = await (0, dia_service_1.createDiagnosis)(req.body);
        // Get encounter with hospital context
        const diagnosisWithEncounter = await (0, dia_service_1.getDiagnosisById)(diagnosis.id);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: diagnosisWithEncounter.encounter.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DIAGNOSIS",
            entityId: diagnosis.id,
            metadata: {
                encounterId: diagnosis.encounterId,
                type: diagnosis.type,
                diagnosisName: diagnosis.diagnosisName,
                icd10Code: diagnosis.icd10Code,
                isPrimary: diagnosis.isPrimary,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Diagnosis created successfully",
            data: diagnosis,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message ===
                "ENCOUNTER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Encounter not found",
                });
            }
            if (error.message ===
                "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot add diagnosis to a cancelled encounter",
                });
            }
            if (error.message ===
                "DIAGNOSED_BY_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnosed by user not found",
                });
            }
        }
        console.error("Create diagnosis error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosesController(_req, res) {
    try {
        const diagnoses = await (0, dia_service_1.getDiagnoses)();
        return res.status(200).json({
            success: true,
            data: diagnoses,
        });
    }
    catch (error) {
        console.error("Get diagnoses error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosisByIdController(req, res) {
    try {
        const diagnosis = await (0, dia_service_1.getDiagnosisById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: diagnosis,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "DIAGNOSIS_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Diagnosis not found",
            });
        }
        console.error("Get diagnosis error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDiagnosisController(req, res) {
    try {
        const diagnosis = await (0, dia_service_1.updateDiagnosis)(req.params.id, req.body);
        // Get encounter with hospital context
        const diagnosisWithEncounter = await (0, dia_service_1.getDiagnosisById)(diagnosis.id);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: diagnosisWithEncounter.encounter.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DIAGNOSIS",
            entityId: diagnosis.id,
            metadata: {
                encounterId: diagnosis.encounterId,
                type: diagnosis.type,
                diagnosisName: diagnosis.diagnosisName,
                icd10Code: diagnosis.icd10Code,
                isPrimary: diagnosis.isPrimary,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Diagnosis updated successfully",
            data: diagnosis,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message ===
                "DIAGNOSIS_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnosis not found",
                });
            }
            if (error.message ===
                "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot update diagnosis of a cancelled encounter",
                });
            }
        }
        console.error("Update diagnosis error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
