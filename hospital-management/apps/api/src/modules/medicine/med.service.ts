import { prisma } from "../../config/prisma";

interface CreateMedicineInput {
  name: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  strength?: string;
  dosageForm?: string;
  unit?: string;
  hsnCode?: string;
  gstPercent?: number;
  barcode?: string;
}

interface UpdateMedicineInput {
  name?: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  strength?: string;
  dosageForm?: string;
  unit?: string;
  hsnCode?: string;
  gstPercent?: number;
  barcode?: string;
  isActive?: boolean;
}

export async function createMedicine(
  input: CreateMedicineInput
) {
  const existing = await prisma.medicine.findFirst({
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

  return prisma.medicine.create({
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

export async function getMedicines() {
  return prisma.medicine.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getMedicineById(id: string) {
  const medicine = await prisma.medicine.findUnique({
    where: {
      id,
    },
  });

  if (!medicine) {
    throw new Error("MEDICINE_NOT_FOUND");
  }

  return medicine;
}

export async function updateMedicine(
  id: string,
  input: UpdateMedicineInput
) {
  const medicine = await prisma.medicine.findUnique({
    where: {
      id,
    },
  });

  if (!medicine) {
    throw new Error("MEDICINE_NOT_FOUND");
  }

  return prisma.medicine.update({
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