import { prisma } from "../../config/prisma";
import { createAuditLog } from "../audit-log/aud.service";

interface CreatePermissionInput {
  name: string;
  description?: string;
}

interface UpdatePermissionInput {
  name?: string;
  description?: string | null;
}

export async function createPermission(
  input: CreatePermissionInput
) {
  const name = input.name.trim().toUpperCase();

  const existing = await prisma.permission.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error("PERMISSION_NAME_EXISTS");
  }

  return prisma.permission.create({
    data: {
      name,
      description: input.description?.trim(),
    },
  });
}

export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPermissionById(id: string) {
  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!permission) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  return permission;
}

export async function updatePermission(
  id: string,
  input: UpdatePermissionInput
) {
  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!permission) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  const data: UpdatePermissionInput = {};

  if (input.name !== undefined) {
    const name = input.name.trim().toUpperCase();

    const existing = await prisma.permission.findUnique({
      where: { name },
    });

    if (existing && existing.id !== id) {
      throw new Error("PERMISSION_NAME_EXISTS");
    }

    data.name = name;
  }

  if (input.description !== undefined) {
    data.description =
      input.description === null
        ? null
        : input.description.trim();
  }

  return prisma.permission.update({
    where: { id },
    data,
  });
}

export async function deletePermission(id: string) {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: true,
    },
  });

  if (!permission) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  // Don't allow deleting a permission currently assigned to roles
  if (permission.roles.length > 0) {
    throw new Error("PERMISSION_ASSIGNED_TO_ROLE");
  }

  await prisma.permission.delete({
    where: { id },
  });

  return permission;
}

export async function logPermissionAudit(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  permission: {
    id: string;
    name: string;
    description: string | null;
  }
) {
  await createAuditLog({
    userId,
    action,
    entityType: "PERMISSION",
    entityId: permission.id,
    metadata: {
      name: permission.name,
      description: permission.description,
    },
  });
}