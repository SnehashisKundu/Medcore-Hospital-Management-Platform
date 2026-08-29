"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpecializationController = createSpecializationController;
exports.getSpecializationsController = getSpecializationsController;
exports.getSpecializationByIdController = getSpecializationByIdController;
const spc_service_1 = require("./spc.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createSpecializationController(req, res) {
    try {
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Specialization name and code are required",
            });
        }
        const specialization = await (0, spc_service_1.createSpecialization)(req.body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "SPECIALIZATION",
            entityId: specialization.id,
            metadata: {
                name: specialization.name,
                code: specialization.code,
                description: specialization.description,
                isActive: specialization.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Specialization created successfully",
            data: specialization,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SPECIALIZATION_CODE_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Specialization code already exists",
            });
        }
        console.error("Create specialization error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getSpecializationsController(_req, res) {
    try {
        const specializations = await (0, spc_service_1.getSpecializations)();
        return res.status(200).json({
            success: true,
            data: specializations,
        });
    }
    catch (error) {
        console.error("Get specializations error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getSpecializationByIdController(req, res) {
    try {
        const specialization = await (0, spc_service_1.getSpecializationById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: specialization,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SPECIALIZATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Specialization not found",
            });
        }
        console.error("Get specialization error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
