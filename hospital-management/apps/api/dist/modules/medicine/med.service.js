"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicine = createMedicine;
exports.getMedicines = getMedicines;
exports.getMedicineById = getMedicineById;
exports.updateMedicine = updateMedicine;
const prisma_1 = require("../../config/prisma");
async function createMedicine(input) {
    const existing = await prisma_1.prisma.medicine.findFirst({
        where: {
            OR: [
                ...(input.barcode
                    ? [{ barcode: input.barcode.trim() }]
                    : []),
                {
                    name: input.name.trim(),
                },
            ],
        },
    });
    if (existing) {
        throw new Error("MEDICINE_ALREADY_EXISTS");
    }
    return prisma_1.prisma.medicine.create({
        data: {
            name: input.name.trim(),
            genericName: input.genericName?.trim(),
            brandName: input.brandName?.trim(),
            manufacturer: input.manufacturer?.trim(),
            strength: input.strength?.trim(),
            dosageForm: input.dosageForm?.trim(),
            unit: input.unit?.trim(),
            hsnCode: input.hsnCode?.trim(),
            gstPercent: input.gstPercent,
            barcode: input.barcode?.trim(),
        },
    });
}
async function getMedicines() {
    return prisma_1.prisma.medicine.findMany({
        orderBy: {
            name: "asc",
        },
    });
}
async function getMedicineById(id) {
    const medicine = await prisma_1.prisma.medicine.findUnique({
        where: {
            id,
        },
    });
    if (!medicine) {
        throw new Error("MEDICINE_NOT_FOUND");
    }
    return medicine;
}
async function updateMedicine(id, input) {
    const medicine = await prisma_1.prisma.medicine.findUnique({
        where: {
            id,
        },
    });
    if (!medicine) {
        throw new Error("MEDICINE_NOT_FOUND");
    }
    return prisma_1.prisma.medicine.update({
        where: {
            id,
        },
        data: {
            name: input.name?.trim(),
            genericName: input.genericName?.trim(),
            brandName: input.brandName?.trim(),
            manufacturer: input.manufacturer?.trim(),
            strength: input.strength?.trim(),
            dosageForm: input.dosageForm?.trim(),
            unit: input.unit?.trim(),
            hsnCode: input.hsnCode?.trim(),
            gstPercent: input.gstPercent,
            barcode: input.barcode?.trim(),
            isActive: input.isActive,
        },
    });
}
