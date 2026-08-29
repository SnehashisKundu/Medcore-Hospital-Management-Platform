"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFamilyHistoryController = createFamilyHistoryController;
exports.getFamilyHistoriesController = getFamilyHistoriesController;
exports.getFamilyHistoryByIdController = getFamilyHistoryByIdController;
exports.updateFamilyHistoryController = updateFamilyHistoryController;
exports.deleteFamilyHistoryController = deleteFamilyHistoryController;
const fh_service_1 = require("./fh.service");
const aud_service_1 = require("../audit-log/aud.service");
const familyHistoryErrorMap = {
    PATIENT_NOT_FOUND: [404, "Patient not found"],
    FAMILY_HISTORY_NOT_FOUND: [404, "Family history not found"],
};
function handleFamilyHistoryError(error, res, label) {
    if (error instanceof Error &&
        familyHistoryErrorMap[error.message]) {
        const [status, message] = familyHistoryErrorMap[error.message];
        return res.status(status).json({
            success: false,
            message,
        });
    }
    console.error(`${label}:`, error);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
async function createFamilyHistoryController(req, res) {
    try {
        const { patientId } = req.body ?? {};
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required",
            });
        }
        const familyHistory = await (0, fh_service_1.createFamilyHistory)(req.body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PATIENT_FAMILY_HISTORY",
            entityId: familyHistory.id,
            metadata: {
                patientId: familyHistory.patientId,
                diabetes: familyHistory.diabetes,
                hypertension: familyHistory.hypertension,
                cancer: familyHistory.cancer,
                cardiac: familyHistory.cardiac,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Family history created successfully",
            data: familyHistory,
        });
    }
    catch (error) {
        return handleFamilyHistoryError(error, res, "Create family history error");
    }
}
async function getFamilyHistoriesController(_req, res) {
    try {
        const familyHistories = await (0, fh_service_1.getFamilyHistories)();
        return res.status(200).json({
            success: true,
            data: familyHistories,
        });
    }
    catch (error) {
        return handleFamilyHistoryError(error, res, "Get family histories error");
    }
}
async function getFamilyHistoryByIdController(req, res) {
    try {
        const familyHistory = await (0, fh_service_1.getFamilyHistoryById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: familyHistory,
        });
    }
    catch (error) {
        return handleFamilyHistoryError(error, res, "Get family history error");
    }
}
async function updateFamilyHistoryController(req, res) {
    try {
        const familyHistory = await (0, fh_service_1.updateFamilyHistory)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PATIENT_FAMILY_HISTORY",
            entityId: familyHistory.id,
            metadata: {
                patientId: familyHistory.patientId,
                diabetes: familyHistory.diabetes,
                hypertension: familyHistory.hypertension,
                cancer: familyHistory.cancer,
                cardiac: familyHistory.cardiac,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Family history updated successfully",
            data: familyHistory,
        });
    }
    catch (error) {
        return handleFamilyHistoryError(error, res, "Update family history error");
    }
}
async function deleteFamilyHistoryController(req, res) {
    try {
        const familyHistory = await (0, fh_service_1.deleteFamilyHistory)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PATIENT_FAMILY_HISTORY",
            entityId: familyHistory.id,
            metadata: {
                patientId: familyHistory.patientId,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Family history deleted successfully",
        });
    }
    catch (error) {
        return handleFamilyHistoryError(error, res, "Delete family history error");
    }
}
