import { prisma } from "../../config/prisma";

interface CreateRoomInput {
  wardId: string;
  roomNumber: string;
  name?: string;
  dailyCharge?: number;
}

interface UpdateRoomInput {
  roomNumber?: string;
  name?: string | null;
  dailyCharge?: number;
  isActive?: boolean;
}

export async function createRoom(input: CreateRoomInput) {
  const ward = await prisma.ward.findFirst({
    where: {
      id: input.wardId,
      isActive: true,
    },
  });

  if (!ward) {
    throw new Error("WARD_NOT_FOUND");
  }

  const roomNumber = input.roomNumber.trim().toUpperCase();

  const existing = await prisma.room.findFirst({
    where: {
      wardId: input.wardId,
      roomNumber,
    },
  });

  if (existing) {
    throw new Error("ROOM_NUMBER_ALREADY_EXISTS");
  }

  return prisma.room.create({
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

export async function getRooms(wardId?: string) {
  return prisma.room.findMany({
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

export async function getRoomById(id: string) {
  const room = await prisma.room.findFirst({
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

export async function updateRoom(
  id: string,
  input: UpdateRoomInput
) {
  const room = await prisma.room.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  let roomNumber: string | undefined;

  if (input.roomNumber) {
    roomNumber = input.roomNumber.trim().toUpperCase();

    const existing = await prisma.room.findFirst({
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

  return prisma.room.update({
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

export async function deleteRoom(id: string) {
  const room = await prisma.room.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  return prisma.room.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}