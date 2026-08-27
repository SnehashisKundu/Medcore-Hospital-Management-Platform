import { prisma } from "../../config/prisma";

interface CreateAllergyInput {
  patientId: string;
  allergen: string;
  reaction?: string;
  severity?: string;
  notes?: string;
}

interface UpdateAllergyInput {
  allergen?: string;
  reaction?: string;
  severity?: string;
  notes?: string;
  isActive?: boolean;
}

export async function createAllergy(input: CreateAllergyInput) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      isActive: true,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patientAllergy.create({
    data: {
      patientId: input.patientId,
      allergen: input.allergen.trim(),
      reaction: input.reaction?.trim(),
      severity: input.severity?.trim(),
      notes: input.notes?.trim(),
    },
  });
}

export async function getAllergies() {
  return prisma.patientAllergy.findMany({
    where: {
      isActive: true,
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllergyById(id: string) {
  const allergy = await prisma.patientAllergy.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!allergy) {
    throw new Error("ALLERGY_NOT_FOUND");
  }

  return allergy;
}

export async function updateAllergy(
  id: string,
  input: UpdateAllergyInput
) {
  const allergy = await prisma.patientAllergy.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!allergy) {
    throw new Error("ALLERGY_NOT_FOUND");
  }

  return prisma.patientAllergy.update({
    where: { id },
    data: {
      allergen: input.allergen?.trim(),
      reaction: input.reaction?.trim(),
      severity: input.severity?.trim(),
      notes: input.notes?.trim(),
      isActive: input.isActive,
    },
  });
}

export async function deleteAllergy(id: string) {
  const allergy = await prisma.patientAllergy.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!allergy) {
    throw new Error("ALLERGY_NOT_FOUND");
  }

  return prisma.patientAllergy.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}