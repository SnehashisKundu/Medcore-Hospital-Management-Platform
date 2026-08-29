"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosticTest = createDiagnosticTest;
exports.getDiagnosticTests = getDiagnosticTests;
exports.getDiagnosticTestById = getDiagnosticTestById;
exports.updateDiagnosticTest = updateDiagnosticTest;
const prisma_1 = require("../../config/prisma");
async function createDiagnosticTest(input) {
    const existing = await prisma_1.prisma.diagnosticTest.findUnique({
        where: {
            code: input.code.trim(),
        },
    });
    if (existing) {
        throw new Error("DIAGNOSTIC_TEST_ALREADY_EXISTS");
    }
    return prisma_1.prisma.diagnosticTest.create({
        data: {
            name: input.name.trim(),
            code: input.code.trim(),
            category: input.category,
            description: input.description?.trim(),
            isActive: true,
        },
    });
}
async function getDiagnosticTests() {
    return prisma_1.prisma.diagnosticTest.findMany({
        orderBy: {
            name: "asc",
        },
    });
}
async function getDiagnosticTestById(id) {
    const test = await prisma_1.prisma.diagnosticTest.findUnique({
        where: {
            id,
        },
    });
    if (!test) {
        throw new Error("DIAGNOSTIC_TEST_NOT_FOUND");
    }
    return test;
}
async function updateDiagnosticTest(id, input) {
    const test = await prisma_1.prisma.diagnosticTest.findUnique({
        where: {
            id,
        },
    });
    if (!test) {
        throw new Error("DIAGNOSTIC_TEST_NOT_FOUND");
    }
    if (input.code && input.code.trim() !== test.code) {
        const existing = await prisma_1.prisma.diagnosticTest.findUnique({
            where: {
                code: input.code.trim(),
            },
        });
        if (existing) {
            throw new Error("DIAGNOSTIC_TEST_ALREADY_EXISTS");
        }
    }
    return prisma_1.prisma.diagnosticTest.update({
        where: {
            id,
        },
        data: {
            name: input.name?.trim(),
            code: input.code?.trim(),
            category: input.category ?? test.category,
            description: input.description?.trim(),
            isActive: input.isActive,
        },
    });
}
