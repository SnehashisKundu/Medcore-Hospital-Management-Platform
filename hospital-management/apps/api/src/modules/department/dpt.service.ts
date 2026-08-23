import { prisma } from "../../config/prisma";

interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
}

export async function createDepartment(
  hospitalId: string,
  input: CreateDepartmentInput
) {
  // Check hospital exists
  const hospital = await prisma.hospital.findFirst({
    where: {
      id: hospitalId,
      deletedAt: null,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const existingDepartment = await prisma.department.findFirst({
    where: {
      hospitalId,
      code: input.code.trim().toUpperCase(),
    },
  });

  if (existingDepartment) {
    throw new Error("DEPARTMENT_CODE_EXISTS");
  }

  return prisma.department.create({
    data: {
      hospitalId,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      description: input.description?.trim(),
    },
  });
}

export async function getDepartments(hospitalId: string) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id: hospitalId,
      deletedAt: null,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  return prisma.department.findMany({
    where: {
      hospitalId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDepartmentById(
  hospitalId: string,
  departmentId: string
) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      hospitalId,
      isActive: true,
    },
  });

  if (!department) {
    throw new Error("DEPARTMENT_NOT_FOUND");
  }

  return department;
}

interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export async function updateDepartment(
  hospitalId: string,
  departmentId: string,
  input: UpdateDepartmentInput
) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      hospitalId,
      isActive: true,
    },
  });

  if (!department) {
    throw new Error("DEPARTMENT_NOT_FOUND");
  }

  if (input.code) {
    const normalizedCode = input.code.trim().toUpperCase();

    const existingDepartment = await prisma.department.findFirst({
      where: {
        hospitalId,
        code: normalizedCode,
        id: {
          not: departmentId,
        },
      },
    });

    if (existingDepartment) {
      throw new Error("DEPARTMENT_CODE_EXISTS");
    }
  }

  return prisma.department.update({
    where: {
      id: departmentId,
    },
    data: {
      name: input.name?.trim(),
      code: input.code?.trim().toUpperCase(),
      description: input.description?.trim(),
      isActive: input.isActive,
    },
  });
}

export async function deleteDepartment(
  hospitalId: string,
  departmentId: string
) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      hospitalId,
      isActive: true,
    },
  });

  if (!department) {
    throw new Error("DEPARTMENT_NOT_FOUND");
  }

  return prisma.department.update({
    where: {
      id: departmentId,
    },
    data: {
      isActive: false,
    },
  });
}