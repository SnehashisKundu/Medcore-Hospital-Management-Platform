"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBed = createBed;
exports.getBeds = getBeds;
exports.getBedAvailabilitySummary = getBedAvailabilitySummary;
exports.getBedById = getBedById;
exports.updateBed = updateBed;
exports.deleteBed = deleteBed;
const prisma_1 = require("../../config/prisma");
async function createBed(input) {
    const room = await prisma_1.prisma.room.findFirst({
        where: {
            id: input.roomId,
            isActive: true,
        },
    });
    if (!room) {
        throw new Error("ROOM_NOT_FOUND");
    }
    const bedNumber = input.bedNumber.trim().toUpperCase();
    const existingBed = await prisma_1.prisma.bed.findFirst({
        where: {
            roomId: input.roomId,
            bedNumber,
        },
    });
    if (existingBed) {
        throw new Error("BED_NUMBER_ALREADY_EXISTS");
    }
    return prisma_1.prisma.bed.create({
        data: {
            roomId: input.roomId,
            bedNumber,
            status: input.status ?? "AVAILABLE",
            dailyCharge: input.dailyCharge ?? 0,
            isActive: true,
        },
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
    });
}
async function getBeds(roomId, status) {
    return prisma_1.prisma.bed.findMany({
        where: {
            ...(roomId ? { roomId } : {}),
            ...(status ? { status: status } : {}),
            isActive: true,
        },
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
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getBedAvailabilitySummary(hospitalId) {
    const beds = await prisma_1.prisma.bed.findMany({
        where: {
            isActive: true,
            ...(hospitalId
                ? {
                    room: {
                        ward: {
                            hospitalId,
                        },
                    },
                }
                : {}),
        },
        select: {
            status: true,
            room: {
                select: {
                    ward: {
                        select: {
                            type: true,
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
    });
    const summary = new Map();
    for (const bed of beds) {
        const hospital = bed.room.ward.hospital;
        const wardType = bed.room.ward.type;
        if (!summary.has(hospital.id)) {
            summary.set(hospital.id, {
                hospital,
                wards: {},
            });
        }
        const hospitalSummary = summary.get(hospital.id);
        if (!hospitalSummary.wards[wardType]) {
            hospitalSummary.wards[wardType] = {
                total: 0,
                available: 0,
                occupied: 0,
                reserved: 0,
                cleaning: 0,
                maintenance: 0,
                blocked: 0,
            };
        }
        const wardSummary = hospitalSummary.wards[wardType];
        wardSummary.total++;
        if (bed.status === "AVAILABLE") {
            wardSummary.available++;
        }
        if (bed.status === "OCCUPIED") {
            wardSummary.occupied++;
        }
        if (bed.status === "RESERVED") {
            wardSummary.reserved++;
        }
        if (bed.status === "CLEANING") {
            wardSummary.cleaning++;
        }
        if (bed.status === "MAINTENANCE") {
            wardSummary.maintenance++;
        }
        if (bed.status === "BLOCKED") {
            wardSummary.blocked++;
        }
    }
    return Array.from(summary.values());
}
async function getBedById(id) {
    const bed = await prisma_1.prisma.bed.findFirst({
        where: {
            id,
            isActive: true,
        },
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
            allocations: {
                orderBy: {
                    allocatedAt: "desc",
                },
            },
        },
    });
    if (!bed) {
        throw new Error("BED_NOT_FOUND");
    }
    return bed;
}
async function updateBed(id, input) {
    const bed = await prisma_1.prisma.bed.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!bed) {
        throw new Error("BED_NOT_FOUND");
    }
    let bedNumber;
    if (input.bedNumber) {
        bedNumber = input.bedNumber.trim().toUpperCase();
        const existingBed = await prisma_1.prisma.bed.findFirst({
            where: {
                roomId: bed.roomId,
                bedNumber,
                NOT: {
                    id,
                },
            },
        });
        if (existingBed) {
            throw new Error("BED_NUMBER_ALREADY_EXISTS");
        }
    }
    return prisma_1.prisma.bed.update({
        where: {
            id,
        },
        data: {
            bedNumber,
            status: input.status,
            dailyCharge: input.dailyCharge,
            isActive: input.isActive,
        },
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
    });
}
async function deleteBed(id) {
    const bed = await prisma_1.prisma.bed.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!bed) {
        throw new Error("BED_NOT_FOUND");
    }
    if (bed.status === "OCCUPIED") {
        throw new Error("OCCUPIED_BED_CANNOT_BE_DELETED");
    }
    return prisma_1.prisma.bed.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
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
    });
}
