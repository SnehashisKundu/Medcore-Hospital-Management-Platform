import { prisma } from "../../config/prisma";

interface LabResultValueInput {
  parameterName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
}

interface CreateLabResultInput {
  diagnosticOrderItemId: string;
  reportedById: string;
  remarks?: string;
  reportedAt?: string;
  values?: LabResultValueInput[];
}

interface UpdateLabResultInput {
  remarks?: string;
  reportedAt?: string;
}

export async function createLabResult(
  input: CreateLabResultInput
) {
  const orderItem =
    await prisma.diagnosticOrderItem.findUnique({
      where: {
        id: input.diagnosticOrderItemId,
      },
      include: {
        diagnosticTest: true,
      },
    });

  if (!orderItem) {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_NOT_FOUND");
  }

  // Lab result can only be created for LAB tests
  if (orderItem.diagnosticTest.category !== "LAB") {
    throw new Error("DIAGNOSTIC_TEST_NOT_LAB");
  }

  const existingResult =
    await prisma.labResult.findUnique({
      where: {
        diagnosticOrderItemId:
          input.diagnosticOrderItemId,
      },
    });

  if (existingResult) {
    throw new Error("LAB_RESULT_ALREADY_EXISTS");
  }

  const technician = await prisma.user.findUnique({
    where: {
      id: input.reportedById,
    },
  });

  if (!technician) {
    throw new Error("REPORTER_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const result = await tx.labResult.create({
      data: {
        diagnosticOrderItemId:
          input.diagnosticOrderItemId,

        reportedById: input.reportedById,

        remarks: input.remarks?.trim(),

        reportedAt: input.reportedAt
          ? new Date(input.reportedAt)
          : new Date(),

        values: {
          create:
            input.values?.map((value) => ({
              parameterName:
                value.parameterName.trim(),

              value: value.value.trim(),

              unit: value.unit?.trim(),

              referenceRange:
                value.referenceRange?.trim(),

              isAbnormal:
                value.isAbnormal ?? false,
            })) ?? [],
        },
      },

      include: {
        diagnosticOrderItem: {
          include: {
            diagnosticTest: true,

            diagnosticOrder: {
              include: {
                encounter: {
                  select: {
                    hospitalId: true,
                  },
                },
              },
            },
          },
        },

        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        values: true,
      },
    });

    return result;
  });
}

export async function getLabResults() {
  return prisma.labResult.findMany({
    include: {
      diagnosticOrderItem: {
        include: {
          diagnosticTest: true,

          diagnosticOrder: {
            include: {
              encounter: {
                select: {
                  hospitalId: true,
                },
              },
            },
          },
        },
      },

      reportedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      values: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getLabResultById(id: string) {
  const result = await prisma.labResult.findUnique({
    where: {
      id,
    },

    include: {
      diagnosticOrderItem: {
        include: {
          diagnosticTest: true,
        },
      },

      reportedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      values: true,
    },
  });

  if (!result) {
    throw new Error("LAB_RESULT_NOT_FOUND");
  }

  return result;
}

export async function updateLabResult(
  id: string,
  input: UpdateLabResultInput
) {
  const result = await prisma.labResult.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new Error("LAB_RESULT_NOT_FOUND");
  }

  return prisma.labResult.update({
    where: {
      id,
    },

    data: {
      remarks: input.remarks?.trim(),

      reportedAt: input.reportedAt
        ? new Date(input.reportedAt)
        : undefined,
    },

    include: {
      diagnosticOrderItem: {
        include: {
          diagnosticOrder: {
            include: {
              encounter: {
                select: {
                  hospitalId: true,
                },
              },
            },
          },
        },
      },

      values: true,
    },
  });
}