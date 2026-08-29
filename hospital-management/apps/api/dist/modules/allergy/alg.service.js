"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllergy = createAllergy;
exports.getAllergies = getAllergies;
exports.getAllergyById = getAllergyById;
exports.updateAllergy = updateAllergy;
exports.deleteAllergy = deleteAllergy;
const prisma_1 = require("../../config/prisma");
async function createAllergy(input) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            isActive: true,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientAllergy.create({
        data: {
            patientId: input.patientId,
            allergen: input.allergen.trim(),
            reaction: input.reaction?.trim(),
            severity: input.severity?.trim(),
            notes: input.notes?.trim(),
        },
    });
}
async function getAllergies() {
    return prisma_1.prisma.patientAllergy.findMany({
        where: {
            isActive: true,
        },
        include: {
            patient: {
                select: {
                    id: true,
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
async function getAllergyById(id) {
    const allergy = await prisma_1.prisma.patientAllergy.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    if (!allergy) {
        throw new Error("ALLERGY_NOT_FOUND");
    }
    return allergy;
}
async function updateAllergy(id, input) {
    const allergy = await prisma_1.prisma.patientAllergy.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!allergy) {
        throw new Error("ALLERGY_NOT_FOUND");
    }
    return prisma_1.prisma.patientAllergy.update({
        where: { id },
        data: {
            allergen: input.allergen?.trim(),
            reaction: input.reaction?.trim(),
            severity: input.severity?.trim(),
            notes: input.notes?.trim(),
            isActive: input.isActive,
        },
    });
}
async function deleteAllergy(id) {
    const allergy = await prisma_1.prisma.patientAllergy.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!allergy) {
        throw new Error("ALLERGY_NOT_FOUND");
    }
    return prisma_1.prisma.patientAllergy.update({
        where: { id },
        data: {
            isActive: false,
        },
    });
}
