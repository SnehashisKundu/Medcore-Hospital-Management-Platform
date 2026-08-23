import { prisma } from "../../config/prisma";

type PrescriptionStatusValue =
  | "ACTIVE"
  | "PARTIALLY_DISPENSED"
  | "DISPENSED"
  | "CANCELLED";

type MedicineRouteValue =
  | "ORAL"
  | "IV"
  | "IM"
  | "TOPICAL"
  | "INHALATION"
  | "EYE_DROP"
  | "EAR_DROP"
  | "OTHER";

type MedicineTimingValue =
  | "BEFORE_FOOD"
  | "AFTER_FOOD"
  | "WITH_FOOD"
  | "ANYTIME";

const MEDICINE_TIMING_ALIASES: Record<
  string,
  MedicineTimingValue
> = {
  BEFORE_FOOD: "BEFORE_FOOD",
  BEFORE_MEAL: "BEFORE_FOOD",
  BEFORE_MEALS: "BEFORE_FOOD",
  BEFORE_EATING: "BEFORE_FOOD",

  AFTER_FOOD: "AFTER_FOOD",
  AFTER_MEAL: "AFTER_FOOD",
  AFTER_MEALS: "AFTER_FOOD",
  AFTER_EATING: "AFTER_FOOD",

  WITH_FOOD: "WITH_FOOD",
  WITH_MEAL: "WITH_FOOD",
  WITH_MEALS: "WITH_FOOD",

  ANYTIME: "ANYTIME",
  ANY_TIME: "ANYTIME",
};

function normalizeEnumLikeValue(
  value: string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeMedicineRoute(
  route?: string
): MedicineRouteValue | undefined {
  if (!route) {
    return undefined;
  }

  const normalized =
    normalizeEnumLikeValue(route);

  const allowedRoutes = new Set<MedicineRouteValue>([
    "ORAL",
    "IV",
    "IM",
    "TOPICAL",
    "INHALATION",
    "EYE_DROP",
    "EAR_DROP",
    "OTHER",
  ]);

  if (allowedRoutes.has(normalized as MedicineRouteValue)) {
    return normalized as MedicineRouteValue;
  }

  throw new Error("INVALID_MEDICINE_ROUTE");
}

function normalizeMedicineTiming(
  timing?: string
): MedicineTimingValue | undefined {
  if (!timing) {
    return undefined;
  }

  const normalized =
    normalizeEnumLikeValue(timing);

  const mappedTiming =
    MEDICINE_TIMING_ALIASES[normalized];

  if (!mappedTiming) {
    throw new Error("INVALID_MEDICINE_TIMING");
  }

  return mappedTiming;
}

interface PrescriptionItemInput {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;

  route?: string;
  timing?: string;
  quantity?: number;
  remarks?: string;
}

interface CreatePrescriptionInput {
  encounterId: string;
  prescribedById: string;
  instructions?: string;
  items: PrescriptionItemInput[];
}

interface UpdatePrescriptionInput {
  instructions?: string;
  status?: PrescriptionStatusValue;
}

export async function createPrescription(
  input: CreatePrescriptionInput
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  if (encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  const doctor = await prisma.user.findUnique({
    where: {
      id: input.prescribedById,
    },
  });

  if (!doctor) {
    throw new Error("PRESCRIBER_NOT_FOUND");
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("PRESCRIPTION_ITEMS_REQUIRED");
  }

  for (const item of input.items) {
    normalizeMedicineRoute(item.route);
    normalizeMedicineTiming(item.timing);

    const medicine = await prisma.medicine.findUnique({
      where: {
        id: item.medicineId,
      },
    });

    if (!medicine) {
      throw new Error("MEDICINE_NOT_FOUND");
    }
  }

  return prisma.$transaction(async (tx) => {
    const prescription =
      await tx.prescription.create({
        data: {
          encounterId: input.encounterId,
          prescribedById: input.prescribedById,
          instructions: input.instructions?.trim(),
          status: "ACTIVE",

          items: {
            create: input.items.map((item) => ({
              medicine: {
                connect: { id: item.medicineId },
              },
              dosage: item.dosage.trim(),
              frequency: item.frequency.trim(),
              duration: item.duration.trim(),
              route: normalizeMedicineRoute(
                item.route
              ),
              timing: normalizeMedicineTiming(
                item.timing
              ),
              quantity: item.quantity,
              remarks: item.remarks?.trim(),
            })),
          },
        },

        include: {
          items: {
            include: {
              medicine: true,
            },
          },
        },
      });

    return prescription;
  });
}

export async function getPrescriptions() {
  return prisma.prescription.findMany({
    include: {
      encounter: true,

      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      items: {
        include: {
          medicine: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPrescriptionById(
  id: string
) {
  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,

        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

  if (!prescription) {
    throw new Error("PRESCRIPTION_NOT_FOUND");
  }

  return prescription;
}

export async function updatePrescription(
  id: string,
  input: UpdatePrescriptionInput
) {
  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,
      },
    });

  if (!prescription) {
    throw new Error("PRESCRIPTION_NOT_FOUND");
  }

  if (prescription.encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  return prisma.prescription.update({
    where: {
      id,
    },

    data: {
      instructions:
        input.instructions?.trim(),

      status: input.status,
    },

    include: {
      items: {
        include: {
          medicine: true,
        },
      },
    },
  });
}