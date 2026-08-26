import { prisma } from "../../config/prisma";

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

const MEDICINE_ROUTE_ALIASES: Record<
  string,
  MedicineRouteValue
> = {
  ORAL: "ORAL",
  BY_MOUTH: "ORAL",
  PO: "ORAL",

  IV: "IV",
  INTRAVENOUS: "IV",

  IM: "IM",
  INTRAMUSCULAR: "IM",

  TOPICAL: "TOPICAL",

  INHALATION: "INHALATION",
  INHALED: "INHALATION",

  EYE_DROP: "EYE_DROP",
  EYE_DROPS: "EYE_DROP",
  OPHTHALMIC: "EYE_DROP",

  EAR_DROP: "EAR_DROP",
  EAR_DROPS: "EAR_DROP",
  OTIC: "EAR_DROP",

  OTHER: "OTHER",
};

const MEDICINE_TIMING_ALIASES: Record<
  string,
  MedicineTimingValue
> = {
  BEFORE_FOOD: "BEFORE_FOOD",
  BEFORE_MEAL: "BEFORE_FOOD",
  BEFORE_MEALS: "BEFORE_FOOD",

  AFTER_FOOD: "AFTER_FOOD",
  AFTER_MEAL: "AFTER_FOOD",
  AFTER_MEALS: "AFTER_FOOD",

  WITH_FOOD: "WITH_FOOD",
  WITH_MEAL: "WITH_FOOD",
  WITH_MEALS: "WITH_FOOD",

  ANYTIME: "ANYTIME",
  AS_NEEDED: "ANYTIME",
  PRN: "ANYTIME",
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
  route?: string | null
): MedicineRouteValue | undefined {
  if (
    route === undefined ||
    route === null
  ) {
    return undefined;
  }

  if (
    typeof route !== "string" ||
    !route.trim()
  ) {
    throw new Error(
      "INVALID_MEDICINE_ROUTE"
    );
  }

  const normalized =
    normalizeEnumLikeValue(route);

  const mappedRoute =
    MEDICINE_ROUTE_ALIASES[normalized];

  if (!mappedRoute) {
    throw new Error(
      "INVALID_MEDICINE_ROUTE"
    );
  }

  return mappedRoute;
}

function normalizeMedicineTiming(
  timing?: string | null
): MedicineTimingValue | undefined {
  if (
    timing === undefined ||
    timing === null
  ) {
    return undefined;
  }

  if (
    typeof timing !== "string" ||
    !timing.trim()
  ) {
    throw new Error(
      "INVALID_MEDICINE_TIMING"
    );
  }

  const normalized =
    normalizeEnumLikeValue(timing);

  const mappedTiming =
    MEDICINE_TIMING_ALIASES[normalized];

  if (!mappedTiming) {
    throw new Error(
      "INVALID_MEDICINE_TIMING"
    );
  }

  return mappedTiming;
}

interface PrescriptionItemInput {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;

  route?: string | null;
  timing?: string | null;
  quantity?: number;
  remarks?: string | null;
}

interface CreatePrescriptionInput {
  encounterId: string;
  prescribedById: string;
  instructions?: string | null;
  items: PrescriptionItemInput[];
}

interface UpdatePrescriptionInput {
  instructions?: string | null;
  status?: "CANCELLED";
}

function validatePrescriptionItem(
  item: unknown
): asserts item is PrescriptionItemInput {
  if (
    !item ||
    typeof item !== "object" ||
    Array.isArray(item)
  ) {
    throw new Error(
      "INVALID_PRESCRIPTION_ITEM"
    );
  }

  const prescriptionItem =
    item as PrescriptionItemInput;

  if (
    typeof prescriptionItem.medicineId !==
      "string" ||
    !prescriptionItem.medicineId.trim() ||
    typeof prescriptionItem.dosage !==
      "string" ||
    !prescriptionItem.dosage.trim() ||
    typeof prescriptionItem.frequency !==
      "string" ||
    !prescriptionItem.frequency.trim() ||
    typeof prescriptionItem.duration !==
      "string" ||
    !prescriptionItem.duration.trim()
  ) {
    throw new Error(
      "INVALID_PRESCRIPTION_ITEM"
    );
  }

  if (
    prescriptionItem.quantity !== undefined &&
    (
      typeof prescriptionItem.quantity !==
        "number" ||
      !Number.isFinite(
        prescriptionItem.quantity
      ) ||
      !Number.isInteger(
        prescriptionItem.quantity
      ) ||
      prescriptionItem.quantity <= 0
    )
  ) {
    throw new Error(
      "INVALID_QUANTITY"
    );
  }

  if (
    prescriptionItem.remarks !== undefined &&
    prescriptionItem.remarks !== null &&
    typeof prescriptionItem.remarks !==
      "string"
  ) {
    throw new Error(
      "INVALID_PRESCRIPTION_ITEM"
    );
  }

  normalizeMedicineRoute(
    prescriptionItem.route
  );

  normalizeMedicineTiming(
    prescriptionItem.timing
  );
}

function validatePrescriptionId(
  id: unknown
): asserts id is string {
  if (
    typeof id !== "string" ||
    !id.trim()
  ) {
    throw new Error(
      "INVALID_PRESCRIPTION_ID"
    );
  }
}

function validateInstructions(
  instructions: unknown
) {
  if (
    instructions !== undefined &&
    instructions !== null &&
    typeof instructions !== "string"
  ) {
    throw new Error(
      "INVALID_INSTRUCTIONS"
    );
  }
}

