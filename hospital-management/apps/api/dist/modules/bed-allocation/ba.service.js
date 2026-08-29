"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocateBed = allocateBed;
exports.releaseBed = releaseBed;
exports.getBedAllocations = getBedAllocations;
const prisma_1 = require("../../config/prisma");
async function allocateBed(input) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const admission = await tx.admission.findUnique({
            where: {
                id: input.admissionId,
            },
        });
        if (!admission) {
            throw new Error("ADMISSION_NOT_FOUND");
        }
        if (admission.status !== "ADMITTED") {
            throw new Error("ADMISSION_NOT_ACTIVE");
        }
        const bed = await tx.bed.findFirst({
            where: {
                id: input.bedId,
                isActive: true,
            },
        });
        if (!bed) {
            throw new Error("BED_NOT_FOUND");
        }
        if (bed.status !== "AVAILABLE") {
            throw new Error("BED_NOT_AVAILABLE");
        }
        const existingAllocation = await tx.bedAllocation.findFirst({
            where: {
                admissionId: input.admissionId,
                releasedAt: null,
            },
        });
        if (existingAllocation) {
            throw new Error("ADMISSION_ALREADY_HAS_ACTIVE_BED");
        }
        const allocation = await tx.bedAllocation.create({
            data: {
                admissionId: input.admissionId,
                bedId: input.bedId,
            },
            include: {
                admission: {
                    select: {
                        id: true,
                        admissionNumber: true,
                        status: true,
                        hospitalId: true,
                    },
                },
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
        });
        await tx.bed.update({
            where: {
                id: input.bedId,
            },
            data: {
                status: "OCCUPIED",
            },
        });
        return allocation;
    });
}
async function releaseBed(allocationId) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const allocation = await tx.bedAllocation.findUnique({
            where: {
                id: allocationId,
            },
            include: {
                admission: true,
                bed: true,
            },
        });
        if (!allocation) {
            throw new Error("ALLOCATION_NOT_FOUND");
        }
        if (allocation.releasedAt) {
            throw new Error("BED_ALREADY_RELEASED");
        }
        const releasedAt = new Date();
        const updatedAllocation = await tx.bedAllocation.update({
            where: {
                id: allocationId,
            },
            data: {
                releasedAt,
            },
            include: {
                admission: {
                    select: {
                        id: true,
                        admissionNumber: true,
                        hospitalId: true,
                    },
                },
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
        });
        await tx.bed.update({
            where: {
                id: allocation.bedId,
            },
            data: {
                status: "AVAILABLE",
            },
        });
        return updatedAllocation;
    });
}
async function getBedAllocations(admissionId, bedId) {
    return prisma_1.prisma.bedAllocation.findMany({
        where: {
            ...(admissionId ? { admissionId } : {}),
            ...(bedId ? { bedId } : {}),
        },
        include: {
            admission: {
                select: {
                    id: true,
                    admissionNumber: true,
                    status: true,
                    hospitalId: true,
                },
            },
            bed: {
                include: {
                    room: {
                        include: {
                            ward: {
                                include: {
                                    hospital: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            allocatedAt: "desc",
        },
    });
}
