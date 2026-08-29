"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRole = createRole;
exports.getAllRoles = getAllRoles;
exports.getRoleById = getRoleById;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
const prisma_1 = require("../../config/prisma");
const aud_service_1 = require("../audit-log/aud.service");
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
async function createRole(input) {
    const { name, description, createdById } = input;
    const normalizedName = name.trim().toUpperCase();
    const existingRole = await prisma_1.prisma.role.findUnique({
        where: { name: normalizedName },
    });
    if (existingRole) {
        throw new Error("ROLE_ALREADY_EXISTS");
    }
    const role = await prisma_1.prisma.role.create({
        data: {
            name: normalizedName,
            description: description?.trim() || null,
        },
    });
    await (0, aud_service_1.createAuditLog)({
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
async function getAllRoles() {
    return prisma_1.prisma.role.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getRoleById(id) {
    const role = await prisma_1.prisma.role.findUnique({
        where: { id },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    return role;
}
async function updateRole(id, input) {
    const { name, description, isActive, updatedById } = input;
    const role = await prisma_1.prisma.role.findUnique({
        where: { id },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    // System roles cannot be renamed
    if (SYSTEM_ROLES.has(role.name) &&
        name !== undefined &&
        name.trim().toUpperCase() !== role.name) {
        throw new Error("SYSTEM_ROLE_CANNOT_BE_RENAMED");
    }
    let normalizedName;
    if (name !== undefined) {
        normalizedName = name.trim().toUpperCase();
        const existingRole = await prisma_1.prisma.role.findFirst({
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
    const updatedRole = await prisma_1.prisma.role.update({
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
    await (0, aud_service_1.createAuditLog)({
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
async function deleteRole(id, deletedById) {
    const role = await prisma_1.prisma.role.findUnique({
        where: { id },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    if (SYSTEM_ROLES.has(role.name)) {
        throw new Error("SYSTEM_ROLE_CANNOT_BE_DELETED");
    }
    // Soft delete by deactivating
    const deletedRole = await prisma_1.prisma.role.update({
        where: { id },
        data: {
            isActive: false,
        },
    });
    await (0, aud_service_1.createAuditLog)({
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
