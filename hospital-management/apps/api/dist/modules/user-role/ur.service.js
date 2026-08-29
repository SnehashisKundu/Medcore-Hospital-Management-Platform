"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserRole = assignUserRole;
exports.getAllUserRoles = getAllUserRoles;
exports.getUserRolesByUserId = getUserRolesByUserId;
exports.removeUserRole = removeUserRole;
const prisma_1 = require("../../config/prisma");
const aud_service_1 = require("../audit-log/aud.service");
async function assignUserRole(input) {
    const { userId, roleId, hospitalId, assignedById, } = input;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }
    if (!user.isActive) {
        throw new Error("USER_INACTIVE");
    }
    const role = await prisma_1.prisma.role.findUnique({
        where: { id: roleId },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    if (role.name === "SUPER_ADMIN") {
        if (hospitalId) {
            throw new Error("SUPER_ADMIN_CANNOT_HAVE_HOSPITAL");
        }
    }
    else {
        if (!hospitalId) {
            throw new Error("HOSPITAL_ID_REQUIRED");
        }
        const hospital = await prisma_1.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital || hospital.deletedAt) {
            throw new Error("HOSPITAL_NOT_FOUND");
        }
        if (!hospital.isActive) {
            throw new Error("HOSPITAL_INACTIVE");
        }
    }
    const existingAssignment = await prisma_1.prisma.userRole.findFirst({
        where: {
            userId,
            roleId,
            hospitalId: hospitalId ?? null,
        },
    });
    if (existingAssignment) {
        throw new Error("ROLE_ALREADY_ASSIGNED");
    }
    const userRole = await prisma_1.prisma.userRole.create({
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
    await (0, aud_service_1.createAuditLog)({
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
async function getAllUserRoles() {
    return prisma_1.prisma.userRole.findMany({
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
async function getUserRolesByUserId(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            deletedAt: true,
        },
    });
    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }
    return prisma_1.prisma.userRole.findMany({
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
async function removeUserRole(userRoleId, removedById) {
    const userRole = await prisma_1.prisma.userRole.findUnique({
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
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.userRole.delete({
            where: { id: userRoleId },
        });
        // Audit log outside transaction helper because
        // current createAuditLog uses the main prisma client.
    });
    await (0, aud_service_1.createAuditLog)({
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
