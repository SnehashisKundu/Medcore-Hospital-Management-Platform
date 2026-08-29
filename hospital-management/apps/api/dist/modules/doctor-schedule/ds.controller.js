"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorScheduleController = createDoctorScheduleController;
exports.getDoctorSchedulesController = getDoctorSchedulesController;
exports.getDoctorScheduleByIdController = getDoctorScheduleByIdController;
exports.updateDoctorScheduleController = updateDoctorScheduleController;
exports.deleteDoctorScheduleController = deleteDoctorScheduleController;
const ds_service_1 = require("./ds.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDoctorScheduleController(req, res) {
    try {
        const body = req.body ?? {};
        const { doctorHospitalId, departmentId, dayOfWeek, startTime, endTime, slotDurationMinutes, } = body;
        if (!doctorHospitalId ||
            !departmentId ||
            !dayOfWeek ||
            !startTime ||
            !endTime ||
            slotDurationMinutes === undefined) {
            return res.status(400).json({
                success: false,
                message: "Doctor hospital ID, department ID, day of week, start time, end time and slot duration are required",
            });
        }
        const schedule = await (0, ds_service_1.createDoctorSchedule)(body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: schedule.doctorHospital?.hospitalId,
            action: "CREATE",
            entityType: "DOCTOR_SCHEDULE",
            entityId: schedule.id,
            metadata: {
                doctorHospitalId: schedule.doctorHospitalId,
                departmentId: schedule.departmentId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDurationMinutes: schedule.slotDurationMinutes,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Doctor schedule created successfully",
            data: schedule,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                INVALID_TIME_FORMAT: [
                    400,
                    "Time must be in HH:mm format",
                ],
                INVALID_TIME_RANGE: [
                    400,
                    "End time must be later than start time",
                ],
                INVALID_SLOT_DURATION: [
                    400,
                    "Slot duration must be a positive integer",
                ],
                SLOT_DURATION_NOT_DIVISIBLE: [
                    400,
                    "Schedule duration must be divisible by slot duration",
                ],
                DOCTOR_HOSPITAL_NOT_FOUND: [
                    404,
                    "Active doctor hospital assignment not found",
                ],
                DEPARTMENT_NOT_FOUND: [
                    404,
                    "Active department not found for this hospital",
                ],
                DOCTOR_NOT_ASSIGNED_TO_DEPARTMENT: [
                    400,
                    "Doctor is not actively assigned to this department",
                ],
                DOCTOR_SCHEDULE_ALREADY_EXISTS: [
                    409,
                    "Doctor schedule already exists",
                ],
                DOCTOR_SCHEDULE_CONFLICT: [
                    409,
                    "Doctor schedule conflicts with an existing schedule",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Create doctor schedule error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorSchedulesController(_req, res) {
    try {
        const schedules = await (0, ds_service_1.getDoctorSchedules)();
        return res.status(200).json({
            success: true,
            data: schedules,
        });
    }
    catch (error) {
        console.error("Get doctor schedules error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDoctorScheduleByIdController(req, res) {
    try {
        const schedule = await (0, ds_service_1.getDoctorScheduleById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: schedule,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "DOCTOR_SCHEDULE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Doctor schedule not found",
            });
        }
        console.error("Get doctor schedule error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDoctorScheduleController(req, res) {
    try {
        const schedule = await (0, ds_service_1.updateDoctorSchedule)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: schedule.doctorHospital?.hospitalId,
            action: "UPDATE",
            entityType: "DOCTOR_SCHEDULE",
            entityId: schedule.id,
            metadata: {
                doctorHospitalId: schedule.doctorHospitalId,
                departmentId: schedule.departmentId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDurationMinutes: schedule.slotDurationMinutes,
                isActive: schedule.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor schedule updated successfully",
            data: schedule,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                DOCTOR_SCHEDULE_NOT_FOUND: [
                    404,
                    "Doctor schedule not found",
                ],
                INVALID_TIME_FORMAT: [
                    400,
                    "Time must be in HH:mm format",
                ],
                INVALID_TIME_RANGE: [
                    400,
                    "End time must be later than start time",
                ],
                INVALID_SLOT_DURATION: [
                    400,
                    "Slot duration must be a positive integer",
                ],
                SLOT_DURATION_NOT_DIVISIBLE: [
                    400,
                    "Schedule duration must be divisible by slot duration",
                ],
                DOCTOR_HOSPITAL_NOT_FOUND: [
                    404,
                    "Active doctor hospital assignment not found",
                ],
                DEPARTMENT_NOT_FOUND: [
                    404,
                    "Active department not found for this hospital",
                ],
                DOCTOR_NOT_ASSIGNED_TO_DEPARTMENT: [
                    400,
                    "Doctor is not actively assigned to this department",
                ],
                DOCTOR_SCHEDULE_CONFLICT: [
                    409,
                    "Doctor schedule conflicts with an existing schedule",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Update doctor schedule error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function deleteDoctorScheduleController(req, res) {
    try {
        const schedule = await (0, ds_service_1.deleteDoctorSchedule)(req.params.id);
        // Audit DELETE / DEACTIVATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: schedule.doctorHospital?.hospitalId,
            action: "DELETE",
            entityType: "DOCTOR_SCHEDULE",
            entityId: schedule.id,
            metadata: {
                doctorHospitalId: schedule.doctorHospitalId,
                departmentId: schedule.departmentId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                isActive: schedule.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Doctor schedule deactivated successfully",
            data: schedule,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                DOCTOR_SCHEDULE_NOT_FOUND: [
                    404,
                    "Doctor schedule not found",
                ],
                DOCTOR_SCHEDULE_ALREADY_INACTIVE: [
                    400,
                    "Doctor schedule is already inactive",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Delete doctor schedule error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
