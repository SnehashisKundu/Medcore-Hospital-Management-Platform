"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicineStock = createMedicineStock;
exports.getMedicineStocks = getMedicineStocks;
exports.getMedicineStockById = getMedicineStockById;
exports.updateMedicineStock = updateMedicineStock;
const prisma_1 = require("../../config/prisma");
async function createMedicineStock(input) {
    if (input.quantityAvailable < 0) {
        throw new Error("INVALID_QUANTITY");
    }
    if (input.purchasePrice < 0 || input.sellingPrice < 0) {
        throw new Error("INVALID_PRICE");
    }
    const hospital = await prisma_1.prisma.hospital.findUnique({
        where: {
            id: input.hospitalId,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    const medicine = await prisma_1.prisma.medicine.findUnique({
        where: {
            id: input.medicineId,
        },
    });
    if (!medicine) {
        throw new Error("MEDICINE_NOT_FOUND");
    }
    if (input.supplierId) {
        const supplier = await prisma_1.prisma.supplier.findUnique({
            where: {
                id: input.supplierId,
            },
        });
        if (!supplier) {
            throw new Error("SUPPLIER_NOT_FOUND");
        }
    }
    const existing = await prisma_1.prisma.medicineStock.findUnique({
        where: {
            hospitalId_medicineId_batchNumber: {
                hospitalId: input.hospitalId,
                medicineId: input.medicineId,
                batchNumber: input.batchNumber.trim(),
            },
        },
    });
    if (existing) {
        throw new Error("STOCK_ALREADY_EXISTS");
    }
    return prisma_1.prisma.medicineStock.create({
        data: {
            hospitalId: input.hospitalId,
            medicineId: input.medicineId,
            supplierId: input.supplierId,
            batchNumber: input.batchNumber.trim(),
            expiryDate: new Date(input.expiryDate),
            purchasePrice: input.purchasePrice,
            sellingPrice: input.sellingPrice,
            quantityAvailable: input.quantityAvailable,
            minimumStock: input.minimumStock ?? 0,
        },
        include: {
            medicine: true,
            hospital: true,
            supplier: true,
        },
    });
}
async function getMedicineStocks() {
    return prisma_1.prisma.medicineStock.findMany({
        include: {
            medicine: true,
            hospital: true,
            supplier: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getMedicineStockById(id) {
    const stock = await prisma_1.prisma.medicineStock.findUnique({
        where: {
            id,
        },
        include: {
            medicine: true,
            hospital: true,
            supplier: true,
            movements: true,
        },
    });
    if (!stock) {
        throw new Error("STOCK_NOT_FOUND");
    }
    return stock;
}
async function updateMedicineStock(id, input) {
    const stock = await prisma_1.prisma.medicineStock.findUnique({
        where: {
            id,
        },
    });
    if (!stock) {
        throw new Error("STOCK_NOT_FOUND");
    }
    if (input.quantityAvailable !== undefined &&
        input.quantityAvailable < 0) {
        throw new Error("INVALID_QUANTITY");
    }
    if (input.purchasePrice !== undefined &&
        input.purchasePrice < 0) {
        throw new Error("INVALID_PRICE");
    }
    if (input.sellingPrice !== undefined &&
        input.sellingPrice < 0) {
        throw new Error("INVALID_PRICE");
    }
    if (input.supplierId) {
        const supplier = await prisma_1.prisma.supplier.findUnique({
            where: {
                id: input.supplierId,
            },
        });
        if (!supplier) {
            throw new Error("SUPPLIER_NOT_FOUND");
        }
    }
    return prisma_1.prisma.medicineStock.update({
        where: {
            id,
        },
        data: {
            supplierId: input.supplierId,
            batchNumber: input.batchNumber?.trim(),
            expiryDate: input.expiryDate
                ? new Date(input.expiryDate)
                : undefined,
            purchasePrice: input.purchasePrice,
            sellingPrice: input.sellingPrice,
            quantityAvailable: input.quantityAvailable,
            minimumStock: input.minimumStock,
        },
        include: {
            medicine: true,
            hospital: true,
            supplier: true,
        },
    });
}
