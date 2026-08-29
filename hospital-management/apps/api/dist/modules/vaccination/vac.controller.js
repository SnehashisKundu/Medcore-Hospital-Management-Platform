"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVaccinationController = createVaccinationController;
exports.getVaccinationsController = getVaccinationsController;
exports.getVaccinationByIdController = getVaccinationByIdController;
exports.updateVaccinationController = updateVaccinationController;
exports.deleteVaccinationController = deleteVaccinationController;
const vac_service_1 = require("./vac.service");
const aud_service_1 = require("../audit-log/aud.service");
const vaccinationErrorMap = {
    PATIENT_NOT_FOUND: [404, "Patient not found"],
    VACCINATION_NOT_FOUND: [404, "Vaccination not found"],
    INVALID_VACCINATION_DATE: [
        400,
        "Invalid vaccination date format",
    ],
};
function handleVaccinationError(error, res, label) {
    if (error instanceof Error &&
        vaccinationErrorMap[error.message]) {
        const [status, message] = vaccinationErrorMap[error.message];
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
async function createVaccinationController(req, res) {
    try {
        const { patientId, vaccineName, administeredDate, } = req.body ?? {};
        if (!patientId ||
            !vaccineName ||
            !administeredDate) {
            return res.status(400).json({
                success: false,
                message: "patientId, vaccineName and administeredDate are required",
            });
        }
        const vaccination = await (0, vac_service_1.createVaccination)(req.body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PATIENT_VACCINATION",
            entityId: vaccination.id,
            metadata: {
                patientId: vaccination.patientId,
                vaccineName: vaccination.vaccineName,
                administeredDate: vaccination.administeredDate,
                nextDueDate: vaccination.nextDueDate,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Vaccination created successfully",
            data: vaccination,
        });
    }
    catch (error) {
        return handleVaccinationError(error, res, "Create vaccination error");
    }
}
async function getVaccinationsController(_req, res) {
    try {
        const vaccinations = await (0, vac_service_1.getVaccinations)();
        return res.status(200).json({
            success: true,
            data: vaccinations,
        });
    }
    catch (error) {
        return handleVaccinationError(error, res, "Get vaccinations error");
    }
}
async function getVaccinationByIdController(req, res) {
    try {
        const vaccination = await (0, vac_service_1.getVaccinationById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: vaccination,
        });
    }
    catch (error) {
        return handleVaccinationError(error, res, "Get vaccination error");
    }
}
async function updateVaccinationController(req, res) {
    try {
        const vaccination = await (0, vac_service_1.updateVaccination)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PATIENT_VACCINATION",
            entityId: vaccination.id,
            metadata: {
                patientId: vaccination.patientId,
                vaccineName: vaccination.vaccineName,
                administeredDate: vaccination.administeredDate,
                nextDueDate: vaccination.nextDueDate,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Vaccination updated successfully",
            data: vaccination,
        });
    }
    catch (error) {
        return handleVaccinationError(error, res, "Update vaccination error");
    }
}
async function deleteVaccinationController(req, res) {
    try {
        const vaccination = await (0, vac_service_1.deleteVaccination)(req.params.id);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PATIENT_VACCINATION",
            entityId: vaccination.id,
            metadata: {
                patientId: vaccination.patientId,
                vaccineName: vaccination.vaccineName,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Vaccination deleted successfully",
        });
    }
    catch (error) {
        return handleVaccinationError(error, res, "Delete vaccination error");
    }
}
