"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRooms = getRooms;
exports.getRoomById = getRoomById;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
const prisma_1 = require("../../config/prisma");
async function createRoom(input) {
    const ward = await prisma_1.prisma.ward.findFirst({
        where: {
            id: input.wardId,
            isActive: true,
        },
    });
    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }
    const roomNumber = input.roomNumber.trim().toUpperCase();
    const existing = await prisma_1.prisma.room.findFirst({
        where: {
            wardId: input.wardId,
            roomNumber,
        },
    });
    if (existing) {
        throw new Error("ROOM_NUMBER_ALREADY_EXISTS");
    }
    return prisma_1.prisma.room.create({
        data: {
            wardId: input.wardId,
            roomNumber,
            name: input.name?.trim(),
            dailyCharge: input.dailyCharge ?? 0,
            isActive: true,
        },
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
    });
}
async function getRooms(wardId) {
    return prisma_1.prisma.room.findMany({
        where: {
            ...(wardId ? { wardId } : {}),
            isActive: true,
        },
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
            beds: {
                where: {
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getRoomById(id) {
    const room = await prisma_1.prisma.room.findFirst({
        where: {
            id,
            isActive: true,
        },
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
            beds: {
                where: {
                    isActive: true,
                },
            },
        },
    });
    if (!room) {
        throw new Error("ROOM_NOT_FOUND");
    }
    return room;
}
async function updateRoom(id, input) {
    const room = await prisma_1.prisma.room.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!room) {
        throw new Error("ROOM_NOT_FOUND");
    }
    let roomNumber;
    if (input.roomNumber) {
        roomNumber = input.roomNumber.trim().toUpperCase();
        const existing = await prisma_1.prisma.room.findFirst({
            where: {
                wardId: room.wardId,
                roomNumber,
                NOT: {
                    id,
                },
            },
        });
        if (existing) {
            throw new Error("ROOM_NUMBER_ALREADY_EXISTS");
        }
    }
    return prisma_1.prisma.room.update({
        where: {
            id,
        },
        data: {
            roomNumber,
            name: input.name === undefined ? undefined : input.name?.trim() ?? null,
            dailyCharge: input.dailyCharge,
            isActive: input.isActive,
        },
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
    });
}
async function deleteRoom(id) {
    const room = await prisma_1.prisma.room.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!room) {
        throw new Error("ROOM_NOT_FOUND");
    }
    return prisma_1.prisma.room.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
}
