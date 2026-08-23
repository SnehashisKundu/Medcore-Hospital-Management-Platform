import { prisma } from "../../config/prisma";
import { createAuditLog } from "../audit-log/aud.service";

interface AssignUserRoleInput {
  userId: string;
  roleId: string;
  hospitalId?: string | null;
  assignedById: string;
}

export async function assignUserRole(
  input: AssignUserRoleInput
) {
  const {
    userId,
    roleId,
    hospitalId,
    assignedById,
  } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.deletedAt) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  if (role.name === "SUPER_ADMIN") {
    if (hospitalId) {
      throw new Error(
        "SUPER_ADMIN_CANNOT_HAVE_HOSPITAL"
      );
    }
  } else {
    if (!hospitalId) {
      throw new Error("HOSPITAL_ID_REQUIRED");
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital || hospital.deletedAt) {
      throw new Error("HOSPITAL_NOT_FOUND");
    }

    if (!hospital.isActive) {
      throw new Error("HOSPITAL_INACTIVE");
    }
  }

  const existingAssignment =
    await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        hospitalId: hospitalId ?? null,
      },
    });

  if (existingAssignment) {
    throw new Error("ROLE_ALREADY_ASSIGNED");
  }

  const userRole = await prisma.userRole.create({
    data: {
      userId,
      roleId,
      hospitalId: hospitalId ?? null,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  await createAuditLog({
    userId: assignedById,
    hospitalId: hospitalId ?? undefined,
    action: "CREATE",
    entityType: "USER_ROLE",
    entityId: userRole.id,
    metadata: {
      targetUserId: userId,
      roleId,
      roleName: role.name,
      hospitalId: hospitalId ?? null,
    },
  });

  return userRole;
}

export async function getAllUserRoles() {
  return prisma.userRole.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function getUserRolesByUserId(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function removeUserRole(
  userRoleId: string,
  removedById: string
) {
  const userRole = await prisma.userRole.findUnique({
    where: { id: userRoleId },
    include: {
      role: true,
    },
  });

  if (!userRole) {
    throw new Error("USER_ROLE_NOT_FOUND");
  }

  const auditData = {
    targetUserId: userRole.userId,
    roleId: userRole.roleId,
    roleName: userRole.role.name,
    hospitalId: userRole.hospitalId,
  };

  await prisma.$transaction(async (tx) => {
    await tx.userRole.delete({
      where: { id: userRoleId },
    });

    // Audit log outside transaction helper because
    // current createAuditLog uses the main prisma client.
  });

  await createAuditLog({
    userId: removedById,
    hospitalId: userRole.hospitalId ?? undefined,
    action: "DELETE",
    entityType: "USER_ROLE",
    entityId: userRoleId,
    metadata: auditData,
  });

  return {
    id: userRoleId,
    message: "Role removed successfully",
  };
}