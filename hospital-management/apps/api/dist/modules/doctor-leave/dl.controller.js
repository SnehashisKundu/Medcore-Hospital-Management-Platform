"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorLeaveController = createDoctorLeaveController;
exports.getDoctorLeavesController = getDoctorLeavesController;
exports.getDoctorLeaveByIdController = getDoctorLeaveByIdController;
exports.updateDoctorLeaveController = updateDoctorLeaveController;
const dl_service_1 = require("./dl.service");
const aud_service_1 = require("../audit-log/aud.service");
const errorMap = {
    INVALID_DATE: [400, "Invalid date format"],
    INVALID_LEAVE_RANGE: [
        400,
        "Leave end date must be later than start date",
    ],
    DOCTOR_HOSPITAL_NOT_FOUND: [
        404,
        "Active doctor hospital assignment not found",
    ],
    DOCTOR_LEAVE_NOT_FOUND: [404, "Doctor leave not found"],
    DOCTOR_LEAVE_CONFLICT: [
        409,
        "Doctor leave conflicts with an existing leave period",
    ],
};
function handleError(error, res, label) {
    if (error instanceof Error && errorMap[error.message]) {
        const [status, message] = errorMap[error.message];
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
async function createDoctorLeaveController(req, res) {
    try {
        const { doctorHospitalId, startAt, endAt, reason, } = req.body ?? {};
        if (!doctorHospitalId || !startAt || !endAt) {
            return res.status(400).json({
                success: false,
                message: "Doctor hospital ID, start date and end date are required",
            });
        }
        const leave = await (0, dl_service_1.createDoctorLeave)({
            doctorHospitalId,
            startAt,
            endAt,
            reason,
        });
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: leave.doctorHospital.hospitalId,
            action: "CREATE",
            entityType: "DOCTOR_LEAVE",
            entityId: leave.id,
            metadata: {
                doctorHospitalId: leave.doctorHospitalId,
                startAt: leave.startAt,
                endAt: leave.endAt,
                reason: leave.reason,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Doctor leave created successfully",
            data: leave,
        });
    }
    catch (error) {
        return handleError(error, res, "Create doctor leave error");
    }
}
async function getDoctorLeavesController(_req, res) {
    try {
        const leaves = await (0, dl_service_1.getDoctorLeaves)();
        return res.status(200).json({
            success: true,
            data: leaves,
        });
    }
    catch (error) {
        return handleError(error, res, "Get doctor leaves error");
    }
}
async function getDoctorLeaveByIdController(req, res) {
    try {
        const leave = await (0, dl_service_1.getDoctorLeaveById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: leave,
        });
    }
    catch (error) {
        return handleError(error, res, "Get doctor leave error");
    }
}
async function updateDoctorLeaveController(req, res) {
    try {
        const leave = await (0, dl_service_1.updateDoctorLeave)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: leave.doctorHospital.hospitalId,
            action: "UPDATE",
            entityType: "DOCTOR_LEAVE",
            entityId: leave.id,
            metadata: {
                doctorHospitalId: leave.doctorHospitalId,
                startAt: leave.startAt,
                endAt: leave.endAt,
                reason: leave.reason,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor leave updated successfully",
            data: leave,
        });
    }
    catch (error) {
        return handleError(error, res, "Update doctor leave error");
    }
}
