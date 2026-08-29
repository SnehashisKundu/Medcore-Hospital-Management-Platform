"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVital = createVital;
exports.getVitals = getVitals;
exports.getVitalById = getVitalById;
exports.updateVital = updateVital;
const prisma_1 = require("../../config/prisma");
async function createVital(input) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id: input.encounterId,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    if (input.recordedById) {
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: input.recordedById,
            },
        });
        if (!user) {
            throw new Error("RECORDER_NOT_FOUND");
        }
    }
    return prisma_1.prisma.encounterVital.create({
        data: {
            encounterId: input.encounterId,
            recordedById: input.recordedById,
            temperatureCelsius: input.temperatureCelsius,
            pulseRate: input.pulseRate,
            respiratoryRate: input.respiratoryRate,
            oxygenSaturation: input.oxygenSaturation,
            bloodPressureSystolic: input.bloodPressureSystolic,
            bloodPressureDiastolic: input.bloodPressureDiastolic,
            heightCm: input.heightCm,
            weightKg: input.weightKg,
            bmi: input.bmi,
            painScore: input.painScore,
            bloodGlucose: input.bloodGlucose,
            remarks: input.remarks?.trim(),
            recordedAt: input.recordedAt
                ? new Date(input.recordedAt)
                : new Date(),
        },
    });
}
async function getVitals() {
    return prisma_1.prisma.encounterVital.findMany({
        include: {
            encounter: true,
        },
        orderBy: {
            recordedAt: "desc",
        },
    });
}
async function getVitalById(id) {
    const vital = await prisma_1.prisma.encounterVital.findUnique({
        where: {
            id,
        },
        include: {
            encounter: true,
        },
    });
    if (!vital) {
        throw new Error("VITAL_NOT_FOUND");
    }
    return vital;
}
async function updateVital(id, input) {
    const vital = await prisma_1.prisma.encounterVital.findUnique({
        where: {
            id,
        },
    });
    if (!vital) {
        throw new Error("VITAL_NOT_FOUND");
    }
    return prisma_1.prisma.encounterVital.update({
        where: {
            id,
        },
        data: {
            temperatureCelsius: input.temperatureCelsius,
            pulseRate: input.pulseRate,
            respiratoryRate: input.respiratoryRate,
            oxygenSaturation: input.oxygenSaturation,
            bloodPressureSystolic: input.bloodPressureSystolic,
            bloodPressureDiastolic: input.bloodPressureDiastolic,
            heightCm: input.heightCm,
            weightKg: input.weightKg,
            bmi: input.bmi,
            painScore: input.painScore,
            bloodGlucose: input.bloodGlucose,
            remarks: input.remarks?.trim(),
            recordedAt: input.recordedAt
                ? new Date(input.recordedAt)
                : undefined,
        },
    });
}
