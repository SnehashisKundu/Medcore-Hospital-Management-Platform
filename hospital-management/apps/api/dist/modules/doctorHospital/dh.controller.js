"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorHospitalController = createDoctorHospitalController;
exports.getDoctorHospitalsController = getDoctorHospitalsController;
exports.getDoctorHospitalByIdController = getDoctorHospitalByIdController;
exports.updateDoctorHospitalController = updateDoctorHospitalController;
exports.deleteDoctorHospitalController = deleteDoctorHospitalController;
const dh_service_1 = require("./dh.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDoctorHospitalController(req, res) {
    try {
        const { doctorId, hospitalId } = req.body;
        if (!doctorId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID and hospital ID are required",
            });
        }
        const doctorHospital = await (0, dh_service_1.createDoctorHospital)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DOCTOR_HOSPITAL",
            entityId: doctorHospital.id,
            metadata: {
                doctorId: doctorHospital.doctorId,
                hospitalId: doctorHospital.hospitalId,
                joinedAt: doctorHospital.joinedAt,
                isActive: doctorHospital.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Doctor assigned to hospital successfully",
            data: doctorHospital,
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
            error.message === "HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Doctor is already assigned to this hospital",
            });
        }
        console.error("Create doctor hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorHospitalsController(_req, res) {
    try {
        const doctorHospitals = await (0, dh_service_1.getDoctorHospitals)();
        return res.status(200).json({
            success: true,
            data: doctorHospitals,
        });
    }
    catch (error) {
        console.error("Get doctor hospitals error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorHospitalByIdController(req, res) {
    try {
        const doctorHospital = await (0, dh_service_1.getDoctorHospitalById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: doctorHospital,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor hospital assignment not found",
            });
        }
        console.error("Get doctor hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDoctorHospitalController(req, res) {
    try {
        const doctorHospital = await (0, dh_service_1.updateDoctorHospital)(req.params.id, req.body);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DOCTOR_HOSPITAL",
            entityId: doctorHospital.id,
            metadata: {
                doctorId: doctorHospital.doctorId,
                hospitalId: doctorHospital.hospitalId,
                joinedAt: doctorHospital.joinedAt,
                isActive: doctorHospital.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor hospital assignment updated successfully",
            data: doctorHospital,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor hospital assignment not found",
            });
        }
        console.error("Update doctor hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteDoctorHospitalController(req, res) {
    try {
        const doctorHospital = await (0, dh_service_1.deleteDoctorHospital)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: doctorHospital.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "DOCTOR_HOSPITAL",
            entityId: doctorHospital.id,
            metadata: {
                doctorId: doctorHospital.doctorId,
                hospitalId: doctorHospital.hospitalId,
                joinedAt: doctorHospital.joinedAt,
                isActive: doctorHospital.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor removed from hospital successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DOCTOR_HOSPITAL_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor hospital assignment not found",
            });
        }
        console.error("Delete doctor hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
