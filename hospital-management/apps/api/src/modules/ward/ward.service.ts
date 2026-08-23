import { prisma } from "../../config/prisma";

interface CreateWardInput {
  hospitalId: string;
  name: string;
  code: string;
  type:
    | "GENERAL"
    | "ICU"
    | "NICU"
    | "PICU"
    | "CCU"
    | "EMERGENCY"
    | "MATERNITY"
    | "PEDIATRIC"
    | "ISOLATION"
    | "OTHER";
  floor: number;
}

interface UpdateWardInput {
  name?: string;
  code?: string;
  type?:
    | "GENERAL"
    | "ICU"
    | "NICU"
    | "PICU"
    | "CCU"
    | "EMERGENCY"
    | "MATERNITY"
    | "PEDIATRIC"
    | "ISOLATION"
    | "OTHER";
  floor?: number;
  isActive?: boolean;
}

export async function createWard(
  input: CreateWardInput
) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id: input.hospitalId,
      isActive: true,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const code = input.code.trim().toUpperCase();

  const existing = await prisma.ward.findFirst({
    where: {
      hospitalId: input.hospitalId,
      code,
    },
  });

  if (existing) {
    throw new Error("WARD_CODE_ALREADY_EXISTS");
  }

  return prisma.ward.create({
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

export async function getWards(
  hospitalId?: string
) {
  return prisma.ward.findMany({
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

export async function getWardById(id: string) {
  const ward = await prisma.ward.findFirst({
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

export async function updateWard(
  id: string,
  input: UpdateWardInput
) {
  const ward = await prisma.ward.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!ward) {
    throw new Error("WARD_NOT_FOUND");
  }

  let code: string | undefined;

  if (input.code) {
    code = input.code.trim().toUpperCase();

    const existing = await prisma.ward.findFirst({
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

  return prisma.ward.update({
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

export async function deleteWard(id: string) {
  const ward = await prisma.ward.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!ward) {
    throw new Error("WARD_NOT_FOUND");
  }

  return prisma.ward.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}