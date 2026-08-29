"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicationHistory = createMedicationHistory;
exports.getMedicationHistories = getMedicationHistories;
exports.getMedicationHistoryById = getMedicationHistoryById;
exports.updateMedicationHistory = updateMedicationHistory;
exports.deleteMedicationHistory = deleteMedicationHistory;
const prisma_1 = require("../../config/prisma");
async function createMedicationHistory(input) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            deletedAt: null,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientMedicationHistory.create({
        data: {
            patientId: input.patientId,
            medicineName: input.medicineName.trim(),
            dosage: input.dosage?.trim(),
            frequency: input.frequency?.trim(),
            route: input.route?.trim(),
            startDate: input.startDate
                ? new Date(input.startDate)
                : undefined,
            endDate: input.endDate
                ? new Date(input.endDate)
                : undefined,
            isCurrent: input.isCurrent ?? true,
            notes: input.notes?.trim(),
        },
    });
}
async function getMedicationHistories() {
    return prisma_1.prisma.patientMedicationHistory.findMany({
        orderBy: {
            createdAt: "desc",
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
}
async function getMedicationHistoryById(id) {
    const medicationHistory = await prisma_1.prisma.patientMedicationHistory.findUnique({
        where: { id },
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
    if (!medicationHistory) {
        throw new Error("MEDICATION_HISTORY_NOT_FOUND");
    }
    return medicationHistory;
}
async function updateMedicationHistory(id, input) {
    const medicationHistory = await prisma_1.prisma.patientMedicationHistory.findUnique({
        where: { id },
    });
    if (!medicationHistory) {
        throw new Error("MEDICATION_HISTORY_NOT_FOUND");
    }
    return prisma_1.prisma.patientMedicationHistory.update({
        where: { id },
        data: {
            medicineName: input.medicineName !== undefined
                ? input.medicineName.trim()
                : undefined,
            dosage: input.dosage !== undefined
                ? input.dosage?.trim() ?? null
                : undefined,
            frequency: input.frequency !== undefined
                ? input.frequency?.trim() ?? null
                : undefined,
            route: input.route !== undefined
                ? input.route?.trim() ?? null
                : undefined,
            startDate: input.startDate !== undefined
                ? input.startDate
                    ? new Date(input.startDate)
                    : null
                : undefined,
            endDate: input.endDate !== undefined
                ? input.endDate
                    ? new Date(input.endDate)
                    : null
                : undefined,
            isCurrent: input.isCurrent,
            notes: input.notes !== undefined
                ? input.notes?.trim() ?? null
                : undefined,
        },
    });
}
async function deleteMedicationHistory(id) {
    const medicationHistory = await prisma_1.prisma.patientMedicationHistory.findUnique({
        where: { id },
    });
    if (!medicationHistory) {
        throw new Error("MEDICATION_HISTORY_NOT_FOUND");
    }
    return prisma_1.prisma.patientMedicationHistory.delete({
        where: { id },
    });
}
