"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFamilyHistory = createFamilyHistory;
exports.getFamilyHistories = getFamilyHistories;
exports.getFamilyHistoryById = getFamilyHistoryById;
exports.updateFamilyHistory = updateFamilyHistory;
exports.deleteFamilyHistory = deleteFamilyHistory;
const prisma_1 = require("../../config/prisma");
async function createFamilyHistory(input) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            deletedAt: null,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientFamilyHistory.create({
        data: {
            patientId: input.patientId,
            diabetes: input.diabetes ?? false,
            hypertension: input.hypertension ?? false,
            cancer: input.cancer ?? false,
            cardiac: input.cardiac ?? false,
            notes: input.notes?.trim() || null,
        },
    });
}
async function getFamilyHistories() {
    return prisma_1.prisma.patientFamilyHistory.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getFamilyHistoryById(id) {
    const familyHistory = await prisma_1.prisma.patientFamilyHistory.findUnique({
        where: { id },
    });
    if (!familyHistory) {
        throw new Error("FAMILY_HISTORY_NOT_FOUND");
    }
    return familyHistory;
}
async function updateFamilyHistory(id, input) {
    const familyHistory = await prisma_1.prisma.patientFamilyHistory.findUnique({
        where: { id },
    });
    if (!familyHistory) {
        throw new Error("FAMILY_HISTORY_NOT_FOUND");
    }
    return prisma_1.prisma.patientFamilyHistory.update({
        where: { id },
        data: {
            diabetes: input.diabetes,
            hypertension: input.hypertension,
            cancer: input.cancer,
            cardiac: input.cardiac,
            notes: input.notes !== undefined
                ? input.notes?.trim() || null
                : undefined,
        },
    });
}
async function deleteFamilyHistory(id) {
    const familyHistory = await prisma_1.prisma.patientFamilyHistory.findUnique({
        where: { id },
    });
    if (!familyHistory) {
        throw new Error("FAMILY_HISTORY_NOT_FOUND");
    }
    return prisma_1.prisma.patientFamilyHistory.delete({
        where: { id },
    });
}
