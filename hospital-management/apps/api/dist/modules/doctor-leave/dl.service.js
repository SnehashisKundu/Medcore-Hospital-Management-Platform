"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorLeave = createDoctorLeave;
exports.getDoctorLeaves = getDoctorLeaves;
exports.getDoctorLeaveById = getDoctorLeaveById;
exports.updateDoctorLeave = updateDoctorLeave;
const prisma_1 = require("../../config/prisma");
function validateDateRange(startAt, endAt) {
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        throw new TypeError("INVALID_DATE");
    }
    if (startAt >= endAt) {
        throw new Error("INVALID_LEAVE_RANGE");
    }
}
async function createDoctorLeave(input) {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);
    validateDateRange(startAt, endAt);
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id: input.doctorHospitalId,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    const conflictingLeave = await prisma_1.prisma.doctorLeave.findFirst({
        where: {
            doctorHospitalId: input.doctorHospitalId,
            startAt: {
                lt: endAt,
            },
            endAt: {
                gt: startAt,
            },
        },
    });
    if (conflictingLeave) {
        throw new Error("DOCTOR_LEAVE_CONFLICT");
    }
    return prisma_1.prisma.doctorLeave.create({
        data: {
            doctorHospitalId: input.doctorHospitalId,
            startAt,
            endAt,
            reason: input.reason,
        },
        include: {
            doctorHospital: true,
        },
    });
}
async function getDoctorLeaves() {
    return prisma_1.prisma.doctorLeave.findMany({
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
        },
        orderBy: {
            startAt: "asc",
        },
    });
}
async function getDoctorLeaveById(id) {
    const leave = await prisma_1.prisma.doctorLeave.findUnique({
        where: { id },
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
        },
    });
    if (!leave) {
        throw new Error("DOCTOR_LEAVE_NOT_FOUND");
    }
    return leave;
}
async function updateDoctorLeave(id, input) {
    const leave = await prisma_1.prisma.doctorLeave.findUnique({
        where: { id },
    });
    if (!leave) {
        throw new Error("DOCTOR_LEAVE_NOT_FOUND");
    }
    const finalStartAt = input.startAt
        ? new Date(input.startAt)
        : leave.startAt;
    const finalEndAt = input.endAt
        ? new Date(input.endAt)
        : leave.endAt;
    validateDateRange(finalStartAt, finalEndAt);
    const conflictingLeave = await prisma_1.prisma.doctorLeave.findFirst({
        where: {
            doctorHospitalId: leave.doctorHospitalId,
            id: {
                not: id,
            },
            startAt: {
                lt: finalEndAt,
            },
            endAt: {
                gt: finalStartAt,
            },
        },
    });
    if (conflictingLeave) {
        throw new Error("DOCTOR_LEAVE_CONFLICT");
    }
    return prisma_1.prisma.doctorLeave.update({
        where: { id },
        data: {
            startAt: input.startAt ? finalStartAt : undefined,
            endAt: input.endAt ? finalEndAt : undefined,
            reason: input.reason,
        },
        include: {
            doctorHospital: true,
        },
    });
}
