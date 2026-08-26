import { prisma } from "../../config/prisma";

interface CreateImagingReportInput {
  diagnosticOrderItemId: string;
  reportedById: string;
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

function parseValidDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("INVALID_REPORTED_AT");
  }

  return date;
}

export async function createImagingReport(
  input: CreateImagingReportInput
) {
  const orderItem =
    await prisma.diagnosticOrderItem.findUnique({
      where: {
        id: input.diagnosticOrderItemId,
      },

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
    });

  if (!orderItem) {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_NOT_FOUND");
  }

  if (orderItem.diagnosticTest.category !== "IMAGING") {
    throw new Error("INVALID_DIAGNOSTIC_TEST_CATEGORY");
  }

  if (!orderItem.diagnosticTest.isActive) {
    throw new Error("DIAGNOSTIC_TEST_INACTIVE");
  }

  if (orderItem.status === "CANCELLED") {
    throw new Error("DIAGNOSTIC_ORDER_ITEM_CANCELLED");
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

  const reporter = await prisma.user.findUnique({
    where: {
      id: input.reportedById,
    },
  });

  if (!reporter) {
    throw new Error("REPORTER_NOT_FOUND");
  }

  const reportedAt = input.reportedAt
    ? parseValidDate(input.reportedAt)
    : new Date();

  return prisma.$transaction(async (tx) => {
    const report = await tx.imagingReport.create({
      data: {
        diagnosticOrderItemId:
          input.diagnosticOrderItemId,

        reportedById: input.reportedById,

        findings: input.findings?.trim() || undefined,

        impression: input.impression?.trim() || undefined,

        conclusion: input.conclusion?.trim() || undefined,

        reportedAt,
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

    await tx.diagnosticOrderItem.update({
      where: {
        id: input.diagnosticOrderItemId,
      },

      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return report;
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

  const hasUpdate =
    input.findings !== undefined ||
    input.impression !== undefined ||
    input.conclusion !== undefined ||
    input.reportedAt !== undefined;

  if (!hasUpdate) {
    throw new Error("NO_UPDATE_DATA");
  }

  const data: {
    findings?: string;
    impression?: string;
    conclusion?: string;
    reportedAt?: Date;
  } = {};

  if (input.findings !== undefined) {
    const findings = input.findings.trim();

    if (!findings) {
      throw new Error("INVALID_FINDINGS");
    }

    data.findings = findings;
  }

  if (input.impression !== undefined) {
    const impression = input.impression.trim();

    if (!impression) {
      throw new Error("INVALID_IMPRESSION");
    }

    data.impression = impression;
  }

  if (input.conclusion !== undefined) {
    const conclusion = input.conclusion.trim();

    if (!conclusion) {
      throw new Error("INVALID_CONCLUSION");
    }

    data.conclusion = conclusion;
  }

  if (input.reportedAt !== undefined) {
    data.reportedAt =
      parseValidDate(input.reportedAt);
  }

  return prisma.imagingReport.update({
    where: {
      id,
    },

    data,

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