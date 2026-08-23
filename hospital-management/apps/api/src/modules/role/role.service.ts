import { prisma } from "../../config/prisma";
import { createAuditLog } from "../audit-log/aud.service";

const SYSTEM_ROLES = new Set([
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "RADIOLOGIST",
  "BILLING_STAFF",
]);

interface CreateRoleInput {
  name: string;
  description?: string;
  createdById: string;
}

interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  updatedById: string;
}

export async function createRole(input: CreateRoleInput) {
  const { name, description, createdById } = input;

  const normalizedName = name.trim().toUpperCase();

  const existingRole = await prisma.role.findUnique({
    where: { name: normalizedName },
  });

  if (existingRole) {
    throw new Error("ROLE_ALREADY_EXISTS");
  }

  const role = await prisma.role.create({
    data: {
      name: normalizedName,
      description: description?.trim() || null,
    },
  });

  await createAuditLog({
    userId: createdById,
    action: "CREATE",
    entityType: "ROLE",
    entityId: role.id,
    metadata: {
      name: role.name,
      description: role.description,
    },
  });

  return role;
}

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  return role;
}

export async function updateRole(
  id: string,
  input: UpdateRoleInput
) {
  const { name, description, isActive, updatedById } = input;

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  // System roles cannot be renamed
  if (
    SYSTEM_ROLES.has(role.name) &&
    name !== undefined &&
    name.trim().toUpperCase() !== role.name
  ) {
    throw new Error("SYSTEM_ROLE_CANNOT_BE_RENAMED");
  }

  let normalizedName: string | undefined;

  if (name !== undefined) {
    normalizedName = name.trim().toUpperCase();

    const existingRole = await prisma.role.findFirst({
      where: {
        name: normalizedName,
        NOT: {
          id,
        },
      },
    });

    if (existingRole) {
      throw new Error("ROLE_ALREADY_EXISTS");
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      ...(normalizedName !== undefined && {
        name: normalizedName,
      }),
      ...(description !== undefined && {
        description: description?.trim() || null,
      }),
      ...(isActive !== undefined && {
        isActive,
      }),
    },
  });

  await createAuditLog({
    userId: updatedById,
    action: "UPDATE",
    entityType: "ROLE",
    entityId: updatedRole.id,
    metadata: {
      before: {
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      },
      after: {
        name: updatedRole.name,
        description: updatedRole.description,
        isActive: updatedRole.isActive,
      },
    },
  });

  return updatedRole;
}

export async function deleteRole(
  id: string,
  deletedById: string
) {
  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  if (SYSTEM_ROLES.has(role.name)) {
    throw new Error("SYSTEM_ROLE_CANNOT_BE_DELETED");
  }

  // Soft delete by deactivating
  const deletedRole = await prisma.role.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  await createAuditLog({
    userId: deletedById,
    action: "DELETE",
    entityType: "ROLE",
    entityId: deletedRole.id,
    metadata: {
      name: deletedRole.name,
      description: deletedRole.description,
    },
  });

  return deletedRole;
}