import { prisma } from "../../config/prisma";

type DiagnosticOrderStatusValue =
  | "ORDERED"
  | "SCHEDULED"
  | "SAMPLE_COLLECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface DiagnosticOrderItemInput {
  diagnosticTestId: string;
  instructions?: string;
  scheduledAt?: string;
}

interface CreateDiagnosticOrderInput {
  encounterId: string;
  orderedById: string;
  clinicalNotes?: string;
  items: DiagnosticOrderItemInput[];
}

interface UpdateDiagnosticOrderInput {
  clinicalNotes?: string;
}

interface UpdateDiagnosticOrderItemInput {
  status?: DiagnosticOrderStatusValue;
  scheduledAt?: string;
  sampleCollectedAt?: string;
  startedAt?: string;
  completedAt?: string;
  instructions?: string;
}

export async function createDiagnosticOrder(
  input: CreateDiagnosticOrderInput
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  if (encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  const doctor = await prisma.user.findUnique({
    where: {
      id: input.orderedById,
    },
  });

  if (!doctor) {
    throw new Error("ORDERED_BY_NOT_FOUND");
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("DIAGNOSTIC_ITEMS_REQUIRED");
  }

  for (const item of input.items) {
    const test = await prisma.diagnosticTest.findUnique({
      where: {
        id: item.diagnosticTestId,
      },
    });

    if (!test) {
      throw new Error("DIAGNOSTIC_TEST_NOT_FOUND");
    }

    if (!test.isActive) {
      throw new Error("DIAGNOSTIC_TEST_INACTIVE");
    }
  }

  return prisma.$transaction(async (tx) => {
    return tx.diagnosticOrder.create({
      data: {
        encounterId: input.encounterId,
        orderedById: input.orderedById,
        clinicalNotes: input.clinicalNotes?.trim(),

        items: {
          create: input.items.map((item) => ({
            diagnosticTestId: item.diagnosticTestId,
            instructions: item.instructions?.trim(),
            scheduledAt: item.scheduledAt
              ? new Date(item.scheduledAt)
              : undefined,
          })),
        },
      },

      include: {
        encounter: true,

        orderedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        items: {
          include: {
            diagnosticTest: true,
          },
        },
      },
    });
  });
}

export async function getDiagnosticOrders() {
  return prisma.diagnosticOrder.findMany({
    include: {
      encounter: true,

      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      items: {
        include: {
          diagnosticTest: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDiagnosticOrderById(id: string) {
  const order = await prisma.diagnosticOrder.findUnique({
    where: {
      id,
    },

    include: {
      encounter: true,

      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      items: {
        include: {
          diagnosticTest: true,
          labResult: {
            include: {
              values: true,
            },
          },
          imagingReport: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("DIAGNOSTIC_ORDER_NOT_FOUND");
  }

  return order;
}

export async function updateDiagnosticOrder(
  id: string,
  input: UpdateDiagnosticOrderInput
) {
  const order = await prisma.diagnosticOrder.findUnique({
    where: {
      id,
    },
    include: {
      encounter: true,
    },
  });

  if (!order) {
    throw new Error("DIAGNOSTIC_ORDER_NOT_FOUND");
  }

  if (order.encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  return prisma.diagnosticOrder.update({
    where: {
      id,
    },

    data: {
      clinicalNotes: input.clinicalNotes?.trim(),
    },

    include: {
      encounter: true,
      items: {
        include: {
          diagnosticTest: true,
        },
      },
    },
  });
}

export async function updateDiagnosticOrderItem(
  id: string,
  input: UpdateDiagnosticOrderItemInput
) {
  const item = await prisma.diagnosticOrderItem.findUnique({
    where: {
      id,
    },
    include: {
      diagnosticOrder: {
        include: {
          encounter: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_NOT_FOUND");
  }

  // Cannot update items belonging to a cancelled encounter
  if (item.diagnosticOrder.encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  const currentStatus = item.status;
  const newStatus = input.status ?? currentStatus;

  // Terminal states cannot be changed
  if (
    currentStatus === "COMPLETED" ||
    currentStatus === "CANCELLED"
  ) {
    if (input.status && input.status !== currentStatus) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
  }

  // Allowed status transitions
  const allowedTransitions: Record<
    DiagnosticOrderStatusValue,
    DiagnosticOrderStatusValue[]
  > = {
    ORDERED: ["SCHEDULED", "CANCELLED"],
    SCHEDULED: [
      "SAMPLE_COLLECTED",
      "IN_PROGRESS",
      "CANCELLED",
    ],
    SAMPLE_COLLECTED: [
      "IN_PROGRESS",
      "CANCELLED",
    ],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (
    input.status &&
    input.status !== currentStatus &&
    !allowedTransitions[currentStatus].includes(input.status)
  ) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  // Parse dates only when provided
  const scheduledAt = input.scheduledAt
    ? new Date(input.scheduledAt)
    : item.scheduledAt;

  const sampleCollectedAt = input.sampleCollectedAt
    ? new Date(input.sampleCollectedAt)
    : item.sampleCollectedAt;

  const startedAt = input.startedAt
    ? new Date(input.startedAt)
    : item.startedAt;

  const completedAt = input.completedAt
    ? new Date(input.completedAt)
    : item.completedAt;

  // Validate invalid dates
  const dates = [
    scheduledAt,
    sampleCollectedAt,
    startedAt,
    completedAt,
  ];

  if (
    dates.some(
      (date) =>
        date !== null &&
        Number.isNaN(date.getTime())
    )
  ) {
    throw new Error("INVALID_DATE");
  }

  // Timestamp sequence validation
  if (
    scheduledAt &&
    sampleCollectedAt &&
    sampleCollectedAt < scheduledAt
  ) {
    throw new Error("INVALID_TIMESTAMP_SEQUENCE");
  }

  if (
    sampleCollectedAt &&
    startedAt &&
    startedAt < sampleCollectedAt
  ) {
    throw new Error("INVALID_TIMESTAMP_SEQUENCE");
  }

  if (
    startedAt &&
    completedAt &&
    completedAt < startedAt
  ) {
    throw new Error("INVALID_TIMESTAMP_SEQUENCE");
  }

  // COMPLETED must have completedAt
  if (
    newStatus === "COMPLETED" &&
    !completedAt
  ) {
    throw new Error("COMPLETED_AT_REQUIRED");
  }

  return prisma.diagnosticOrderItem.update({
    where: {
      id,
    },

    data: {
      status: input.status,

      scheduledAt: input.scheduledAt
        ? new Date(input.scheduledAt)
        : undefined,

      sampleCollectedAt: input.sampleCollectedAt
        ? new Date(input.sampleCollectedAt)
        : undefined,

      startedAt: input.startedAt
        ? new Date(input.startedAt)
        : undefined,

      completedAt: input.completedAt
        ? new Date(input.completedAt)
        : undefined,

      instructions: input.instructions?.trim(),
    },

    include: {
      diagnosticTest: true,
      diagnosticOrder: {
        include: {
          encounter: true,
        },
      },
    },
  });
}