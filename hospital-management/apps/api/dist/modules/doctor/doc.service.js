"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctor = createDoctor;
exports.getDoctors = getDoctors;
exports.getDoctorById = getDoctorById;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
exports.uploadDoctorSignature = uploadDoctorSignature;
exports.removeDoctorSignature = removeDoctorSignature;
const prisma_1 = require("../../config/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function createDoctor(input) {
    const medicalRegistrationNumber = input.medicalRegistrationNumber.trim().toUpperCase();
    // Check user exists
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: input.userId,
        },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    // Check user already has doctor profile
    const existingDoctor = await prisma_1.prisma.doctor.findUnique({
        where: {
            userId: input.userId,
        },
    });
    if (existingDoctor) {
        throw new Error("DOCTOR_PROFILE_EXISTS");
    }
    // Check registration number
    const existingRegistration = await prisma_1.prisma.doctor.findUnique({
        where: {
            medicalRegistrationNumber,
        },
    });
    if (existingRegistration) {
        throw new Error("MEDICAL_REGISTRATION_EXISTS");
    }
    return prisma_1.prisma.doctor.create({
        data: {
            userId: input.userId,
            medicalRegistrationNumber,
            qualification: input.qualification?.trim(),
            bio: input.bio?.trim(),
            priorExperienceYears: input.priorExperienceYears ?? 0,
        },
    });
}
async function getDoctors() {
    return prisma_1.prisma.doctor.findMany({
        where: {
            isActive: true,
        },
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
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getDoctorById(id) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id,
            isActive: true,
        },
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
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    return doctor;
}
async function updateDoctor(id, input) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    if (input.medicalRegistrationNumber) {
        const medicalRegistrationNumber = input.medicalRegistrationNumber.trim().toUpperCase();
        const existing = await prisma_1.prisma.doctor.findFirst({
            where: {
                medicalRegistrationNumber,
                NOT: {
                    id,
                },
            },
        });
        if (existing) {
            throw new Error("MEDICAL_REGISTRATION_EXISTS");
        }
        input.medicalRegistrationNumber =
            medicalRegistrationNumber;
    }
    return prisma_1.prisma.doctor.update({
        where: {
            id,
        },
        data: {
            medicalRegistrationNumber: input.medicalRegistrationNumber,
            qualification: input.qualification?.trim(),
            bio: input.bio?.trim(),
            priorExperienceYears: input.priorExperienceYears,
        },
    });
}
async function deleteDoctor(id) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    return prisma_1.prisma.doctor.update({
        where: {
            id,
        },
        data: {
            isActive: false,
            deletedAt: new Date(),
        },
    });
}
async function uploadDoctorSignature(doctorId, signatureUrl) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id: doctorId,
            deletedAt: null,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    const previousSignatureUrl = doctor.signatureUrl;
    const updatedDoctor = await prisma_1.prisma.doctor.update({
        where: {
            id: doctorId,
        },
        data: {
            signatureUrl,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    if (previousSignatureUrl &&
        previousSignatureUrl !== signatureUrl) {
        try {
            const previousFilePath = path_1.default.join(process.cwd(), previousSignatureUrl.replace(/^\//, ""));
            if (fs_1.default.existsSync(previousFilePath)) {
                fs_1.default.unlinkSync(previousFilePath);
            }
        }
        catch (error) {
            console.error("Failed to delete previous doctor signature:", error);
        }
    }
    return updatedDoctor;
}
async function removeDoctorSignature(doctorId) {
    const doctor = await prisma_1.prisma.doctor.findFirst({
        where: {
            id: doctorId,
            deletedAt: null,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    if (!doctor.signatureUrl) {
        throw new Error("SIGNATURE_NOT_FOUND");
    }
    const signatureUrl = doctor.signatureUrl;
    const updatedDoctor = await prisma_1.prisma.doctor.update({
        where: {
            id: doctorId,
        },
        data: {
            signatureUrl: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    try {
        const filePath = path_1.default.join(process.cwd(), signatureUrl.replace(/^\//, ""));
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error("Failed to delete doctor signature file:", error);
    }
    return updatedDoctor;
}
