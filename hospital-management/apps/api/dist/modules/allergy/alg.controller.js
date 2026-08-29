"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllergyController = createAllergyController;
exports.getAllergiesController = getAllergiesController;
exports.getAllergyByIdController = getAllergyByIdController;
exports.updateAllergyController = updateAllergyController;
exports.deleteAllergyController = deleteAllergyController;
const alg_service_1 = require("./alg.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createAllergyController(req, res) {
    try {
        const { patientId, allergen } = req.body ?? {};
        if (!patientId || !allergen) {
            return res.status(400).json({
                success: false,
                message: "Patient ID and allergen are required",
            });
        }
        const allergy = await (0, alg_service_1.createAllergy)(req.body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PATIENT_ALLERGY",
            entityId: allergy.id,
            metadata: {
                patientId: allergy.patientId,
                allergen: allergy.allergen,
                severity: allergy.severity,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Allergy created successfully",
            data: allergy,
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
        console.error("Create allergy error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllergiesController(_req, res) {
    try {
        const allergies = await (0, alg_service_1.getAllergies)();
        return res.status(200).json({
            success: true,
            data: allergies,
        });
    }
    catch (error) {
        console.error("Get allergies error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllergyByIdController(req, res) {
    try {
        const allergy = await (0, alg_service_1.getAllergyById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: allergy,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ALLERGY_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Allergy not found",
            });
        }
        console.error("Get allergy error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateAllergyController(req, res) {
    try {
        const allergy = await (0, alg_service_1.updateAllergy)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PATIENT_ALLERGY",
            entityId: allergy.id,
            metadata: {
                patientId: allergy.patientId,
                allergen: allergy.allergen,
                severity: allergy.severity,
                isActive: allergy.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Allergy updated successfully",
            data: allergy,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ALLERGY_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Allergy not found",
            });
        }
        console.error("Update allergy error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteAllergyController(req, res) {
    try {
        const allergy = await (0, alg_service_1.deleteAllergy)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: req.user?.roles?.[0]?.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PATIENT_ALLERGY",
            entityId: allergy.id,
            metadata: {
                patientId: allergy.patientId,
                allergen: allergy.allergen,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Allergy deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "ALLERGY_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Allergy not found",
            });
        }
        console.error("Delete allergy error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
