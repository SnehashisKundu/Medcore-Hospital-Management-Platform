"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.getAppointments = getAppointments;
exports.getAppointmentById = getAppointmentById;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
const prisma_1 = require("../../config/prisma");
const client_1 = require("../../generated/prisma/client");
const notification_service_1 = require("../notification/notification.service");
const reminder_queue_1 = require("../appointment-reminder/reminder.queue");
const DAY_OF_WEEK = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
];
function parseAppointmentDates(scheduledStart, scheduledEnd) {
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    if (Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())) {
        throw new Error("INVALID_APPOINTMENT_DATE");
    }
    if (start >= end) {
        throw new Error("INVALID_APPOINTMENT_RANGE");
    }
    return { start, end };
}
function getTimeInMinutes(date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}
function getDayOfWeek(date) {
    return DAY_OF_WEEK[date.getUTCDay()];
}
function parseScheduleTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}
async function validateAppointmentAvailability(doctorHospitalId, departmentId, scheduledStart, scheduledEnd, excludeAppointmentId) {
    if (scheduledStart.getUTCFullYear() !== scheduledEnd.getUTCFullYear() ||
        scheduledStart.getUTCMonth() !== scheduledEnd.getUTCMonth() ||
        scheduledStart.getUTCDate() !== scheduledEnd.getUTCDate()) {
        throw new Error("APPOINTMENT_MUST_BE_SAME_DAY");
    }
    const dayOfWeek = getDayOfWeek(scheduledStart);
    const startMinutes = getTimeInMinutes(scheduledStart);
    const endMinutes = getTimeInMinutes(scheduledEnd);
    const schedules = await prisma_1.prisma.doctorSchedule.findMany({
        where: {
            doctorHospitalId,
            departmentId,
            dayOfWeek,
            isActive: true,
        },
    });
    if (!schedules.length) {
        throw new Error("DOCTOR_NOT_AVAILABLE_ON_DAY");
    }
    const matchingSchedule = schedules.find((schedule) => {
        const scheduleStart = parseScheduleTime(schedule.startTime);
        const scheduleEnd = parseScheduleTime(schedule.endTime);
        const appointmentDuration = endMinutes - startMinutes;
        const isWithinSchedule = startMinutes >= scheduleStart &&
            endMinutes <= scheduleEnd;
        const isCorrectDuration = appointmentDuration ===
            schedule.slotDurationMinutes;
        const isSlotAligned = (startMinutes - scheduleStart) %
            schedule.slotDurationMinutes ===
            0;
        return (isWithinSchedule &&
            isCorrectDuration &&
            isSlotAligned);
    });
    if (!matchingSchedule) {
        throw new Error("INVALID_DOCTOR_SCHEDULE_SLOT");
    }
    const leaveConflict = await prisma_1.prisma.doctorLeave.findFirst({
        where: {
            doctorHospitalId,
            startAt: {
                lt: scheduledEnd,
            },
            endAt: {
                gt: scheduledStart,
            },
        },
    });
    if (leaveConflict) {
        throw new Error("DOCTOR_ON_LEAVE");
    }
    const appointmentConflict = await prisma_1.prisma.appointment.findFirst({
        where: {
            doctorHospitalId,
            deletedAt: null,
            status: {
                not: "CANCELLED",
            },
            ...(excludeAppointmentId
                ? {
                    id: {
                        not: excludeAppointmentId,
                    },
                }
                : {}),
            scheduledStart: {
                lt: scheduledEnd,
            },
            scheduledEnd: {
                gt: scheduledStart,
            },
        },
    });
    if (appointmentConflict) {
        throw new Error("APPOINTMENT_SLOT_ALREADY_BOOKED");
    }
}
async function createAppointment(input) {
    const { start, end } = parseAppointmentDates(input.scheduledStart, input.scheduledEnd);
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: input.hospitalId,
            isActive: true,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            isActive: true,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id: input.doctorHospitalId,
            hospitalId: input.hospitalId,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            id: input.doctorDepartmentAssignmentId,
            doctorHospitalId: input.doctorHospitalId,
            isActive: true,
        },
    });
    if (!assignment) {
        throw new Error("DOCTOR_ASSIGNMENT_NOT_FOUND");
    }
    const existingAppointment = await prisma_1.prisma.appointment.findFirst({
        where: {
            hospitalId: input.hospitalId,
            appointmentNumber: input.appointmentNumber.trim(),
        },
    });
    if (existingAppointment) {
        throw new Error("APPOINTMENT_NUMBER_EXISTS");
    }
    await validateAppointmentAvailability(input.doctorHospitalId, assignment.departmentId, start, end);
    const appointment = await prisma_1.prisma.appointment.create({
        data: {
            hospitalId: input.hospitalId,
            patientId: input.patientId,
            doctorHospitalId: input.doctorHospitalId,
            doctorDepartmentAssignmentId: input.doctorDepartmentAssignmentId,
            appointmentNumber: input.appointmentNumber.trim(),
            type: input.type ?? "OPD",
            priority: input.priority ?? "NORMAL",
            scheduledStart: start,
            scheduledEnd: end,
            reason: input.reason?.trim(),
            notes: input.notes?.trim(),
        },
    });
    await (0, reminder_queue_1.scheduleAppointmentReminders)(appointment.id, appointment.scheduledStart);
    await (0, notification_service_1.sendPatientNotification)({
        patientId: appointment.patientId,
        type: client_1.NotificationType.APPOINTMENT_BOOKED,
        subject: "Appointment Booked",
        message: `Your appointment (${appointment.appointmentNumber}) ` +
            `has been booked successfully.`,
        referenceType: "APPOINTMENT",
        referenceId: appointment.id,
    });
    return appointment;
}
async function getAppointments() {
    return prisma_1.prisma.appointment.findMany({
        where: {
            deletedAt: null,
        },
        include: {
            patient: true,
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
            doctorDepartmentAssignment: {
                include: {
                    department: true,
                    specialization: true,
                },
            },
        },
        orderBy: {
            scheduledStart: "desc",
        },
    });
}
async function getAppointmentById(id) {
    const appointment = await prisma_1.prisma.appointment.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            patient: true,
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
            doctorDepartmentAssignment: {
                include: {
                    department: true,
                    specialization: true,
                },
            },
        },
    });
    if (!appointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
    }
    return appointment;
}
async function updateAppointment(id, input) {
    const appointment = await prisma_1.prisma.appointment.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            doctorDepartmentAssignment: true,
        },
    });
    if (!appointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
    }
    const finalStart = input.scheduledStart !== undefined
        ? input.scheduledStart
        : appointment.scheduledStart.toISOString();
    const finalEnd = input.scheduledEnd !== undefined
        ? input.scheduledEnd
        : appointment.scheduledEnd.toISOString();
    const { start, end } = parseAppointmentDates(finalStart, finalEnd);
    const finalStatus = input.status ?? appointment.status;
    if (finalStatus !== "CANCELLED") {
        await validateAppointmentAvailability(appointment.doctorHospitalId, appointment.doctorDepartmentAssignment.departmentId, start, end, appointment.id);
    }
    await (0, reminder_queue_1.cancelAppointmentReminders)(id);
    const updatedAppointment = await prisma_1.prisma.appointment.update({
        where: {
            id,
        },
        data: {
            type: input.type,
            priority: input.priority,
            status: input.status,
            scheduledStart: input.scheduledStart !== undefined
                ? start
                : undefined,
            scheduledEnd: input.scheduledEnd !== undefined
                ? end
                : undefined,
            reason: input.reason !== undefined
                ? input.reason.trim()
                : undefined,
            notes: input.notes !== undefined
                ? input.notes.trim()
                : undefined,
        },
    });
    if (updatedAppointment.status !== "CANCELLED" &&
        updatedAppointment.status !== "COMPLETED" &&
        !updatedAppointment.deletedAt) {
        await (0, reminder_queue_1.scheduleAppointmentReminders)(updatedAppointment.id, updatedAppointment.scheduledStart);
    }
    return updatedAppointment;
}
async function deleteAppointment(id) {
    const appointment = await prisma_1.prisma.appointment.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!appointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
    }
    await (0, reminder_queue_1.cancelAppointmentReminders)(id);
    return prisma_1.prisma.appointment.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
