"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHospitalController = createHospitalController;
exports.getHospitalsController = getHospitalsController;
exports.getNearbyHospitalsController = getNearbyHospitalsController;
exports.getHospitalByIdController = getHospitalByIdController;
exports.updateHospitalController = updateHospitalController;
exports.verifyHospitalController = verifyHospitalController;
exports.deleteHospitalController = deleteHospitalController;
const hs_service_1 = require("./hs.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createHospitalController(req, res) {
    try {
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Hospital name and code are required",
            });
        }
        const hospital = await (0, hs_service_1.createHospital)(req.body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: hospital.id,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "HOSPITAL",
            entityId: hospital.id,
            metadata: {
                name: hospital.name,
                code: hospital.code,
                email: hospital.email,
                phone: hospital.phone,
                city: hospital.city,
                state: hospital.state,
                country: hospital.country,
                registrationNumber: hospital.registrationNumber,
                isActive: hospital.isActive,
                isVerified: hospital.isVerified,
                latitude: hospital.latitude,
                longitude: hospital.longitude,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            data: hospital,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "HOSPITAL_CODE_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Hospital code already exists",
            });
        }
        console.error("Create hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getHospitalsController(_req, res) {
    try {
        const hospitals = await (0, hs_service_1.getHospitals)();
        return res.status(200).json({
            success: true,
            data: hospitals,
        });
    }
    catch (error) {
        console.error("Get hospitals error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getNearbyHospitalsController(req, res) {
    try {
        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);
        const availableOnly = req.query.availableOnly === "true";
        if (Number.isNaN(latitude) ||
            Number.isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude are required",
            });
        }
        if (latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude range",
            });
        }
        const hospitals = await (0, hs_service_1.getNearbyHospitals)(latitude, longitude, availableOnly);
        return res.status(200).json({
            success: true,
            data: hospitals,
        });
    }
    catch (error) {
        console.error("Get nearby hospitals error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getHospitalByIdController(req, res) {
    try {
        const hospital = await (0, hs_service_1.getHospitalById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: hospital,
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
        console.error("Get hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateHospitalController(req, res) {
    try {
        const hospital = await (0, hs_service_1.updateHospital)(req.params.id, req.body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: hospital.id,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "HOSPITAL",
            entityId: hospital.id,
            metadata: {
                name: hospital.name,
                code: hospital.code,
                email: hospital.email,
                phone: hospital.phone,
                city: hospital.city,
                state: hospital.state,
                country: hospital.country,
                registrationNumber: hospital.registrationNumber,
                isActive: hospital.isActive,
                isVerified: hospital.isVerified,
                latitude: hospital.latitude,
                longitude: hospital.longitude,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            data: hospital,
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
            if (error.message === "HOSPITAL_CODE_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Hospital code already exists",
                });
            }
        }
        console.error("Update hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function verifyHospitalController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const hospital = await (0, hs_service_1.verifyHospital)(req.params.id, req.user.id);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: hospital.id,
            userId: req.user.id,
            action: "UPDATE",
            entityType: "HOSPITAL",
            entityId: hospital.id,
            metadata: {
                name: hospital.name,
                code: hospital.code,
                isVerified: hospital.isVerified,
                verifiedAt: hospital.verifiedAt,
                verifiedById: hospital.verifiedById,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Hospital verified successfully",
            data: hospital,
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
            if (error.message === "HOSPITAL_ALREADY_VERIFIED") {
                return res.status(409).json({
                    success: false,
                    message: "Hospital is already verified",
                });
            }
        }
        console.error("Verify hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteHospitalController(req, res) {
    try {
        const hospital = await (0, hs_service_1.deleteHospital)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: hospital.id,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "HOSPITAL",
            entityId: hospital.id,
            metadata: {
                name: hospital.name,
                code: hospital.code,
                email: hospital.email,
                phone: hospital.phone,
                city: hospital.city,
                state: hospital.state,
                country: hospital.country,
                registrationNumber: hospital.registrationNumber,
                isActive: hospital.isActive,
                isVerified: hospital.isVerified,
                latitude: hospital.latitude,
                longitude: hospital.longitude,
                deletedAt: hospital.deletedAt,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Hospital deleted successfully",
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
        console.error("Delete hospital error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
