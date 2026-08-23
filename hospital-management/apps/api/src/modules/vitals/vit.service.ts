import { prisma } from "../../config/prisma";

interface CreateVitalInput {
  encounterId: string;
  recordedById?: string;

  temperatureCelsius?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  painScore?: number;
  bloodGlucose?: number;

  remarks?: string;
  recordedAt?: string;
}

interface UpdateVitalInput {
  temperatureCelsius?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  painScore?: number;
  bloodGlucose?: number;

  remarks?: string;
  recordedAt?: string;
}

export async function createVital(input: CreateVitalInput) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  if (input.recordedById) {
    const user = await prisma.user.findUnique({
      where: {
        id: input.recordedById,
      },
    });

    if (!user) {
      throw new Error("RECORDER_NOT_FOUND");
    }
  }

  return prisma.encounterVital.create({
    data: {
      encounterId: input.encounterId,
      recordedById: input.recordedById,

      temperatureCelsius: input.temperatureCelsius,
      pulseRate: input.pulseRate,
      respiratoryRate: input.respiratoryRate,
      oxygenSaturation: input.oxygenSaturation,

      bloodPressureSystolic:
        input.bloodPressureSystolic,

      bloodPressureDiastolic:
        input.bloodPressureDiastolic,

      heightCm: input.heightCm,
      weightKg: input.weightKg,
      bmi: input.bmi,

      painScore: input.painScore,
      bloodGlucose: input.bloodGlucose,

      remarks: input.remarks?.trim(),

      recordedAt: input.recordedAt
        ? new Date(input.recordedAt)
        : new Date(),
    },
  });
}

export async function getVitals() {
  return prisma.encounterVital.findMany({
    include: {
      encounter: true,
    },
    orderBy: {
      recordedAt: "desc",
    },
  });
}

export async function getVitalById(id: string) {
  const vital = await prisma.encounterVital.findUnique({
    where: {
      id,
    },
    include: {
      encounter: true,
    },
  });

  if (!vital) {
    throw new Error("VITAL_NOT_FOUND");
  }

  return vital;
}

export async function updateVital(
  id: string,
  input: UpdateVitalInput
) {
  const vital = await prisma.encounterVital.findUnique({
    where: {
      id,
    },
  });

  if (!vital) {
    throw new Error("VITAL_NOT_FOUND");
  }

  return prisma.encounterVital.update({
    where: {
      id,
    },
    data: {
      temperatureCelsius:
        input.temperatureCelsius,
      pulseRate: input.pulseRate,
      respiratoryRate: input.respiratoryRate,
      oxygenSaturation: input.oxygenSaturation,

      bloodPressureSystolic:
        input.bloodPressureSystolic,
      bloodPressureDiastolic:
        input.bloodPressureDiastolic,

      heightCm: input.heightCm,
      weightKg: input.weightKg,
      bmi: input.bmi,

      painScore: input.painScore,
      bloodGlucose: input.bloodGlucose,

      remarks: input.remarks?.trim(),

      recordedAt: input.recordedAt
        ? new Date(input.recordedAt)
        : undefined,
    },
  });
}