export async function createPrescription(
  input: CreatePrescriptionInput
) {
  if (
    typeof input.encounterId !== "string" ||
    !input.encounterId.trim()
  ) {
    throw new Error(
      "ENCOUNTER_NOT_FOUND"
    );
  }

  if (
    typeof input.prescribedById !==
      "string" ||
    !input.prescribedById.trim()
  ) {
    throw new Error(
      "PRESCRIBER_NOT_FOUND"
    );
  }

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0
  ) {
    throw new Error(
      "PRESCRIPTION_ITEMS_REQUIRED"
    );
  }

  validateInstructions(
    input.instructions
  );

  const encounterId =
    input.encounterId.trim();

  const prescribedById =
    input.prescribedById.trim();

  const encounter =
    await prisma.encounter.findUnique({
      where: {
        id: encounterId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!encounter) {
    throw new Error(
      "ENCOUNTER_NOT_FOUND"
    );
  }

  if (
    encounter.status === "CANCELLED"
  ) {
    throw new Error(
      "ENCOUNTER_CANCELLED"
    );
  }

  const prescriber =
    await prisma.user.findUnique({
      where: {
        id: prescribedById,
      },

      select: {
        id: true,
      },
    });

  if (!prescriber) {
    throw new Error(
      "PRESCRIBER_NOT_FOUND"
    );
  }

  const medicineIds = new Set<string>();

  for (const item of input.items) {
    validatePrescriptionItem(item);

    const medicineId =
      item.medicineId.trim();

    if (medicineIds.has(medicineId)) {
      throw new Error(
        "DUPLICATE_MEDICINE"
      );
    }

    medicineIds.add(medicineId);
  }

  const medicines =
    await prisma.medicine.findMany({
      where: {
        id: {
          in: [...medicineIds],
        },
      },

      select: {
        id: true,
        isActive: true,
      },
    });

  if (
    medicines.length !==
    medicineIds.size
  ) {
    throw new Error(
      "MEDICINE_NOT_FOUND"
    );
  }

  const inactiveMedicine =
    medicines.find(
      (medicine) =>
        !medicine.isActive
    );

  if (inactiveMedicine) {
    throw new Error(
      "MEDICINE_INACTIVE"
    );
  }

  return prisma.$transaction(
    async (tx) => {
      return tx.prescription.create({
        data: {
          encounterId,

          prescribedById,

          instructions:
            input.instructions === null
              ? null
              : input.instructions?.trim(),

          status: "ACTIVE",

          items: {
            create: input.items.map(
              (item) => ({
                medicine: {
                  connect: {
                    id: item.medicineId.trim(),
                  },
                },

                dosage:
                  item.dosage.trim(),

                frequency:
                  item.frequency.trim(),

                duration:
                  item.duration.trim(),

                route:
                  normalizeMedicineRoute(
                    item.route
                  ),

                timing:
                  normalizeMedicineTiming(
                    item.timing
                  ),

                quantity:
                  item.quantity,

                remarks:
                  item.remarks === null
                    ? null
                    : item.remarks?.trim(),
              })
            ),
          },
        },

        include: {
          encounter: {
            select: {
              id: true,
              encounterNumber: true,
              patientId: true,
              hospitalId: true,
            },
          },

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
    }
  );
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
  validatePrescriptionId(id);

  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id: id.trim(),
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
    throw new Error(
      "PRESCRIPTION_NOT_FOUND"
    );
  }

  return prescription;
}

export async function getPrescriptionPdfData(
  id: string
) {
  validatePrescriptionId(id);

  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id: id.trim(),
      },

      select: {
        id: true,
        status: true,
        instructions: true,
        createdAt: true,

        encounter: {
          select: {
            id: true,
            encounterNumber: true,

            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },

            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        prescribedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,

              doctor: {
                select: {
                  signatureUrl: true,
                  qualification: true,
                  medicalRegistrationNumber: true,
                },
              },
            },
          },

        items: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            dosage: true,
            frequency: true,
            duration: true,
            route: true,
            timing: true,
            quantity: true,
            remarks: true,

            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                brandName: true,
                strength: true,
                dosageForm: true,
              },
            },
          },
        },
      },
    });

  if (!prescription) {
    throw new Error(
      "PRESCRIPTION_NOT_FOUND"
    );
  }

  return prescription;
}

export async function updatePrescription(
  id: string,
  input: UpdatePrescriptionInput
) {
  validatePrescriptionId(id);

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new Error(
      "EMPTY_UPDATE"
    );
  }

  if (
    input.instructions === undefined &&
    input.status === undefined
  ) {
    throw new Error(
      "EMPTY_UPDATE"
    );
  }

  validateInstructions(
    input.instructions
  );

  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id: id.trim(),
      },

      include: {
        encounter: true,
      },
    });

  if (!prescription) {
    throw new Error(
      "PRESCRIPTION_NOT_FOUND"
    );
  }

  if (
    prescription.encounter.status ===
    "CANCELLED"
  ) {
    throw new Error(
      "ENCOUNTER_CANCELLED"
    );
  }

  if (
    prescription.status === "CANCELLED"
  ) {
    throw new Error(
      "PRESCRIPTION_CANCELLED"
    );
  }

  if (
    prescription.status !== "ACTIVE"
  ) {
    throw new Error(
      "PRESCRIPTION_NOT_ACTIVE"
    );
  }

  if (
    input.status !== undefined &&
    input.status !== "CANCELLED"
  ) {
    throw new Error(
      "INVALID_STATUS_TRANSITION"
    );
  }

  return prisma.prescription.update({
    where: {
      id: id.trim(),
    },

    data: {
      instructions:
        input.instructions === undefined
          ? undefined
          : input.instructions === null
            ? null
            : input.instructions.trim(),

      status: input.status,
    },

    include: {
      encounter: {
        select: {
          id: true,
          encounterNumber: true,
          patientId: true,
          hospitalId: true,
        },
      },

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
}