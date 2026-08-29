"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPermission = createPermission;
exports.getPermissions = getPermissions;
exports.getPermissionById = getPermissionById;
exports.updatePermission = updatePermission;
exports.deletePermission = deletePermission;
exports.logPermissionAudit = logPermissionAudit;
const prisma_1 = require("../../config/prisma");
const aud_service_1 = require("../audit-log/aud.service");
async function createPermission(input) {
    const name = input.name.trim().toUpperCase();
    const existing = await prisma_1.prisma.permission.findUnique({
        where: { name },
    });
    if (existing) {
        throw new Error("PERMISSION_NAME_EXISTS");
    }
    return prisma_1.prisma.permission.create({
        data: {
            name,
            description: input.description?.trim(),
        },
    });
}
async function getPermissions() {
    return prisma_1.prisma.permission.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getPermissionById(id) {
    const permission = await prisma_1.prisma.permission.findUnique({
        where: { id },
    });
    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }
    return permission;
}
async function updatePermission(id, input) {
    const permission = await prisma_1.prisma.permission.findUnique({
        where: { id },
    });
    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }
    const data = {};
    if (input.name !== undefined) {
        const name = input.name.trim().toUpperCase();
        const existing = await prisma_1.prisma.permission.findUnique({
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
    return prisma_1.prisma.permission.update({
        where: { id },
        data,
    });
}
async function deletePermission(id) {
    const permission = await prisma_1.prisma.permission.findUnique({
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
    await prisma_1.prisma.permission.delete({
        where: { id },
    });
    return permission;
}
async function logPermissionAudit(userId, action, permission) {
    await (0, aud_service_1.createAuditLog)({
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
