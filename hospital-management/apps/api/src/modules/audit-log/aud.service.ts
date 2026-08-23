import { Prisma,AuditAction } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";

interface CreateAuditLogInput {
  hospitalId?: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(
  input: CreateAuditLogInput
) {
  return prisma.auditLog.create({
    data: {
      hospitalId: input.hospitalId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      hospital: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAuditLogById(id: string) {
  const auditLog = await prisma.auditLog.findUnique({
    where: {
      id,
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
      hospital: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw new Error("AUDIT_LOG_NOT_FOUND");
  }

  return auditLog;
}