import { prisma } from "../../config/prisma";
import { createAuditLog } from "../audit-log/aud.service";

interface AssignPermissionInput {
  roleId: string;
  permissionId: string;
  assignedById: string;
}

export async function assignPermissionToRole(
  input: AssignPermissionInput
) {
  const { roleId, permissionId, assignedById } = input;

  // Check role
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  // Check permission
  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  // Check duplicate assignment
  const existingMapping = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  if (existingMapping) {
    throw new Error("ROLE_PERMISSION_ALREADY_EXISTS");
  }

  const rolePermission = await prisma.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
    include: {
      role: true,
      permission: true,
    },
  });

  await createAuditLog({
    userId: assignedById,
    action: "CREATE",
    entityType: "ROLE_PERMISSION",
    entityId: rolePermission.id,
    metadata: {
      roleId,
      roleName: role.name,
      permissionId,
      permissionName: permission.name,
    },
  });

  return rolePermission;
}

export async function getAllRolePermissions() {
  return prisma.rolePermission.findMany({
    include: {
      role: true,
      permission: true,
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function getPermissionsByRoleId(roleId: string) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  return prisma.rolePermission.findMany({
    where: { roleId },
    include: {
      role: true,
      permission: true,
    },
  });
}

export async function removePermissionFromRole(
  id: string,
  removedById: string
) {
  const rolePermission = await prisma.rolePermission.findUnique({
    where: { id },
    include: {
      role: true,
      permission: true,
    },
  });

  if (!rolePermission) {
    throw new Error("ROLE_PERMISSION_NOT_FOUND");
  }

  await prisma.rolePermission.delete({
    where: { id },
  });

  await createAuditLog({
    userId: removedById,
    action: "DELETE",
    entityType: "ROLE_PERMISSION",
    entityId: rolePermission.id,
    metadata: {
      roleId: rolePermission.roleId,
      roleName: rolePermission.role.name,
      permissionId: rolePermission.permissionId,
      permissionName: rolePermission.permission.name,
    },
  });

  return rolePermission;
}