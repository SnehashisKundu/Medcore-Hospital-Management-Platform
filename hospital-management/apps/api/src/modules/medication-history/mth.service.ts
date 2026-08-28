import { prisma } from "../../config/prisma";

export type CreateMedicationHistoryInput = {
  patientId: string;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  notes?: string;
};

export type UpdateMedicationHistoryInput = {
  medicineName?: string;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  notes?: string | null;
};

export async function createMedicationHistory(
  input: CreateMedicationHistoryInput
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

  return prisma.patientMedicationHistory.create({
    data: {
      patientId: input.patientId,
      medicineName: input.medicineName.trim(),
      dosage: input.dosage?.trim(),
      frequency: input.frequency?.trim(),
      route: input.route?.trim(),
      startDate: input.startDate
        ? new Date(input.startDate)
        : undefined,
      endDate: input.endDate
        ? new Date(input.endDate)
        : undefined,
      isCurrent: input.isCurrent ?? true,
      notes: input.notes?.trim(),
    },
  });
}

export async function getMedicationHistories() {
  return prisma.patientMedicationHistory.findMany({
    orderBy: {
      createdAt: "desc",
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
}

export async function getMedicationHistoryById(id: string) {
  const medicationHistory =
    await prisma.patientMedicationHistory.findUnique({
      where: { id },
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

  if (!medicationHistory) {
    throw new Error("MEDICATION_HISTORY_NOT_FOUND");
  }

  return medicationHistory;
}

export async function updateMedicationHistory(
  id: string,
  input: UpdateMedicationHistoryInput
) {
  const medicationHistory =
    await prisma.patientMedicationHistory.findUnique({
      where: { id },
    });

  if (!medicationHistory) {
    throw new Error("MEDICATION_HISTORY_NOT_FOUND");
  }

  return prisma.patientMedicationHistory.update({
    where: { id },
    data: {
      medicineName:
        input.medicineName !== undefined
          ? input.medicineName.trim()
          : undefined,

      dosage:
        input.dosage !== undefined
          ? input.dosage?.trim() ?? null
          : undefined,

      frequency:
        input.frequency !== undefined
          ? input.frequency?.trim() ?? null
          : undefined,

      route:
        input.route !== undefined
          ? input.route?.trim() ?? null
          : undefined,

      startDate:
        input.startDate !== undefined
          ? input.startDate
            ? new Date(input.startDate)
            : null
          : undefined,

      endDate:
        input.endDate !== undefined
          ? input.endDate
            ? new Date(input.endDate)
            : null
          : undefined,

      isCurrent: input.isCurrent,

      notes:
        input.notes !== undefined
          ? input.notes?.trim() ?? null
          : undefined,
    },
  });
}

export async function deleteMedicationHistory(id: string) {
  const medicationHistory =
    await prisma.patientMedicationHistory.findUnique({
      where: { id },
    });

  if (!medicationHistory) {
    throw new Error("MEDICATION_HISTORY_NOT_FOUND");
  }

  return prisma.patientMedicationHistory.delete({
    where: { id },
  });
}