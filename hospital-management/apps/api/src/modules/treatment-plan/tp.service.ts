import { prisma } from "../../config/prisma";
import { TreatmentPlanStatus } from "../../generated/prisma/browser";

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
  const encounter = await prisma.encounter.findFirst({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  return prisma.treatmentPlan.create({
    data: {
      encounterId: input.encounterId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: "ACTIVE",
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
  status?: string
) {
  return prisma.treatmentPlan.findMany({
    where: {
      ...(encounterId ? { encounterId } : {}),
      ...(status
        ? { status: status as TreatmentPlanStatus }
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

export async function getTreatmentPlanById(id: string) {
  const treatmentPlan = await prisma.treatmentPlan.findUnique({
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
    throw new Error("TREATMENT_PLAN_NOT_FOUND");
  }

  return treatmentPlan;
}

export async function updateTreatmentPlan(
  id: string,
  input: UpdateTreatmentPlanInput
) {
  const treatmentPlan = await prisma.treatmentPlan.findUnique({
    where: {
      id,
    },
  });

  if (!treatmentPlan) {
    throw new Error("TREATMENT_PLAN_NOT_FOUND");
  }

  return prisma.treatmentPlan.update({
    where: {
      id,
    },
    data: {
      ...(input.title !== undefined
        ? { title: input.title.trim() }
        : {}),
      ...(input.description !== undefined
        ? {
            description:
              input.description?.trim() || null,
          }
        : {}),
      ...(input.status !== undefined
        ? { status: input.status }
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

export async function deleteTreatmentPlan(id: string) {
  const treatmentPlan = await prisma.treatmentPlan.findUnique({
    where: {
      id,
    },
  });

  if (!treatmentPlan) {
    throw new Error("TREATMENT_PLAN_NOT_FOUND");
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