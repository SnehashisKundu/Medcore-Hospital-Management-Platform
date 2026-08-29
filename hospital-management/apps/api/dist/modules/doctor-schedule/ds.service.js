"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorSchedule = createDoctorSchedule;
exports.getDoctorSchedules = getDoctorSchedules;
exports.getDoctorScheduleById = getDoctorScheduleById;
exports.updateDoctorSchedule = updateDoctorSchedule;
exports.deleteDoctorSchedule = deleteDoctorSchedule;
const prisma_1 = require("../../config/prisma");
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
function validateTimeFormat(time) {
    return TIME_REGEX.test(time);
}
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}
function validateTimeRange(startTime, endTime) {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
        throw new Error("INVALID_TIME_FORMAT");
    }
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        throw new Error("INVALID_TIME_RANGE");
    }
}
function validateSlotDuration(startTime, endTime, slotDurationMinutes) {
    if (!Number.isInteger(slotDurationMinutes) ||
        slotDurationMinutes <= 0) {
        throw new Error("INVALID_SLOT_DURATION");
    }
    const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
    if (totalMinutes % slotDurationMinutes !== 0) {
        throw new Error("SLOT_DURATION_NOT_DIVISIBLE");
    }
}
async function createDoctorSchedule(input) {
    validateTimeRange(input.startTime, input.endTime);
    validateSlotDuration(input.startTime, input.endTime, input.slotDurationMinutes);
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id: input.doctorHospitalId,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: input.departmentId,
            hospitalId: doctorHospital.hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            doctorHospitalId: input.doctorHospitalId,
            departmentId: input.departmentId,
            isActive: true,
        },
    });
    if (!assignment) {
        throw new Error("DOCTOR_NOT_ASSIGNED_TO_DEPARTMENT");
    }
    const exactDuplicate = await prisma_1.prisma.doctorSchedule.findFirst({
        where: {
            doctorHospitalId: input.doctorHospitalId,
            departmentId: input.departmentId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
        },
    });
    if (exactDuplicate) {
        throw new Error("DOCTOR_SCHEDULE_ALREADY_EXISTS");
    }
    const conflictingSchedule = await prisma_1.prisma.doctorSchedule.findFirst({
        where: {
            doctorHospitalId: input.doctorHospitalId,
            departmentId: input.departmentId,
            dayOfWeek: input.dayOfWeek,
            isActive: true,
        },
    });
    if (conflictingSchedule) {
        const existingStart = timeToMinutes(conflictingSchedule.startTime);
        const existingEnd = timeToMinutes(conflictingSchedule.endTime);
        const newStart = timeToMinutes(input.startTime);
        const newEnd = timeToMinutes(input.endTime);
        const hasOverlap = existingStart < newEnd && existingEnd > newStart;
        if (hasOverlap) {
            throw new Error("DOCTOR_SCHEDULE_CONFLICT");
        }
    }
    return prisma_1.prisma.doctorSchedule.create({
        data: {
            doctorHospitalId: input.doctorHospitalId,
            departmentId: input.departmentId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            slotDurationMinutes: input.slotDurationMinutes,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
        },
    });
}
async function getDoctorSchedules() {
    return prisma_1.prisma.doctorSchedule.findMany({
        include: {
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    hospital: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            department: true,
        },
        orderBy: [
            {
                dayOfWeek: "asc",
            },
            {
                startTime: "asc",
            },
        ],
    });
}
async function getDoctorScheduleById(id) {
    const schedule = await prisma_1.prisma.doctorSchedule.findUnique({
        where: {
            id,
        },
        include: {
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    hospital: true,
                },
            },
            department: true,
        },
    });
    if (!schedule) {
        throw new Error("DOCTOR_SCHEDULE_NOT_FOUND");
    }
    return schedule;
}
async function updateDoctorSchedule(id, input) {
    const schedule = await prisma_1.prisma.doctorSchedule.findUnique({
        where: {
            id,
        },
    });
    if (!schedule) {
        throw new Error("DOCTOR_SCHEDULE_NOT_FOUND");
    }
    const finalDepartmentId = input.departmentId ?? schedule.departmentId;
    const finalDayOfWeek = input.dayOfWeek ?? schedule.dayOfWeek;
    const finalStartTime = input.startTime ?? schedule.startTime;
    const finalEndTime = input.endTime ?? schedule.endTime;
    const finalSlotDuration = input.slotDurationMinutes ?? schedule.slotDurationMinutes;
    validateTimeRange(finalStartTime, finalEndTime);
    validateSlotDuration(finalStartTime, finalEndTime, finalSlotDuration);
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id: schedule.doctorHospitalId,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: finalDepartmentId,
            hospitalId: doctorHospital.hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            doctorHospitalId: schedule.doctorHospitalId,
            departmentId: finalDepartmentId,
            isActive: true,
        },
    });
    if (!assignment) {
        throw new Error("DOCTOR_NOT_ASSIGNED_TO_DEPARTMENT");
    }
    const schedules = await prisma_1.prisma.doctorSchedule.findMany({
        where: {
            doctorHospitalId: schedule.doctorHospitalId,
            departmentId: finalDepartmentId,
            dayOfWeek: finalDayOfWeek,
            isActive: true,
            id: {
                not: id,
            },
        },
    });
    const newStart = timeToMinutes(finalStartTime);
    const newEnd = timeToMinutes(finalEndTime);
    const hasConflict = schedules.some((existing) => {
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = timeToMinutes(existing.endTime);
        return existingStart < newEnd && existingEnd > newStart;
    });
    if (hasConflict) {
        throw new Error("DOCTOR_SCHEDULE_CONFLICT");
    }
    return prisma_1.prisma.doctorSchedule.update({
        where: {
            id,
        },
        data: {
            departmentId: input.departmentId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            slotDurationMinutes: input.slotDurationMinutes,
            isActive: input.isActive,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
        },
    });
}
async function deleteDoctorSchedule(id) {
    const schedule = await prisma_1.prisma.doctorSchedule.findUnique({
        where: {
            id,
        },
    });
    if (!schedule) {
        throw new Error("DOCTOR_SCHEDULE_NOT_FOUND");
    }
    if (!schedule.isActive) {
        throw new Error("DOCTOR_SCHEDULE_ALREADY_INACTIVE");
    }
    return prisma_1.prisma.doctorSchedule.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
        },
    });
}
