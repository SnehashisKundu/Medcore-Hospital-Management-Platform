"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVaccination = createVaccination;
exports.getVaccinations = getVaccinations;
exports.getVaccinationById = getVaccinationById;
exports.updateVaccination = updateVaccination;
exports.deleteVaccination = deleteVaccination;
const prisma_1 = require("../../config/prisma");
function parseVaccinationDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new TypeError("INVALID_VACCINATION_DATE");
    }
    return date;
}
async function createVaccination(input) {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            deletedAt: null,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    const administeredDate = parseVaccinationDate(input.administeredDate);
    const nextDueDate = input.nextDueDate
        ? parseVaccinationDate(input.nextDueDate)
        : null;
    return prisma_1.prisma.patientVaccination.create({
        data: {
            patientId: input.patientId,
            vaccineName: input.vaccineName.trim(),
            batchNumber: input.batchNumber?.trim() || null,
            administeredDate,
            nextDueDate,
            notes: input.notes?.trim() || null,
        },
    });
}
async function getVaccinations() {
    return prisma_1.prisma.patientVaccination.findMany({
        orderBy: {
            administeredDate: "desc",
        },
    });
}
async function getVaccinationById(id) {
    const vaccination = await prisma_1.prisma.patientVaccination.findUnique({
        where: {
            id,
        },
    });
    if (!vaccination) {
        throw new Error("VACCINATION_NOT_FOUND");
    }
    return vaccination;
}
async function updateVaccination(id, input) {
    const vaccination = await prisma_1.prisma.patientVaccination.findUnique({
        where: {
            id,
        },
    });
    if (!vaccination) {
        throw new Error("VACCINATION_NOT_FOUND");
    }
    const administeredDate = input.administeredDate !== undefined
        ? parseVaccinationDate(input.administeredDate)
        : undefined;
    const nextDueDate = input.nextDueDate !== undefined
        ? input.nextDueDate
            ? parseVaccinationDate(input.nextDueDate)
            : null
        : undefined;
    return prisma_1.prisma.patientVaccination.update({
        where: {
            id,
        },
        data: {
            vaccineName: input.vaccineName !== undefined
                ? input.vaccineName.trim()
                : undefined,
            batchNumber: input.batchNumber !== undefined
                ? input.batchNumber?.trim() || null
                : undefined,
            administeredDate,
            nextDueDate,
            notes: input.notes !== undefined
                ? input.notes?.trim() || null
                : undefined,
        },
    });
}
async function deleteVaccination(id) {
    const vaccination = await prisma_1.prisma.patientVaccination.findUnique({
        where: {
            id,
        },
    });
    if (!vaccination) {
        throw new Error("VACCINATION_NOT_FOUND");
    }
    return prisma_1.prisma.patientVaccination.delete({
        where: {
            id,
        },
    });
}
