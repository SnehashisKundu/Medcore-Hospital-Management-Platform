import { prisma } from "../../config/prisma";
import { DiagnosticCategory } from "../../generated/prisma/client";

interface CreateDiagnosticTestInput {
  name: string;
  code: string;
  category: DiagnosticCategory;
  description?: string;
}

interface UpdateDiagnosticTestInput {
  name?: string;
  code?: string;
  category?: DiagnosticCategory;
  description?: string;
  isActive?: boolean;
}

export async function createDiagnosticTest(
  input: CreateDiagnosticTestInput
) {
  const existing = await prisma.diagnosticTest.findUnique({
    where: {
      code: input.code.trim(),
    },
  });

  if (existing) {
    throw new Error("DIAGNOSTIC_TEST_ALREADY_EXISTS");
  }

  return prisma.diagnosticTest.create({
    data: {
      name: input.name.trim(),
      code: input.code.trim(),
      category: input.category,
      description: input.description?.trim(),
      isActive: true,
    },
  });
}

export async function getDiagnosticTests() {
  return prisma.diagnosticTest.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getDiagnosticTestById(id: string) {
  const test = await prisma.diagnosticTest.findUnique({
    where: {
      id,
    },
  });

  if (!test) {
    throw new Error("DIAGNOSTIC_TEST_NOT_FOUND");
  }

  return test;
}

export async function updateDiagnosticTest(
  id: string,
  input: UpdateDiagnosticTestInput
) {
  const test = await prisma.diagnosticTest.findUnique({
    where: {
      id,
    },
  });

  if (!test) {
    throw new Error("DIAGNOSTIC_TEST_NOT_FOUND");
  }

  if (input.code && input.code.trim() !== test.code) {
    const existing = await prisma.diagnosticTest.findUnique({
      where: {
        code: input.code.trim(),
      },
    });

    if (existing) {
      throw new Error("DIAGNOSTIC_TEST_ALREADY_EXISTS");
    }
  }

  return prisma.diagnosticTest.update({
    where: {
      id,
    },
    data: {
      name: input.name?.trim(),
      code: input.code?.trim(),
      category: input.category ?? test.category,
      description: input.description?.trim(),
      isActive: input.isActive,
    },
  });
}