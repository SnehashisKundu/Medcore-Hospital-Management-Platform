import { prisma } from "../../config/prisma";

interface CreateDischargeSummaryInput {
  admissionId: string;
  preparedById: string;
  finalDiagnosis?: string;
  hospitalCourse?: string;
  conditionAtDischarge?: string;
  dischargeAdvice?: string;
  dietAdvice?: string;
  activityAdvice?: string;
  followUpDate?: string;
}

export async function createDischargeSummary(
  input: CreateDischargeSummaryInput
) {
  return prisma.$transaction(async (tx) => {
    const admission = await tx.admission.findUnique({
      where: {
        id: input.admissionId,
      },
      include: {
        dischargeSummary: true,
        encounter: true,
      },
    });

    if (!admission) {
      throw new Error("ADMISSION_NOT_FOUND");
    }

    if (admission.status !== "ADMITTED") {
      throw new Error("ADMISSION_NOT_ACTIVE");
    }

    if (admission.dischargeSummary) {
      throw new Error("DISCHARGE_SUMMARY_ALREADY_EXISTS");
    }

    const activeAllocation = await tx.bedAllocation.findFirst({
      where: {
        admissionId: input.admissionId,
        releasedAt: null,
      },
    });

    const dischargedAt = new Date();

    const dischargeSummary =
      await tx.dischargeSummary.create({
        data: {
          admissionId: input.admissionId,
          preparedById: input.preparedById,
          dischargedAt,
          finalDiagnosis: input.finalDiagnosis?.trim(),
          hospitalCourse: input.hospitalCourse?.trim(),
          conditionAtDischarge:
            input.conditionAtDischarge?.trim(),
          dischargeAdvice:
            input.dischargeAdvice?.trim(),
          dietAdvice: input.dietAdvice?.trim(),
          activityAdvice:
            input.activityAdvice?.trim(),
          followUpDate: input.followUpDate
            ? new Date(input.followUpDate)
            : undefined,
        },
        include: {
          admission: {
            select: {
              id: true,
              admissionNumber: true,
              hospitalId: true,
              patientId: true,
              encounterId: true,
              status: true,
            },
          },
        },
      });

    // Release active bed allocation, if one exists
    if (activeAllocation) {
      await tx.bedAllocation.update({
        where: {
          id: activeAllocation.id,
        },
        data: {
          releasedAt: dischargedAt,
        },
      });

      await tx.bed.update({
        where: {
          id: activeAllocation.bedId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    // Close linked encounter, if still active
    if (
      admission.encounter?.status === "ACTIVE"
    ) {
      await tx.encounter.update({
        where: {
          id: admission.encounterId!,
        },
        data: {
          status: "COMPLETED",
          endedAt: dischargedAt,
        },
      });
    }

    await tx.admission.update({
      where: {
        id: input.admissionId,
      },
      data: {
        status: "DISCHARGED",
        dischargedAt,
      },
    });

    return tx.dischargeSummary.findUnique({
      where: {
        id: dischargeSummary.id,
      },
      include: {
        admission: {
          include: {
            patient: true,
            encounter: true,
            hospital: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  });
}

export async function getDischargeSummaries(
  admissionId?: string
) {
  return prisma.dischargeSummary.findMany({
    where: {
      ...(admissionId ? { admissionId } : {}),
    },
    include: {
      admission: {
        include: {
          patient: true,
          hospital: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          encounter: {
            select: {
              id: true,
              encounterNumber: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDischargeSummaryById(
  id: string
) {
  const dischargeSummary =
    await prisma.dischargeSummary.findUnique({
      where: {
        id,
      },
      include: {
        admission: {
          include: {
            patient: true,
            hospital: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            encounter: true,
          },
        },
      },
    });

  if (!dischargeSummary) {
    throw new Error("DISCHARGE_SUMMARY_NOT_FOUND");
  }

  return dischargeSummary;
}