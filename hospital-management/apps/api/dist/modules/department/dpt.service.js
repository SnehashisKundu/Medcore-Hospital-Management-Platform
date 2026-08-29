"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartment = createDepartment;
exports.getDepartments = getDepartments;
exports.getDepartmentById = getDepartmentById;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
const prisma_1 = require("../../config/prisma");
async function createDepartment(hospitalId, input) {
    // Check hospital exists
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: hospitalId,
            deletedAt: null,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const existingDepartment = await prisma_1.prisma.department.findFirst({
        where: {
            hospitalId,
            code: input.code.trim().toUpperCase(),
        },
    });
    if (existingDepartment) {
        throw new Error("DEPARTMENT_CODE_EXISTS");
    }
    return prisma_1.prisma.department.create({
        data: {
            hospitalId,
            name: input.name.trim(),
            code: input.code.trim().toUpperCase(),
            description: input.description?.trim(),
        },
    });
}
async function getDepartments(hospitalId) {
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: hospitalId,
            deletedAt: null,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    return prisma_1.prisma.department.findMany({
        where: {
            hospitalId,
            isActive: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getDepartmentById(hospitalId, departmentId) {
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: departmentId,
            hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    return department;
}
async function updateDepartment(hospitalId, departmentId, input) {
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: departmentId,
            hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    if (input.code) {
        const normalizedCode = input.code.trim().toUpperCase();
        const existingDepartment = await prisma_1.prisma.department.findFirst({
            where: {
                hospitalId,
                code: normalizedCode,
                id: {
                    not: departmentId,
                },
            },
        });
        if (existingDepartment) {
            throw new Error("DEPARTMENT_CODE_EXISTS");
        }
    }
    return prisma_1.prisma.department.update({
        where: {
            id: departmentId,
        },
        data: {
            name: input.name?.trim(),
            code: input.code?.trim().toUpperCase(),
            description: input.description?.trim(),
            isActive: input.isActive,
        },
    });
}
async function deleteDepartment(hospitalId, departmentId) {
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: departmentId,
            hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    return prisma_1.prisma.department.update({
        where: {
            id: departmentId,
        },
        data: {
            isActive: false,
        },
    });
}
