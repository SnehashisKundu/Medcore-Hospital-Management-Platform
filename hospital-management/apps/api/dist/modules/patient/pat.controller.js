"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatientController = createPatientController;
exports.getPatientsController = getPatientsController;
exports.getPatientByIdController = getPatientByIdController;
exports.updatePatientController = updatePatientController;
exports.deletePatientController = deletePatientController;
const pat_service_1 = require("./pat.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createPatientController(req, res) {
    try {
        const { firstName } = req.body;
        if (!firstName) {
            return res.status(400).json({
                success: false,
                message: "First name is required",
            });
        }
        const patient = await (0, pat_service_1.createPatient)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PATIENT",
            entityId: patient.id,
            metadata: {
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (error instanceof Error &&
            error.message === "PATIENT_PROFILE_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Patient profile already exists for this user",
            });
        }
        console.error("Create patient error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPatientsController(_req, res) {
    try {
        const patients = await (0, pat_service_1.getPatients)();
        return res.status(200).json({
            success: true,
            data: patients,
        });
    }
    catch (error) {
        console.error("Get patients error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPatientByIdController(req, res) {
    try {
        const patient = await (0, pat_service_1.getPatientById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: patient,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        console.error("Get patient error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updatePatientController(req, res) {
    try {
        const patient = await (0, pat_service_1.updatePatient)(req.params.id, req.body);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PATIENT",
            entityId: patient.id,
            metadata: {
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            data: patient,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        console.error("Update patient error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deletePatientController(req, res) {
    try {
        const patient = await (0, pat_service_1.deletePatient)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PATIENT",
            entityId: patient.id,
            metadata: {
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Patient deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        console.error("Delete patient error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
