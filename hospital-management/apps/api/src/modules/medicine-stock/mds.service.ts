import { prisma } from "../../config/prisma";

interface CreateMedicineStockInput {
  hospitalId: string;
  medicineId: string;
  supplierId?: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityAvailable: number;
  minimumStock?: number;
}

interface UpdateMedicineStockInput {
  supplierId?: string;
  batchNumber?: string;
  expiryDate?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  quantityAvailable?: number;
  minimumStock?: number;
}

export async function createMedicineStock(
  input: CreateMedicineStockInput
) {
  if (input.quantityAvailable < 0) {
    throw new Error("INVALID_QUANTITY");
  }

  if (input.purchasePrice < 0 || input.sellingPrice < 0) {
    throw new Error("INVALID_PRICE");
  }

  const hospital = await prisma.hospital.findUnique({
    where: {
      id: input.hospitalId,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const medicine = await prisma.medicine.findUnique({
    where: {
      id: input.medicineId,
    },
  });

  if (!medicine) {
    throw new Error("MEDICINE_NOT_FOUND");
  }

  if (input.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: input.supplierId,
      },
    });

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
  }

  const existing = await prisma.medicineStock.findUnique({
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

  return prisma.medicineStock.create({
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

export async function getMedicineStocks() {
  return prisma.medicineStock.findMany({
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

export async function getMedicineStockById(id: string) {
  const stock = await prisma.medicineStock.findUnique({
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

export async function updateMedicineStock(
  id: string,
  input: UpdateMedicineStockInput
) {
  const stock = await prisma.medicineStock.findUnique({
    where: {
      id,
    },
  });

  if (!stock) {
    throw new Error("STOCK_NOT_FOUND");
  }

  if (
    input.quantityAvailable !== undefined &&
    input.quantityAvailable < 0
  ) {
    throw new Error("INVALID_QUANTITY");
  }

  if (
    input.purchasePrice !== undefined &&
    input.purchasePrice < 0
  ) {
    throw new Error("INVALID_PRICE");
  }

  if (
    input.sellingPrice !== undefined &&
    input.sellingPrice < 0
  ) {
    throw new Error("INVALID_PRICE");
  }

  if (input.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: input.supplierId,
      },
    });

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
  }

  return prisma.medicineStock.update({
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