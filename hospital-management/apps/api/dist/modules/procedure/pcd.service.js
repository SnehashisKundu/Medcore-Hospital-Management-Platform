"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcedure = createProcedure;
exports.getProcedures = getProcedures;
exports.getProcedureById = getProcedureById;
exports.updateProcedure = updateProcedure;
exports.deleteProcedure = deleteProcedure;
const prisma_1 = require("../../config/prisma");
async function createProcedure(name, code, category, description) {
    const existingProcedure = await prisma_1.prisma.procedure.findUnique({
        where: {
            code,
        },
    });
    if (existingProcedure) {
        throw new Error("Procedure code already exists");
    }
    return prisma_1.prisma.procedure.create({
        data: {
            name,
            code,
            category,
            description,
        },
    });
}
async function getProcedures() {
    return prisma_1.prisma.procedure.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getProcedureById(id) {
    const procedure = await prisma_1.prisma.procedure.findUnique({
        where: {
            id,
        },
    });
    if (!procedure || !procedure.isActive) {
        throw new Error("Procedure not found");
    }
    return procedure;
}
async function updateProcedure(id, name, code, category, description) {
    const existingProcedure = await prisma_1.prisma.procedure.findUnique({
        where: {
            id,
        },
    });
    if (!existingProcedure || !existingProcedure.isActive) {
        throw new Error("Procedure not found");
    }
    if (code && code !== existingProcedure.code) {
        const duplicateCode = await prisma_1.prisma.procedure.findUnique({
            where: {
                code,
            },
        });
        if (duplicateCode) {
            throw new Error("Procedure code already exists");
        }
    }
    return prisma_1.prisma.procedure.update({
        where: {
            id,
        },
        data: {
            ...(name !== undefined && { name }),
            ...(code !== undefined && { code }),
            ...(category !== undefined && { category }),
            ...(description !== undefined && { description }),
        },
    });
}
async function deleteProcedure(id) {
    const existingProcedure = await prisma_1.prisma.procedure.findUnique({
        where: {
            id,
        },
    });
    if (!existingProcedure || !existingProcedure.isActive) {
        throw new Error("Procedure not found");
    }
    return prisma_1.prisma.procedure.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
}
