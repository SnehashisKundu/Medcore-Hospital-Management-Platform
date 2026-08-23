import { prisma } from "../../config/prisma";

interface CreateDiagnosisInput {
  encounterId: string;
  diagnosedById?: string;

  type: "PROVISIONAL" | "DIFFERENTIAL" | "FINAL";

  icd10Code?: string;
  diagnosisName: string;
  description?: string;

  isPrimary?: boolean;
  diagnosedAt?: string;
}

interface UpdateDiagnosisInput {
  type?: "PROVISIONAL" | "DIFFERENTIAL" | "FINAL";

  icd10Code?: string;
  diagnosisName?: string;
  description?: string;

  isPrimary?: boolean;
  diagnosedAt?: string;
}

export async function createDiagnosis(
  input: CreateDiagnosisInput
) {
  // 1. Check encounter
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  // 2. Don't add diagnosis to cancelled encounter
  if (encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  // 3. Check doctor/user if provided
  if (input.diagnosedById) {
    const user = await prisma.user.findUnique({
      where: {
        id: input.diagnosedById,
      },
    });

    if (!user) {
      throw new Error("DIAGNOSED_BY_NOT_FOUND");
    }
  }

  // 4. If primary diagnosis, remove primary
  // from other diagnoses of this encounter
  if (input.isPrimary === true) {
    await prisma.encounterDiagnosis.updateMany({
      where: {
        encounterId: input.encounterId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  // 5. Create diagnosis
  return prisma.encounterDiagnosis.create({
    data: {
      encounterId: input.encounterId,

      diagnosedById: input.diagnosedById,

      type: input.type,

      icd10Code: input.icd10Code?.trim(),

      diagnosisName:
        input.diagnosisName.trim(),

      description:
        input.description?.trim(),

      isPrimary:
        input.isPrimary ?? false,

      diagnosedAt: input.diagnosedAt
        ? new Date(input.diagnosedAt)
        : new Date(),
    },
  });
}

export async function getDiagnoses() {
  return prisma.encounterDiagnosis.findMany({
    include: {
      encounter: true,

      diagnosedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },

    orderBy: {
      diagnosedAt: "desc",
    },
  });
}

export async function getDiagnosisById(
  id: string
) {
  const diagnosis =
    await prisma.encounterDiagnosis.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,

        diagnosedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  if (!diagnosis) {
    throw new Error("DIAGNOSIS_NOT_FOUND");
  }

  return diagnosis;
}

export async function updateDiagnosis(
  id: string,
  input: UpdateDiagnosisInput
) {
  const diagnosis =
    await prisma.encounterDiagnosis.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,
      },
    });

  if (!diagnosis) {
    throw new Error("DIAGNOSIS_NOT_FOUND");
  }

  if (diagnosis.encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  // If changing to primary
  if (input.isPrimary === true) {
    await prisma.encounterDiagnosis.updateMany({
      where: {
        encounterId: diagnosis.encounterId,
        isPrimary: true,
        NOT: {
          id,
        },
      },
      data: {
        isPrimary: false,
      },
    });
  }

  return prisma.encounterDiagnosis.update({
    where: {
      id,
    },

    data: {
      type: input.type,

      icd10Code:
        input.icd10Code?.trim(),

      diagnosisName:
        input.diagnosisName?.trim(),

      description:
        input.description?.trim(),

      isPrimary:
        input.isPrimary,

      diagnosedAt: input.diagnosedAt
        ? new Date(input.diagnosedAt)
        : undefined,
    },
  });
}