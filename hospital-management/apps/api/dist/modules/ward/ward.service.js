"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWard = createWard;
exports.getWards = getWards;
exports.getWardById = getWardById;
exports.updateWard = updateWard;
exports.deleteWard = deleteWard;
const prisma_1 = require("../../config/prisma");
async function createWard(input) {
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: input.hospitalId,
            isActive: true,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const code = input.code.trim().toUpperCase();
    const existing = await prisma_1.prisma.ward.findFirst({
        where: {
            hospitalId: input.hospitalId,
            code,
        },
    });
    if (existing) {
        throw new Error("WARD_CODE_ALREADY_EXISTS");
    }
    return prisma_1.prisma.ward.create({
        data: {
            hospitalId: input.hospitalId,
            name: input.name.trim(),
            code,
            type: input.type,
            floor: input.floor,
            isActive: true,
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
}
async function getWards(hospitalId) {
    return prisma_1.prisma.ward.findMany({
        where: {
            ...(hospitalId
                ? {
                    hospitalId,
                }
                : {}),
            isActive: true,
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            rooms: {
                where: {
                    isActive: true,
                },
                include: {
                    beds: {
                        where: {
                            isActive: true,
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
async function getWardById(id) {
    const ward = await prisma_1.prisma.ward.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            rooms: {
                where: {
                    isActive: true,
                },
                include: {
                    beds: {
                        where: {
                            isActive: true,
                        },
                    },
                },
            },
        },
    });
    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }
    return ward;
}
async function updateWard(id, input) {
    const ward = await prisma_1.prisma.ward.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }
    let code;
    if (input.code) {
        code = input.code.trim().toUpperCase();
        const existing = await prisma_1.prisma.ward.findFirst({
            where: {
                hospitalId: ward.hospitalId,
                code,
                NOT: {
                    id,
                },
            },
        });
        if (existing) {
            throw new Error("WARD_CODE_ALREADY_EXISTS");
        }
    }
    return prisma_1.prisma.ward.update({
        where: {
            id,
        },
        data: {
            name: input.name?.trim(),
            code,
            type: input.type,
            floor: input.floor,
            isActive: input.isActive,
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
}
async function deleteWard(id) {
    const ward = await prisma_1.prisma.ward.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }
    return prisma_1.prisma.ward.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
}
