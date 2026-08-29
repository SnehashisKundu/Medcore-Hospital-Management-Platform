"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorController = createDoctorController;
exports.getDoctorsController = getDoctorsController;
exports.getDoctorByIdController = getDoctorByIdController;
exports.updateDoctorController = updateDoctorController;
exports.deleteDoctorController = deleteDoctorController;
exports.uploadDoctorSignatureController = uploadDoctorSignatureController;
exports.removeDoctorSignatureController = removeDoctorSignatureController;
const fs_1 = __importDefault(require("fs"));
const doc_service_1 = require("./doc.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDoctorController(req, res) {
    try {
        const { userId, medicalRegistrationNumber, } = req.body;
        if (!userId || !medicalRegistrationNumber) {
            return res.status(400).json({
                success: false,
                message: "User ID and medical registration number are required",
            });
        }
        const doctor = await (0, doc_service_1.createDoctor)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DOCTOR",
            entityId: doctor.id,
            metadata: {
                userId: doctor.userId,
                medicalRegistrationNumber: doctor.medicalRegistrationNumber,
                qualification: doctor.qualification,
                bio: doctor.bio,
                priorExperienceYears: doctor.priorExperienceYears,
                isActive: doctor.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: doctor,
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
            error.message === "DOCTOR_PROFILE_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Doctor profile already exists for this user",
            });
        }
        if (error instanceof Error &&
            error.message === "MEDICAL_REGISTRATION_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Medical registration number already exists",
            });
        }
        console.error("Create doctor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorsController(_req, res) {
    try {
        const doctors = await (0, doc_service_1.getDoctors)();
        return res.status(200).json({
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error("Get doctors error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorByIdController(req, res) {
    try {
        const doctor = await (0, doc_service_1.getDoctorById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: doctor,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
        console.error("Get doctor by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDoctorController(req, res) {
    try {
        const doctor = await (0, doc_service_1.updateDoctor)(req.params.id, req.body);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DOCTOR",
            entityId: doctor.id,
            metadata: {
                userId: doctor.userId,
                medicalRegistrationNumber: doctor.medicalRegistrationNumber,
                qualification: doctor.qualification,
                bio: doctor.bio,
                priorExperienceYears: doctor.priorExperienceYears,
                isActive: doctor.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: doctor,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
        if (error instanceof Error &&
            error.message === "MEDICAL_REGISTRATION_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Medical registration number already exists",
            });
        }
        console.error("Update doctor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteDoctorController(req, res) {
    try {
        const doctor = await (0, doc_service_1.deleteDoctor)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "DOCTOR",
            entityId: doctor.id,
            metadata: {
                userId: doctor.userId,
                medicalRegistrationNumber: doctor.medicalRegistrationNumber,
                qualification: doctor.qualification,
                bio: doctor.bio,
                priorExperienceYears: doctor.priorExperienceYears,
                isActive: doctor.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
        console.error("Delete doctor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function uploadDoctorSignatureController(req, res) {
    try {
        const doctorId = req.params.id;
        if (!doctorId || !doctorId.trim()) {
            if (req.file) {
                fs_1.default.unlink(req.file.path, () => { });
            }
            return res.status(400).json({
                success: false,
                message: "Doctor ID is required",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Signature image is required",
            });
        }
        const signatureUrl = `/uploads/signatures/${req.file.filename}`;
        const doctor = await (0, doc_service_1.uploadDoctorSignature)(doctorId.trim(), signatureUrl);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DOCTOR",
            entityId: doctor.id,
            metadata: {
                action: "SIGNATURE_UPLOADED",
                signatureUrl: doctor.signatureUrl,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor signature uploaded successfully",
            data: doctor,
        });
    }
    catch (error) {
        if (req.file) {
            fs_1.default.unlink(req.file.path, () => { });
        }
        if (error instanceof Error &&
            error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
        console.error("Upload doctor signature error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function removeDoctorSignatureController(req, res) {
    try {
        const doctor = await (0, doc_service_1.removeDoctorSignature)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DOCTOR",
            entityId: doctor.id,
            metadata: {
                action: "SIGNATURE_REMOVED",
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor signature removed successfully",
            data: doctor,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "DOCTOR_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found",
                });
            }
            if (error.message === "SIGNATURE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Doctor signature not found",
                });
            }
        }
        console.error("Remove doctor signature error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
