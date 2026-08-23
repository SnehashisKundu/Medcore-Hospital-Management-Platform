import { prisma } from "../../config/prisma";
import type { ProcedureCategory } from "../../generated/prisma/client";

export async function createProcedure(
  name: string,
  code: string,
  category: ProcedureCategory,
  description?: string
) {
  const existingProcedure = await prisma.procedure.findUnique({
    where: {
      code,
    },
  });

  if (existingProcedure) {
    throw new Error("Procedure code already exists");
  }

  return prisma.procedure.create({
    data: {
      name,
      code,
      category,
      description,
    },
  });
}

export async function getProcedures() {
  return prisma.procedure.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProcedureById(id: string) {
  const procedure = await prisma.procedure.findUnique({
    where: {
      id,
    },
  });

  if (!procedure || !procedure.isActive) {
    throw new Error("Procedure not found");
  }

  return procedure;
}

export async function updateProcedure(
  id: string,
  name?: string,
  code?: string,
  category?: ProcedureCategory,
  description?: string
) {
  const existingProcedure = await prisma.procedure.findUnique({
    where: {
      id,
    },
  });

  if (!existingProcedure || !existingProcedure.isActive) {
    throw new Error("Procedure not found");
  }

  if (code && code !== existingProcedure.code) {
    const duplicateCode = await prisma.procedure.findUnique({
      where: {
        code,
      },
    });

    if (duplicateCode) {
      throw new Error("Procedure code already exists");
    }
  }

  return prisma.procedure.update({
    where: {
      id,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
    },
  });
}

export async function deleteProcedure(id: string) {
  const existingProcedure = await prisma.procedure.findUnique({
    where: {
      id,
    },
  });

  if (!existingProcedure || !existingProcedure.isActive) {
    throw new Error("Procedure not found");
  }

  return prisma.procedure.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}