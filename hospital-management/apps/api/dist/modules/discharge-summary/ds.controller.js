"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDischargeSummaryController = createDischargeSummaryController;
exports.getDischargeSummariesController = getDischargeSummariesController;
exports.getDischargeSummaryByIdController = getDischargeSummaryByIdController;
const ds_service_1 = require("./ds.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDischargeSummaryController(req, res) {
    try {
        const body = req.body ?? {};
        const { admissionId, finalDiagnosis, hospitalCourse, conditionAtDischarge, dischargeAdvice, dietAdvice, activityAdvice, followUpDate, } = body;
        if (!admissionId) {
            return res.status(400).json({
                success: false,
                message: "Admission ID is required",
            });
        }
        if (followUpDate !== undefined &&
            Number.isNaN(new Date(followUpDate).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Follow-up date must be valid",
            });
        }
        const dischargeSummary = await (0, ds_service_1.createDischargeSummary)({
            admissionId,
            preparedById: req.user.id,
            finalDiagnosis,
            hospitalCourse,
            conditionAtDischarge,
            dischargeAdvice,
            dietAdvice,
            activityAdvice,
            followUpDate,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: dischargeSummary.admission.hospitalId,
            action: "CREATE",
            entityType: "DISCHARGE_SUMMARY",
            entityId: dischargeSummary.id,
            metadata: {
                admissionId,
                admissionNumber: dischargeSummary.admission.admissionNumber,
                patientId: dischargeSummary.admission.patientId,
                finalDiagnosis: dischargeSummary.finalDiagnosis,
                conditionAtDischarge: dischargeSummary.conditionAtDischarge,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Patient discharged successfully",
            data: dischargeSummary,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const errors = {
                ADMISSION_NOT_FOUND: {
                    status: 404,
                    message: "Admission not found",
                },
                ADMISSION_NOT_ACTIVE: {
                    status: 400,
                    message: "Admission is not active",
                },
                DISCHARGE_SUMMARY_ALREADY_EXISTS: {
                    status: 409,
                    message: "Discharge summary already exists for this admission",
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
        console.error("Create discharge summary error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDischargeSummariesController(req, res) {
    try {
        const admissionId = typeof req.query.admissionId === "string"
            ? req.query.admissionId
            : undefined;
        const dischargeSummaries = await (0, ds_service_1.getDischargeSummaries)(admissionId);
        return res.status(200).json({
            success: true,
            data: dischargeSummaries,
        });
    }
    catch (error) {
        console.error("Get discharge summaries error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDischargeSummaryByIdController(req, res) {
    try {
        const dischargeSummary = await (0, ds_service_1.getDischargeSummaryById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: dischargeSummary,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "DISCHARGE_SUMMARY_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Discharge summary not found",
            });
        }
        console.error("Get discharge summary error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
