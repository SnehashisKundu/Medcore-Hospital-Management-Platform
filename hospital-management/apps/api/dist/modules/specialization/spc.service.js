"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpecialization = createSpecialization;
exports.getSpecializations = getSpecializations;
exports.getSpecializationById = getSpecializationById;
const prisma_1 = require("../../config/prisma");
async function createSpecialization(input) {
    const code = input.code.trim().toUpperCase();
    const existing = await prisma_1.prisma.specialization.findUnique({
        where: {
            code,
        },
    });
    if (existing) {
        throw new Error("SPECIALIZATION_CODE_EXISTS");
    }
    return prisma_1.prisma.specialization.create({
        data: {
            name: input.name.trim(),
            code,
            description: input.description?.trim(),
        },
    });
}
async function getSpecializations() {
    return prisma_1.prisma.specialization.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getSpecializationById(id) {
    const specialization = await prisma_1.prisma.specialization.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!specialization) {
        throw new Error("SPECIALIZATION_NOT_FOUND");
    }
    return specialization;
}
