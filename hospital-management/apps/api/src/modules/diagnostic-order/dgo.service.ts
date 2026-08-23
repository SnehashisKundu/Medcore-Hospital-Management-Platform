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
  });

  if (!item) {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_NOT_FOUND");
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