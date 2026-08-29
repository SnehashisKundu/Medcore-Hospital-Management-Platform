"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreatmentPlan = createTreatmentPlan;
exports.getTreatmentPlans = getTreatmentPlans;
exports.getTreatmentPlanById = getTreatmentPlanById;
exports.updateTreatmentPlan = updateTreatmentPlan;
exports.deleteTreatmentPlan = deleteTreatmentPlan;
const prisma_1 = require("../../config/prisma");
const browser_1 = require("../../generated/prisma/browser");
async function createTreatmentPlan(input) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id: input.encounterId,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    // Cannot add new clinical data
    // to a cancelled encounter
    if (encounter.status === "CANCELLED") {
        throw new Error("ENCOUNTER_CANCELLED");
    }
    const title = input.title.trim();
    if (!title) {
        throw new Error("TREATMENT_PLAN_TITLE_REQUIRED");
    }
    const description = input.description?.trim() || null;
    return prisma_1.prisma.treatmentPlan.create({
        data: {
            encounterId: input.encounterId,
            title,
            description,
            status: browser_1.TreatmentPlanStatus.ACTIVE,
        },
        include: {
            encounter: {
                select: {
                    id: true,
                    encounterNumber: true,
                    patientId: true,
                    hospitalId: true,
                },
            },
        },
    });
}
async function getTreatmentPlans(encounterId, status) {
    return prisma_1.prisma.treatmentPlan.findMany({
        where: {
            ...(encounterId
                ? { encounterId }
                : {}),
            ...(status
                ? { status }
                : {}),
        },
        include: {
            encounter: {
                select: {
                    id: true,
                    encounterNumber: true,
                    patientId: true,
                    hospitalId: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getTreatmentPlanById(id) {
    const treatmentPlan = await prisma_1.prisma.treatmentPlan.findUnique({
        where: {
            id,
        },
        include: {
            encounter: {
                select: {
                    id: true,
                    encounterNumber: true,
                    patientId: true,
                    hospitalId: true,
                },
            },
        },
    });
    if (!treatmentPlan) {
        throw new Error("TREATMENT_PLAN_NOT_FOUND");
    }
    return treatmentPlan;
}
async function updateTreatmentPlan(id, input) {
    const treatmentPlan = await prisma_1.prisma.treatmentPlan.findUnique({
        where: {
            id,
        },
        include: {
            encounter: true,
        },
    });
    if (!treatmentPlan) {
        throw new Error("TREATMENT_PLAN_NOT_FOUND");
    }
    // Do not modify treatment data
    // after encounter cancellation
    if (treatmentPlan.encounter.status ===
        "CANCELLED") {
        throw new Error("ENCOUNTER_CANCELLED");
    }
    if (input.title !== undefined) {
        const title = input.title.trim();
        if (!title) {
            throw new Error("TREATMENT_PLAN_TITLE_REQUIRED");
        }
    }
    const currentStatus = treatmentPlan.status;
    const newStatus = input.status ?? currentStatus;
    // Terminal treatment plans cannot
    // move to another status
    if ((currentStatus ===
        browser_1.TreatmentPlanStatus.COMPLETED ||
        currentStatus ===
            browser_1.TreatmentPlanStatus.CANCELLED) &&
        newStatus !== currentStatus) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    // ACTIVE can only move forward
    if (currentStatus ===
        browser_1.TreatmentPlanStatus.ACTIVE &&
        input.status !== undefined &&
        input.status !== currentStatus &&
        input.status !==
            browser_1.TreatmentPlanStatus.COMPLETED &&
        input.status !==
            browser_1.TreatmentPlanStatus.CANCELLED) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    return prisma_1.prisma.treatmentPlan.update({
        where: {
            id,
        },
        data: {
            ...(input.title !== undefined
                ? {
                    title: input.title.trim(),
                }
                : {}),
            ...(input.description !== undefined
                ? {
                    description: input.description === null
                        ? null
                        : input.description.trim() || null,
                }
                : {}),
            ...(input.status !== undefined
                ? {
                    status: input.status,
                }
                : {}),
        },
        include: {
            encounter: {
                select: {
                    id: true,
                    encounterNumber: true,
                    patientId: true,
                    hospitalId: true,
                },
            },
        },
    });
}
async function deleteTreatmentPlan(id) {
    const treatmentPlan = await prisma_1.prisma.treatmentPlan.findUnique({
        where: {
            id,
        },
    });
    if (!treatmentPlan) {
        throw new Error("TREATMENT_PLAN_NOT_FOUND");
    }
    return prisma_1.prisma.treatmentPlan.delete({
        where: {
            id,
        },
        include: {
            encounter: {
                select: {
                    id: true,
                    encounterNumber: true,
                    patientId: true,
                    hospitalId: true,
                },
            },
        },
    });
}
