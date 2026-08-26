import { prisma } from "../../config/prisma";
import {
  TreatmentPlanStatus,
} from "../../generated/prisma/browser";

interface CreateTreatmentPlanInput {
  encounterId: string;
  title: string;
  description?: string;
}

interface UpdateTreatmentPlanInput {
  title?: string;
  description?: string | null;
  status?: TreatmentPlanStatus;
}

export async function createTreatmentPlan(
  input: CreateTreatmentPlanInput
) {
  const encounter =
    await prisma.encounter.findUnique({
      where: {
        id: input.encounterId,
      },
    });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  // Cannot add new clinical data
  // to a cancelled encounter
  if (encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error(
      "TREATMENT_PLAN_TITLE_REQUIRED"
    );
  }

  const description =
    input.description?.trim() || null;

  return prisma.treatmentPlan.create({
    data: {
      encounterId: input.encounterId,
      title,
      description,
      status: TreatmentPlanStatus.ACTIVE,
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
    },
  });
}

export async function getTreatmentPlans(
  encounterId?: string,
  status?: TreatmentPlanStatus
) {
  return prisma.treatmentPlan.findMany({
    where: {
      ...(encounterId
        ? { encounterId }
        : {}),
      ...(status
        ? { status }
        : {}),
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTreatmentPlanById(
  id: string
) {
  const treatmentPlan =
    await prisma.treatmentPlan.findUnique({
      where: {
        id,
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
      },
    });

  if (!treatmentPlan) {
    throw new Error(
      "TREATMENT_PLAN_NOT_FOUND"
    );
  }

  return treatmentPlan;
}

export async function updateTreatmentPlan(
  id: string,
  input: UpdateTreatmentPlanInput
) {
  const treatmentPlan =
    await prisma.treatmentPlan.findUnique({
      where: {
        id,
      },
      include: {
        encounter: true,
      },
    });

  if (!treatmentPlan) {
    throw new Error(
      "TREATMENT_PLAN_NOT_FOUND"
    );
  }

  // Do not modify treatment data
  // after encounter cancellation
  if (
    treatmentPlan.encounter.status ===
    "CANCELLED"
  ) {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) {
      throw new Error(
        "TREATMENT_PLAN_TITLE_REQUIRED"
      );
    }
  }

  const currentStatus =
    treatmentPlan.status;

  const newStatus =
    input.status ?? currentStatus;

  // Terminal treatment plans cannot
  // move to another status
  if (
    (
      currentStatus ===
        TreatmentPlanStatus.COMPLETED ||
      currentStatus ===
        TreatmentPlanStatus.CANCELLED
    ) &&
    newStatus !== currentStatus
  ) {
    throw new Error(
      "INVALID_STATUS_TRANSITION"
    );
  }

  // ACTIVE can only move forward
  if (
    currentStatus ===
      TreatmentPlanStatus.ACTIVE &&
    input.status !== undefined &&
    input.status !== currentStatus &&
    input.status !==
      TreatmentPlanStatus.COMPLETED &&
    input.status !==
      TreatmentPlanStatus.CANCELLED
  ) {
    throw new Error(
      "INVALID_STATUS_TRANSITION"
    );
  }

  return prisma.treatmentPlan.update({
    where: {
      id,
    },
    data: {
      ...(input.title !== undefined
        ? {
            title: input.title.trim(),
          }
        : {}),

      ...(input.description !== undefined
        ? {
            description:
              input.description === null
                ? null
                : input.description.trim() || null,
          }
        : {}),

      ...(input.status !== undefined
        ? {
            status: input.status,
          }
        : {}),
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
    },
  });
}

export async function deleteTreatmentPlan(
  id: string
) {
  const treatmentPlan =
    await prisma.treatmentPlan.findUnique({
      where: {
        id,
      },
    });

  if (!treatmentPlan) {
    throw new Error(
      "TREATMENT_PLAN_NOT_FOUND"
    );
  }

  return prisma.treatmentPlan.delete({
    where: {
      id,
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
    },
  });
}