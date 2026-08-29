"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorHospital = createDoctorHospital;
exports.getDoctorHospitals = getDoctorHospitals;
exports.getDoctorHospitalById = getDoctorHospitalById;
exports.updateDoctorHospital = updateDoctorHospital;
exports.deleteDoctorHospital = deleteDoctorHospital;
const prisma_1 = require("../../config/prisma");
async function createDoctorHospital(input) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id: input.doctorId,
            isActive: true,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: input.hospitalId,
            isActive: true,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const existing = await prisma_1.prisma.doctorHospital.findUnique({
        where: {
            doctorId_hospitalId: {
                doctorId: input.doctorId,
                hospitalId: input.hospitalId,
            },
        },
    });
    if (existing) {
        throw new Error("DOCTOR_HOSPITAL_EXISTS");
    }
    return prisma_1.prisma.doctorHospital.create({
        data: {
            doctorId: input.doctorId,
            hospitalId: input.hospitalId,
            joinedAt: input.joinedAt
                ? new Date(input.joinedAt)
                : new Date(),
        },
    });
}
async function getDoctorHospitals() {
    return prisma_1.prisma.doctorHospital.findMany({
        where: {
            isActive: true,
        },
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
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    city: true,
                    state: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getDoctorHospitalById(id) {
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id,
            isActive: true,
        },
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
            hospital: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    return doctorHospital;
}
async function updateDoctorHospital(id, input) {
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    return prisma_1.prisma.doctorHospital.update({
        where: {
            id,
        },
        data: {
            joinedAt: input.joinedAt
                ? new Date(input.joinedAt)
                : undefined,
        },
    });
}
async function deleteDoctorHospital(id) {
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    return prisma_1.prisma.doctorHospital.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
}
