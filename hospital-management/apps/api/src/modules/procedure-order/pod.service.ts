import { prisma } from "../../config/prisma";

type ProcedureStatus =
  | "ORDERED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED";

interface CreateProcedureOrderInput {
  encounterId: string;
  admissionId?: string;
  procedureId: string;
  orderedById: string;
  reason?: string;
  instructions?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface UpdateProcedureOrderInput {
  status?: ProcedureStatus;
  reason?: string;
  instructions?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
}

export async function createProcedureOrder(
  input: CreateProcedureOrderInput
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

  const procedure =
    await prisma.procedure.findUnique({
      where: {
        id: input.procedureId,
      },
    });

  if (!procedure || !procedure.isActive) {
    throw new Error("PROCEDURE_NOT_FOUND");
  }

  const orderedBy =
    await prisma.user.findUnique({
      where: {
        id: input.orderedById,
      },
    });

  if (!orderedBy) {
    throw new Error("USER_NOT_FOUND");
  }

  if (input.admissionId) {
    const admission =
      await prisma.admission.findUnique({
        where: {
          id: input.admissionId,
        },
      });

    if (!admission) {
      throw new Error("ADMISSION_NOT_FOUND");
    }

    if (admission.patientId !== encounter.patientId) {
      throw new Error(
        "ADMISSION_ENCOUNTER_MISMATCH"
      );
    }

    if (admission.status !== "ADMITTED") {
      throw new Error("ADMISSION_NOT_ACTIVE");
    }
  }

  if (
    input.scheduledStart &&
    input.scheduledEnd &&
    new Date(input.scheduledEnd) <=
      new Date(input.scheduledStart)
  ) {
    throw new Error("INVALID_SCHEDULE");
  }

  return prisma.procedureOrder.create({
    data: {
      encounterId: input.encounterId,
      admissionId: input.admissionId,
      procedureId: input.procedureId,
      orderedById: input.orderedById,

      reason: input.reason?.trim(),
      instructions: input.instructions?.trim(),

      scheduledStart: input.scheduledStart
        ? new Date(input.scheduledStart)
        : undefined,

      scheduledEnd: input.scheduledEnd
        ? new Date(input.scheduledEnd)
        : undefined,
    },

    include: {
      encounter: {
        select: {
          id: true,
          hospitalId: true,
          patient: true,
          hospital: true,
        },
      },

      admission: true,

      procedure: true,

      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

export async function getProcedureOrders() {
  return prisma.procedureOrder.findMany({
    include: {
      encounter: {
        select: {
          id: true,
          hospitalId: true,
          patient: true,
          hospital: true,
        },
      },

      admission: true,

      procedure: true,

      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      staff: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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

export async function getProcedureOrderById(
  id: string
) {
  const procedureOrder =
    await prisma.procedureOrder.findUnique({
      where: {
        id,
      },

      include: {
        encounter: {
          select: {
            id: true,
            hospitalId: true,
            patient: true,
            hospital: true,
          },
        },

        admission: true,

        procedure: true,

        orderedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

  if (!procedureOrder) {
    throw new Error(
      "PROCEDURE_ORDER_NOT_FOUND"
    );
  }

  return procedureOrder;
}

export async function updateProcedureOrder(
  id: string,
  input: UpdateProcedureOrderInput
) {
  const procedureOrder =
    await prisma.procedureOrder.findUnique({
      where: {
        id,
      },
    });

  if (!procedureOrder) {
    throw new Error(
      "PROCEDURE_ORDER_NOT_FOUND"
    );
  }

  if (
    procedureOrder.status === "COMPLETED" ||
    procedureOrder.status === "CANCELLED"
  ) {
    throw new Error(
      "PROCEDURE_ORDER_NOT_MODIFIABLE"
    );
  }

  const scheduledStart = input.scheduledStart
    ? new Date(input.scheduledStart)
    : procedureOrder.scheduledStart;

  const scheduledEnd = input.scheduledEnd
    ? new Date(input.scheduledEnd)
    : procedureOrder.scheduledEnd;

  if (
    scheduledStart &&
    scheduledEnd &&
    scheduledEnd <= scheduledStart
  ) {
    throw new Error("INVALID_SCHEDULE");
  }

  const updateData: any = {
    status: input.status,
    reason: input.reason?.trim(),
    instructions: input.instructions?.trim(),
    notes: input.notes?.trim(),
  };

  if (input.scheduledStart !== undefined) {
    updateData.scheduledStart =
      input.scheduledStart
        ? new Date(input.scheduledStart)
        : null;
  }

  if (input.scheduledEnd !== undefined) {
    updateData.scheduledEnd =
      input.scheduledEnd
        ? new Date(input.scheduledEnd)
        : null;
  }

  if (input.startedAt !== undefined) {
    updateData.startedAt =
      input.startedAt
        ? new Date(input.startedAt)
        : null;
  }

  if (input.completedAt !== undefined) {
    updateData.completedAt =
      input.completedAt
        ? new Date(input.completedAt)
        : null;
  }

  if (input.cancelledAt !== undefined) {
    updateData.cancelledAt =
      input.cancelledAt
        ? new Date(input.cancelledAt)
        : null;
  }

  if (
    input.status === "IN_PROGRESS" &&
    !procedureOrder.startedAt &&
    input.startedAt === undefined
  ) {
    updateData.startedAt = new Date();
  }

  if (
    input.status === "COMPLETED" &&
    !procedureOrder.completedAt &&
    input.completedAt === undefined
  ) {
    updateData.completedAt = new Date();
  }

  if (
    input.status === "CANCELLED" &&
    !procedureOrder.cancelledAt &&
    input.cancelledAt === undefined
  ) {
    updateData.cancelledAt = new Date();
  }

  return prisma.procedureOrder.update({
    where: {
      id,
    },

    data: updateData,

    include: {
      encounter: {
        select: {
          id: true,
          hospitalId: true,
          patient: true,
          hospital: true,
        },
      },

      admission: true,
      procedure: true,

      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}