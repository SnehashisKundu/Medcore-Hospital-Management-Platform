import { prisma } from "../../config/prisma";

interface CreateVaccinationInput {
  patientId: string;
  vaccineName: string;
  batchNumber?: string;
  administeredDate: string;
  nextDueDate?: string;
  notes?: string;
}

interface UpdateVaccinationInput {
  vaccineName?: string;
  batchNumber?: string | null;
  administeredDate?: string;
  nextDueDate?: string | null;
  notes?: string | null;
}

function parseVaccinationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("INVALID_VACCINATION_DATE");
  }

  return date;
}

export async function createVaccination(
  input: CreateVaccinationInput
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

  const administeredDate = parseVaccinationDate(
    input.administeredDate
  );

  const nextDueDate = input.nextDueDate
    ? parseVaccinationDate(input.nextDueDate)
    : null;

  return prisma.patientVaccination.create({
    data: {
      patientId: input.patientId,
      vaccineName: input.vaccineName.trim(),
      batchNumber: input.batchNumber?.trim() || null,
      administeredDate,
      nextDueDate,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function getVaccinations() {
  return prisma.patientVaccination.findMany({
    orderBy: {
      administeredDate: "desc",
    },
  });
}

export async function getVaccinationById(id: string) {
  const vaccination =
    await prisma.patientVaccination.findUnique({
      where: {
        id,
      },
    });

  if (!vaccination) {
    throw new Error("VACCINATION_NOT_FOUND");
  }

  return vaccination;
}

export async function updateVaccination(
  id: string,
  input: UpdateVaccinationInput
) {
  const vaccination =
    await prisma.patientVaccination.findUnique({
      where: {
        id,
      },
    });

  if (!vaccination) {
    throw new Error("VACCINATION_NOT_FOUND");
  }

  const administeredDate =
    input.administeredDate !== undefined
      ? parseVaccinationDate(input.administeredDate)
      : undefined;

  const nextDueDate =
    input.nextDueDate !== undefined
      ? input.nextDueDate
        ? parseVaccinationDate(input.nextDueDate)
        : null
      : undefined;

  return prisma.patientVaccination.update({
    where: {
      id,
    },
    data: {
      vaccineName:
        input.vaccineName !== undefined
          ? input.vaccineName.trim()
          : undefined,

      batchNumber:
        input.batchNumber !== undefined
          ? input.batchNumber?.trim() || null
          : undefined,

      administeredDate,

      nextDueDate,

      notes:
        input.notes !== undefined
          ? input.notes?.trim() || null
          : undefined,
    },
  });
}

export async function deleteVaccination(id: string) {
  const vaccination =
    await prisma.patientVaccination.findUnique({
      where: {
        id,
      },
    });

  if (!vaccination) {
    throw new Error("VACCINATION_NOT_FOUND");
  }

  return prisma.patientVaccination.delete({
    where: {
      id,
    },
  });
}