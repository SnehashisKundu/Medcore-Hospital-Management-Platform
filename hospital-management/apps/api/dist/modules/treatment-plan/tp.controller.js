"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreatmentPlanController = createTreatmentPlanController;
exports.getTreatmentPlansController = getTreatmentPlansController;
exports.getTreatmentPlanByIdController = getTreatmentPlanByIdController;
exports.updateTreatmentPlanController = updateTreatmentPlanController;
exports.deleteTreatmentPlanController = deleteTreatmentPlanController;
const tp_service_1 = require("./tp.service");
const aud_service_1 = require("../audit-log/aud.service");
const browser_1 = require("../../generated/prisma/browser");
const TREATMENT_PLAN_STATUSES = Object.values(browser_1.TreatmentPlanStatus);
function isValidTreatmentPlanStatus(status) {
    return (typeof status === "string" &&
        TREATMENT_PLAN_STATUSES.includes(status));
}
async function createTreatmentPlanController(req, res) {
    try {
        const body = req.body ?? {};
        const { encounterId, title, description } = body;
        if (typeof encounterId !== "string" ||
            !encounterId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Encounter ID is required",
            });
        }
        if (typeof title !== "string" ||
            !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Treatment plan title is required",
            });
        }
        if (description !== undefined &&
            typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Treatment plan description must be a string",
            });
        }
        const treatmentPlan = await (0, tp_service_1.createTreatmentPlan)({
            encounterId: encounterId.trim(),
            title,
            description,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: treatmentPlan.encounter.hospitalId,
            action: "CREATE",
            entityType: "TREATMENT_PLAN",
            entityId: treatmentPlan.id,
            metadata: {
                encounterId: treatmentPlan.encounterId,
                title: treatmentPlan.title,
                description: treatmentPlan.description,
                status: treatmentPlan.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Treatment plan created successfully",
            data: treatmentPlan,
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
                    message: "Cannot create treatment plan for a cancelled encounter",
                });
            }
        }
        console.error("Create treatment plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getTreatmentPlansController(req, res) {
    try {
        const encounterId = typeof req.params.encounterId === "string"
            ? req.params.encounterId.trim()
            : undefined;
        const rawStatus = typeof req.query.status === "string"
            ? req.query.status.trim()
            : undefined;
        let status;
        if (rawStatus) {
            if (!isValidTreatmentPlanStatus(rawStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid treatment plan status",
                });
            }
            status = rawStatus;
        }
        const treatmentPlans = await (0, tp_service_1.getTreatmentPlans)(encounterId, status);
        return res.status(200).json({
            success: true,
            data: treatmentPlans,
        });
    }
    catch (error) {
        console.error("Get treatment plans error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getTreatmentPlanByIdController(req, res) {
    try {
        const treatmentPlan = await (0, tp_service_1.getTreatmentPlanById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: treatmentPlan,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "TREATMENT_PLAN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Treatment plan not found",
            });
        }
        console.error("Get treatment plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateTreatmentPlanController(req, res) {
    try {
        const body = req.body ?? {};
        const { title, description, status } = body;
        if (title === undefined &&
            description === undefined &&
            status === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update the treatment plan",
            });
        }
        if (title !== undefined &&
            (typeof title !== "string" ||
                !title.trim())) {
            return res.status(400).json({
                success: false,
                message: "Treatment plan title cannot be empty",
            });
        }
        if (description !== undefined &&
            description !== null &&
            typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Treatment plan description must be a string or null",
            });
        }
        if (status !== undefined &&
            !isValidTreatmentPlanStatus(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid treatment plan status",
            });
        }
        const treatmentPlan = await (0, tp_service_1.updateTreatmentPlan)(req.params.id, {
            title,
            description,
            status,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: treatmentPlan.encounter.hospitalId,
            action: "UPDATE",
            entityType: "TREATMENT_PLAN",
            entityId: treatmentPlan.id,
            metadata: {
                encounterId: treatmentPlan.encounterId,
                title: treatmentPlan.title,
                description: treatmentPlan.description,
                status: treatmentPlan.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Treatment plan updated successfully",
            data: treatmentPlan,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message ===
                "TREATMENT_PLAN_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Treatment plan not found",
                });
            }
            if (error.message ===
                "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot update treatment plan for a cancelled encounter",
                });
            }
            if (error.message ===
                "INVALID_STATUS_TRANSITION") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid treatment plan status transition",
                });
            }
        }
        console.error("Update treatment plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteTreatmentPlanController(req, res) {
    try {
        const treatmentPlan = await (0, tp_service_1.deleteTreatmentPlan)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: treatmentPlan.encounter.hospitalId,
            action: "DELETE",
            entityType: "TREATMENT_PLAN",
            entityId: treatmentPlan.id,
            metadata: {
                encounterId: treatmentPlan.encounterId,
                title: treatmentPlan.title,
                description: treatmentPlan.description,
                status: treatmentPlan.status,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Treatment plan deleted successfully",
            data: treatmentPlan,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "TREATMENT_PLAN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Treatment plan not found",
            });
        }
        console.error("Delete treatment plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
