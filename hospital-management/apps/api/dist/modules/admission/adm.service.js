"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmission = createAdmission;
exports.getAdmissions = getAdmissions;
exports.getAdmissionById = getAdmissionById;
exports.updateAdmission = updateAdmission;
exports.deleteAdmission = deleteAdmission;
const prisma_1 = require("../../config/prisma");
async function createAdmission(input) {
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: input.hospitalId,
            isActive: true,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    if (!input.encounterId) {
        const activeEncounter = await prisma_1.prisma.encounter.findFirst({
            where: {
                hospitalId: input.hospitalId,
                patientId: input.patientId,
                status: "ACTIVE",
            },
            orderBy: {
                startedAt: "desc",
            },
            select: {
                id: true,
            },
        });
        input.encounterId = activeEncounter?.id;
    }
    if (input.encounterId) {
        const encounter = await prisma_1.prisma.encounter.findFirst({
            where: {
                id: input.encounterId,
            },
        });
        if (!encounter) {
            throw new Error("ENCOUNTER_NOT_FOUND");
        }
    }
    const admissionNumber = input.admissionNumber.trim().toUpperCase();
    const existingAdmission = await prisma_1.prisma.admission.findFirst({
        where: {
            hospitalId: input.hospitalId,
            admissionNumber,
        },
    });
    if (existingAdmission) {
        throw new Error("ADMISSION_NUMBER_ALREADY_EXISTS");
    }
    return prisma_1.prisma.admission.create({
        data: {
            hospitalId: input.hospitalId,
            patientId: input.patientId,
            encounterId: input.encounterId,
            admissionNumber,
            reason: input.reason?.trim(),
            status: "ADMITTED",
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            patient: true,
            encounter: true,
        },
    });
}
async function getAdmissions(hospitalId, patientId, status) {
    return prisma_1.prisma.admission.findMany({
        where: {
            ...(hospitalId ? { hospitalId } : {}),
            ...(patientId ? { patientId } : {}),
            ...(status ? { status: status } : {}),
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            patient: true,
            encounter: true,
            bedAllocations: {
                where: {
                    releasedAt: null,
                },
                include: {
                    bed: {
                        include: {
                            room: {
                                include: {
                                    ward: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            admittedAt: "desc",
        },
    });
}
async function getAdmissionById(id) {
    const admission = await prisma_1.prisma.admission.findUnique({
        where: {
            id,
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            patient: true,
            encounter: true,
            bedAllocations: {
                include: {
                    bed: {
                        include: {
                            room: {
                                include: {
                                    ward: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    allocatedAt: "desc",
                },
            },
        },
    });
    if (!admission) {
        throw new Error("ADMISSION_NOT_FOUND");
    }
    return admission;
}
async function updateAdmission(id, input) {
    const admission = await prisma_1.prisma.admission.findUnique({
        where: {
            id,
        },
    });
    if (!admission) {
        throw new Error("ADMISSION_NOT_FOUND");
    }
    if (input.status === "DISCHARGED" && !input.dischargedAt) {
        input.dischargedAt = new Date();
    }
    return prisma_1.prisma.admission.update({
        where: {
            id,
        },
        data: {
            reason: input.reason === undefined
                ? undefined
                : input.reason?.trim() ?? null,
            status: input.status,
            dischargedAt: input.dischargedAt === undefined
                ? undefined
                : input.dischargedAt === null
                    ? null
                    : new Date(input.dischargedAt),
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            patient: true,
            encounter: true,
        },
    });
}
async function deleteAdmission(id) {
    const admission = await prisma_1.prisma.admission.findUnique({
        where: {
            id,
        },
    });
    if (!admission) {
        throw new Error("ADMISSION_NOT_FOUND");
    }
    if (admission.status === "ADMITTED") {
        throw new Error("ACTIVE_ADMISSION_CANNOT_BE_DELETED");
    }
    return prisma_1.prisma.admission.delete({
        where: {
            id,
        },
    });
}
