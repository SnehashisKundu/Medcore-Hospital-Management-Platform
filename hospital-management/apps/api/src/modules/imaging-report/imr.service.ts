import { prisma } from "../../config/prisma";

interface CreateImagingReportInput {
  diagnosticOrderItemId: string;
  reportedById?: string;
  findings?: string;
  impression?: string;
  conclusion?: string;
  reportedAt?: string;
}

interface UpdateImagingReportInput {
  findings?: string;
  impression?: string;
  conclusion?: string;
  reportedAt?: string;
}

export async function createImagingReport(
  input: CreateImagingReportInput
) {
  const orderItem =
    await prisma.diagnosticOrderItem.findUnique({
      where: {
        id: input.diagnosticOrderItemId,
      },
    });

  if (!orderItem) {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_NOT_FOUND");
  }

  const existing =
    await prisma.imagingReport.findUnique({
      where: {
        diagnosticOrderItemId:
          input.diagnosticOrderItemId,
      },
    });

  if (existing) {
    throw new Error("IMAGING_REPORT_ALREADY_EXISTS");
  }

  if (input.reportedById) {
    const reporter = await prisma.user.findUnique({
      where: {
        id: input.reportedById,
      },
    });

    if (!reporter) {
      throw new Error("REPORTER_NOT_FOUND");
    }
  }

  return prisma.imagingReport.create({
    data: {
      diagnosticOrderItemId:
        input.diagnosticOrderItemId,

      reportedById: input.reportedById,

      findings: input.findings?.trim(),

      impression: input.impression?.trim(),

      conclusion: input.conclusion?.trim(),

      reportedAt: input.reportedAt
        ? new Date(input.reportedAt)
        : new Date(),
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
    },
  });
}

export async function getImagingReports() {
  return prisma.imagingReport.findMany({
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
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getImagingReportById(
  id: string
) {
  const report =
    await prisma.imagingReport.findUnique({
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
      },
    });

  if (!report) {
    throw new Error("IMAGING_REPORT_NOT_FOUND");
  }

  return report;
}

export async function updateImagingReport(
  id: string,
  input: UpdateImagingReportInput
) {
  const report =
    await prisma.imagingReport.findUnique({
      where: {
        id,
      },
    });

  if (!report) {
    throw new Error("IMAGING_REPORT_NOT_FOUND");
  }

  return prisma.imagingReport.update({
    where: {
      id,
    },

    data: {
      findings: input.findings?.trim(),

      impression: input.impression?.trim(),

      conclusion: input.conclusion?.trim(),

      reportedAt: input.reportedAt
        ? new Date(input.reportedAt)
        : undefined,
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
    },
  });
}