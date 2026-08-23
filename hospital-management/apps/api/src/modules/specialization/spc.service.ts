import { prisma } from "../../config/prisma";

interface CreateSpecializationInput {
  name: string;
  code: string;
  description?: string;
}

export async function createSpecialization(
  input: CreateSpecializationInput
) {
  const code = input.code.trim().toUpperCase();

  const existing = await prisma.specialization.findUnique({
    where: {
      code,
    },
  });

  if (existing) {
    throw new Error("SPECIALIZATION_CODE_EXISTS");
  }

  return prisma.specialization.create({
    data: {
      name: input.name.trim(),
      code,
      description: input.description?.trim(),
    },
  });
}

export async function getSpecializations() {
  return prisma.specialization.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSpecializationById(id: string) {
  const specialization = await prisma.specialization.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!specialization) {
    throw new Error("SPECIALIZATION_NOT_FOUND");
  }

  return specialization;
}