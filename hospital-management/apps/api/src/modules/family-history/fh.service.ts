import { prisma } from "../../config/prisma";

interface CreateFamilyHistoryInput {
  patientId: string;
  diabetes?: boolean;
  hypertension?: boolean;
  cancer?: boolean;
  cardiac?: boolean;
  notes?: string;
}

interface UpdateFamilyHistoryInput {
  diabetes?: boolean;
  hypertension?: boolean;
  cancer?: boolean;
  cardiac?: boolean;
  notes?: string | null;
}

export async function createFamilyHistory(
  input: CreateFamilyHistoryInput
) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      deletedAt: null,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patientFamilyHistory.create({
    data: {
      patientId: input.patientId,
      diabetes: input.diabetes ?? false,
      hypertension: input.hypertension ?? false,
      cancer: input.cancer ?? false,
      cardiac: input.cardiac ?? false,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function getFamilyHistories() {
  return prisma.patientFamilyHistory.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFamilyHistoryById(id: string) {
  const familyHistory =
    await prisma.patientFamilyHistory.findUnique({
      where: { id },
    });

  if (!familyHistory) {
    throw new Error("FAMILY_HISTORY_NOT_FOUND");
  }

  return familyHistory;
}

export async function updateFamilyHistory(
  id: string,
  input: UpdateFamilyHistoryInput
) {
  const familyHistory =
    await prisma.patientFamilyHistory.findUnique({
      where: { id },
    });

  if (!familyHistory) {
    throw new Error("FAMILY_HISTORY_NOT_FOUND");
  }

  return prisma.patientFamilyHistory.update({
    where: { id },
    data: {
      diabetes: input.diabetes,
      hypertension: input.hypertension,
      cancer: input.cancer,
      cardiac: input.cardiac,
      notes:
        input.notes !== undefined
          ? input.notes?.trim() || null
          : undefined,
    },
  });
}

export async function deleteFamilyHistory(id: string) {
  const familyHistory =
    await prisma.patientFamilyHistory.findUnique({
      where: { id },
    });

  if (!familyHistory) {
    throw new Error("FAMILY_HISTORY_NOT_FOUND");
  }

  return prisma.patientFamilyHistory.delete({
    where: { id },
  });
}