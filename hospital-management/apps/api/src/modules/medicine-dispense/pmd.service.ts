import { prisma } from "../../config/prisma";

interface DispenseItemInput {
  prescriptionItemId: string;
  stockId: string;
  quantity: number;
}

interface CreateDispenseInput {
  prescriptionId: string;
  dispensedById: string;
  items: DispenseItemInput[];
}

export async function createMedicineDispense(
  input: CreateDispenseInput
) {
  if (!input.items || input.items.length === 0) {
    throw new Error("DISPENSE_ITEMS_REQUIRED");
  }

  const prescription = await prisma.prescription.findUnique({
    where: {
      id: input.prescriptionId,
    },
    include: {
      items: true,
    },
  });

  if (!prescription) {
    throw new Error("PRESCRIPTION_NOT_FOUND");
  }

  const pharmacist = await prisma.user.findUnique({
    where: {
      id: input.dispensedById,
    },
  });

  if (!pharmacist) {
    throw new Error("DISPENSER_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error("INVALID_QUANTITY");
      }

      const prescriptionItem =
        prescription.items.find(
          (pi) => pi.id === item.prescriptionItemId
        );

      if (!prescriptionItem) {
        throw new Error("PRESCRIPTION_ITEM_NOT_FOUND");
      }

      const stock = await tx.medicineStock.findUnique({
        where: {
          id: item.stockId,
        },
      });

      if (!stock) {
        throw new Error("MEDICINE_STOCK_NOT_FOUND");
      }

      if (stock.medicineId !== prescriptionItem.medicineId) {
        throw new Error("STOCK_MEDICINE_MISMATCH");
      }

      if (stock.quantityAvailable < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      await tx.medicineStock.update({
        where: {
          id: stock.id,
        },
        data: {
          quantityAvailable: {
            decrement: item.quantity,
          },
        },
      });
    }

    const dispense = await tx.medicineDispense.create({
      data: {
        prescriptionId: input.prescriptionId,
        dispensedById: input.dispensedById,
        status: "DISPENSED",
        dispensedAt: new Date(),

        items: {
          create: await Promise.all(
            input.items.map(async (item) => {
              const stock =
                await tx.medicineStock.findUnique({
                  where: {
                    id: item.stockId,
                  },
                });

              if (!stock) {
                throw new Error("MEDICINE_STOCK_NOT_FOUND");
              }

              return {
                prescriptionItemId:
                  item.prescriptionItemId,
                stockId: item.stockId,
                quantity: item.quantity,
                unitPrice: stock.sellingPrice,
              };
            })
          ),
        },
      },

      include: {
        items: true,
        prescription: {
          include: {
            encounter: {
              select: {
                hospitalId: true,
              },
            },
          },
        },
        dispensedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return dispense;
  });
}

export async function getMedicineDispenses() {
  return prisma.medicineDispense.findMany({
    include: {
      items: true,
      prescription: {
        include: {
          encounter: {
            select: {
              hospitalId: true,
            },
          },
        },
      },
      dispensedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMedicineDispenseById(
  id: string
) {
  const dispense =
    await prisma.medicineDispense.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        prescription: true,
        dispensedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  if (!dispense) {
    throw new Error("DISPENSE_NOT_FOUND");
  }

  return dispense;
}