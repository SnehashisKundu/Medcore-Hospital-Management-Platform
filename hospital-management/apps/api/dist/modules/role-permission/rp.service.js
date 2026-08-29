"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPermissionToRole = assignPermissionToRole;
exports.getAllRolePermissions = getAllRolePermissions;
exports.getPermissionsByRoleId = getPermissionsByRoleId;
exports.removePermissionFromRole = removePermissionFromRole;
const prisma_1 = require("../../config/prisma");
const aud_service_1 = require("../audit-log/aud.service");
async function assignPermissionToRole(input) {
    const { roleId, permissionId, assignedById } = input;
    // Check role
    const role = await prisma_1.prisma.role.findUnique({
        where: { id: roleId },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    // Check permission
    const permission = await prisma_1.prisma.permission.findUnique({
        where: { id: permissionId },
    });
    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }
    // Check duplicate assignment
    const existingMapping = await prisma_1.prisma.rolePermission.findUnique({
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
    const rolePermission = await prisma_1.prisma.rolePermission.create({
        data: {
            roleId,
            permissionId,
        },
        include: {
            role: true,
            permission: true,
        },
    });
    await (0, aud_service_1.createAuditLog)({
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
async function getAllRolePermissions() {
    return prisma_1.prisma.rolePermission.findMany({
        include: {
            role: true,
            permission: true,
        },
        orderBy: {
            id: "desc",
        },
    });
}
async function getPermissionsByRoleId(roleId) {
    const role = await prisma_1.prisma.role.findUnique({
        where: { id: roleId },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    return prisma_1.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
            role: true,
            permission: true,
        },
    });
}
async function removePermissionFromRole(id, removedById) {
    const rolePermission = await prisma_1.prisma.rolePermission.findUnique({
        where: { id },
        include: {
            role: true,
            permission: true,
        },
    });
    if (!rolePermission) {
        throw new Error("ROLE_PERMISSION_NOT_FOUND");
    }
    await prisma_1.prisma.rolePermission.delete({
        where: { id },
    });
    await (0, aud_service_1.createAuditLog)({
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
