"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatient = createPatient;
exports.getPatients = getPatients;
exports.getPatientById = getPatientById;
exports.updatePatient = updatePatient;
exports.deletePatient = deletePatient;
const prisma_1 = require("../../config/prisma");
async function createPatient(input) {
    if (input.userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: input.userId,
            },
        });
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }
        const existingPatient = await prisma_1.prisma.patient.findUnique({
            where: {
                userId: input.userId,
            },
        });
        if (existingPatient) {
            throw new Error("PATIENT_PROFILE_EXISTS");
        }
    }
    return prisma_1.prisma.patient.create({
        data: {
            userId: input.userId,
            firstName: input.firstName.trim(),
            middleName: input.middleName?.trim(),
            lastName: input.lastName?.trim(),
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
            gender: input.gender,
            phone: input.phone?.trim(),
            email: input.email?.trim().toLowerCase(),
            bloodGroup: input.bloodGroup,
            addressLine1: input.addressLine1?.trim(),
            addressLine2: input.addressLine2?.trim(),
            city: input.city?.trim(),
            state: input.state?.trim(),
            country: input.country?.trim() || "India",
            postalCode: input.postalCode?.trim(),
        },
    });
}
async function getPatients() {
    return prisma_1.prisma.patient.findMany({
        where: {
            isActive: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getPatientById(id) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return patient;
}
async function updatePatient(id, input) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patient.update({
        where: { id },
        data: {
            firstName: input.firstName?.trim(),
            middleName: input.middleName?.trim(),
            lastName: input.lastName?.trim(),
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
            gender: input.gender,
            phone: input.phone?.trim(),
            email: input.email?.trim().toLowerCase(),
            bloodGroup: input.bloodGroup,
            addressLine1: input.addressLine1?.trim(),
            addressLine2: input.addressLine2?.trim(),
            city: input.city?.trim(),
            state: input.state?.trim(),
            country: input.country?.trim(),
            postalCode: input.postalCode?.trim(),
        },
    });
}
async function deletePatient(id) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patient.update({
        where: { id },
        data: {
            isActive: false,
            deletedAt: new Date(),
        },
    });
}
