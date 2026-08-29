"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.getAuditLogs = getAuditLogs;
exports.getAuditLogById = getAuditLogById;
const prisma_1 = require("../../config/prisma");
async function createAuditLog(input) {
    return prisma_1.prisma.auditLog.create({
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
async function getAuditLogs() {
    return prisma_1.prisma.auditLog.findMany({
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
async function getAuditLogById(id) {
    const auditLog = await prisma_1.prisma.auditLog.findUnique({
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
