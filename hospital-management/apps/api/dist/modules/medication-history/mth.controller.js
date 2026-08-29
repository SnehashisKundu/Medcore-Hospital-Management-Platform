"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicationHistoryController = createMedicationHistoryController;
exports.getMedicationHistoriesController = getMedicationHistoriesController;
exports.getMedicationHistoryByIdController = getMedicationHistoryByIdController;
exports.updateMedicationHistoryController = updateMedicationHistoryController;
exports.deleteMedicationHistoryController = deleteMedicationHistoryController;
const mth_service_1 = require("./mth.service");
const aud_service_1 = require("../audit-log/aud.service");
const medicationHistoryErrorMap = {
    PATIENT_NOT_FOUND: [404, "Patient not found"],
    MEDICATION_HISTORY_NOT_FOUND: [
        404,
        "Medication history not found",
    ],
};
function handleMedicationHistoryError(error, res, label) {
    if (error instanceof Error &&
        medicationHistoryErrorMap[error.message]) {
        const [status, message] = medicationHistoryErrorMap[error.message];
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
async function createMedicationHistoryController(req, res) {
    try {
        const { patientId, medicineName } = req.body ?? {};
        if (!patientId || !medicineName) {
            return res.status(400).json({
                success: false,
                message: "patientId and medicineName are required",
            });
        }
        const medicationHistory = await (0, mth_service_1.createMedicationHistory)(req.body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PATIENT_MEDICATION_HISTORY",
            entityId: medicationHistory.id,
            metadata: {
                patientId: medicationHistory.patientId,
                medicineName: medicationHistory.medicineName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Medication history created successfully",
            data: medicationHistory,
        });
    }
    catch (error) {
        return handleMedicationHistoryError(error, res, "Create medication history error");
    }
}
async function getMedicationHistoriesController(_req, res) {
    try {
        const medicationHistories = await (0, mth_service_1.getMedicationHistories)();
        return res.status(200).json({
            success: true,
            data: medicationHistories,
        });
    }
    catch (error) {
        return handleMedicationHistoryError(error, res, "Get medication histories error");
    }
}
async function getMedicationHistoryByIdController(req, res) {
    try {
        const medicationHistory = await (0, mth_service_1.getMedicationHistoryById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: medicationHistory,
        });
    }
    catch (error) {
        return handleMedicationHistoryError(error, res, "Get medication history error");
    }
}
async function updateMedicationHistoryController(req, res) {
    try {
        const medicationHistory = await (0, mth_service_1.updateMedicationHistory)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PATIENT_MEDICATION_HISTORY",
            entityId: medicationHistory.id,
            metadata: {
                patientId: medicationHistory.patientId,
                medicineName: medicationHistory.medicineName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Medication history updated successfully",
            data: medicationHistory,
        });
    }
    catch (error) {
        return handleMedicationHistoryError(error, res, "Update medication history error");
    }
}
async function deleteMedicationHistoryController(req, res) {
    try {
        const medicationHistory = await (0, mth_service_1.deleteMedicationHistory)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PATIENT_MEDICATION_HISTORY",
            entityId: medicationHistory.id,
            metadata: {
                patientId: medicationHistory.patientId,
                medicineName: medicationHistory.medicineName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Medication history deleted successfully",
        });
    }
    catch (error) {
        return handleMedicationHistoryError(error, res, "Delete medication history error");
    }
}
