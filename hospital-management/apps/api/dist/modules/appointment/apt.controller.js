"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointmentController = createAppointmentController;
exports.getAppointmentsController = getAppointmentsController;
exports.getAppointmentByIdController = getAppointmentByIdController;
exports.updateAppointmentController = updateAppointmentController;
exports.deleteAppointmentController = deleteAppointmentController;
const apt_service_1 = require("./apt.service");
const aud_service_1 = require("../audit-log/aud.service");
const appointmentErrorMap = {
    HOSPITAL_NOT_FOUND: [404, "Hospital not found"],
    PATIENT_NOT_FOUND: [404, "Patient not found"],
    DOCTOR_HOSPITAL_NOT_FOUND: [
        404,
        "Doctor is not assigned to this hospital",
    ],
    DOCTOR_ASSIGNMENT_NOT_FOUND: [
        404,
        "Doctor department assignment not found",
    ],
    APPOINTMENT_NOT_FOUND: [
        404,
        "Appointment not found",
    ],
    APPOINTMENT_NUMBER_EXISTS: [
        409,
        "Appointment number already exists",
    ],
    INVALID_APPOINTMENT_DATE: [
        400,
        "Invalid appointment date format",
    ],
    INVALID_APPOINTMENT_RANGE: [
        400,
        "Appointment end time must be later than start time",
    ],
    APPOINTMENT_MUST_BE_SAME_DAY: [
        400,
        "Appointment must start and end on the same day",
    ],
    DOCTOR_NOT_AVAILABLE_ON_DAY: [
        409,
        "Doctor is not available on the selected day",
    ],
    INVALID_DOCTOR_SCHEDULE_SLOT: [
        409,
        "Selected appointment time is not a valid doctor schedule slot",
    ],
    DOCTOR_ON_LEAVE: [
        409,
        "Doctor is on leave during the selected appointment time",
    ],
    APPOINTMENT_SLOT_ALREADY_BOOKED: [
        409,
        "Doctor already has an appointment during the selected time slot",
    ],
};
function handleAppointmentError(error, res, label) {
    if (error instanceof Error &&
        appointmentErrorMap[error.message]) {
        const [status, message] = appointmentErrorMap[error.message];
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
async function createAppointmentController(req, res) {
    try {
        const { hospitalId, patientId, doctorHospitalId, doctorDepartmentAssignmentId, appointmentNumber, scheduledStart, scheduledEnd, } = req.body ?? {};
        if (!hospitalId ||
            !patientId ||
            !doctorHospitalId ||
            !doctorDepartmentAssignmentId ||
            !appointmentNumber ||
            !scheduledStart ||
            !scheduledEnd) {
            return res.status(400).json({
                success: false,
                message: "Required appointment fields are missing",
            });
        }
        const appointment = await (0, apt_service_1.createAppointment)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: appointment.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "APPOINTMENT",
            entityId: appointment.id,
            metadata: {
                appointmentNumber: appointment.appointmentNumber,
                type: appointment.type,
                status: appointment.status,
                scheduledStart: appointment.scheduledStart,
                scheduledEnd: appointment.scheduledEnd,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            data: appointment,
        });
    }
    catch (error) {
        return handleAppointmentError(error, res, "Create appointment error");
    }
}
async function getAppointmentsController(_req, res) {
    try {
        const appointments = await (0, apt_service_1.getAppointments)();
        return res.status(200).json({
            success: true,
            data: appointments,
        });
    }
    catch (error) {
        return handleAppointmentError(error, res, "Get appointments error");
    }
}
async function getAppointmentByIdController(req, res) {
    try {
        const appointment = await (0, apt_service_1.getAppointmentById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        return handleAppointmentError(error, res, "Get appointment error");
    }
}
async function updateAppointmentController(req, res) {
    try {
        const appointment = await (0, apt_service_1.updateAppointment)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: appointment.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "APPOINTMENT",
            entityId: appointment.id,
            metadata: {
                appointmentNumber: appointment.appointmentNumber,
                type: appointment.type,
                priority: appointment.priority,
                status: appointment.status,
                scheduledStart: appointment.scheduledStart,
                scheduledEnd: appointment.scheduledEnd,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            data: appointment,
        });
    }
    catch (error) {
        return handleAppointmentError(error, res, "Update appointment error");
    }
}
async function deleteAppointmentController(req, res) {
    try {
        const appointment = await (0, apt_service_1.deleteAppointment)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            hospitalId: appointment.hospitalId,
            userId: req.user?.id,
            action: "DELETE",
            entityType: "APPOINTMENT",
            entityId: appointment.id,
            metadata: {
                appointmentNumber: appointment.appointmentNumber,
                type: appointment.type,
                status: appointment.status,
                scheduledStart: appointment.scheduledStart,
                scheduledEnd: appointment.scheduledEnd,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Appointment deleted successfully",
        });
    }
    catch (error) {
        return handleAppointmentError(error, res, "Delete appointment error");
    }
}
