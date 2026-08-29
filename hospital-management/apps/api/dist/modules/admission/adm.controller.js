"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmissionController = createAdmissionController;
exports.getAdmissionsController = getAdmissionsController;
exports.getAdmissionByIdController = getAdmissionByIdController;
exports.updateAdmissionController = updateAdmissionController;
exports.deleteAdmissionController = deleteAdmissionController;
const adm_service_1 = require("./adm.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createAdmissionController(req, res) {
    try {
        const { hospitalId, patientId, encounterId, encounter_id, admissionNumber, reason, } = req.body ?? {};
        const resolvedEncounterId = encounterId ?? encounter_id ?? undefined;
        if (!hospitalId || !patientId || !admissionNumber) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID, patient ID and admission number are required",
            });
        }
        const admission = await (0, adm_service_1.createAdmission)({
            hospitalId,
            patientId,
            encounterId: resolvedEncounterId,
            admissionNumber,
            reason,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: admission.hospitalId,
            action: "CREATE",
            entityType: "ADMISSION",
            entityId: admission.id,
            metadata: {
                patientId: admission.patientId,
                encounterId: admission.encounterId,
                admissionNumber: admission.admissionNumber,
                reason: admission.reason,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Admission created successfully",
            data: admission,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const errors = {
                HOSPITAL_NOT_FOUND: {
                    status: 404,
                    message: "Hospital not found",
                },
                PATIENT_NOT_FOUND: {
                    status: 404,
                    message: "Patient not found",
                },
                ENCOUNTER_NOT_FOUND: {
                    status: 404,
                    message: "Encounter not found",
                },
                ADMISSION_NUMBER_ALREADY_EXISTS: {
                    status: 409,
                    message: "Admission number already exists in this hospital",
                },
            };
            const knownError = errors[error.message];
            if (knownError) {
                return res.status(knownError.status).json({
                    success: false,
                    message: knownError.message,
                });
            }
        }
        console.error("Create admission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAdmissionsController(req, res) {
    try {
        const hospitalId = typeof req.query.hospitalId === "string"
            ? req.query.hospitalId
            : undefined;
        const patientId = typeof req.query.patientId === "string"
            ? req.query.patientId
            : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const admissions = await (0, adm_service_1.getAdmissions)(hospitalId, patientId, status);
        return res.status(200).json({
            success: true,
            data: admissions,
        });
    }
    catch (error) {
        console.error("Get admissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAdmissionByIdController(req, res) {
    try {
        const admission = await (0, adm_service_1.getAdmissionById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: admission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ADMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Admission not found",
            });
        }
        console.error("Get admission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateAdmissionController(req, res) {
    try {
        const admission = await (0, adm_service_1.updateAdmission)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: admission.hospitalId,
            action: "UPDATE",
            entityType: "ADMISSION",
            entityId: admission.id,
            metadata: {
                status: admission.status,
                reason: admission.reason,
                dischargedAt: admission.dischargedAt,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Admission updated successfully",
            data: admission,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ADMISSION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Admission not found",
            });
        }
        console.error("Update admission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteAdmissionController(req, res) {
    try {
        const admission = await (0, adm_service_1.deleteAdmission)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: admission.hospitalId,
            action: "DELETE",
            entityType: "ADMISSION",
            entityId: admission.id,
            metadata: {
                patientId: admission.patientId,
                admissionNumber: admission.admissionNumber,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Admission deleted successfully",
            data: admission,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "ADMISSION_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Admission not found",
                });
            }
            if (error.message === "ACTIVE_ADMISSION_CANNOT_BE_DELETED") {
                return res.status(400).json({
                    success: false,
                    message: "Active admission cannot be deleted",
                });
            }
        }
        console.error("Delete admission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
