import { prisma } from "../../config/prisma";

import type {
  ProcedureStaffRole,
} from "../../generated/prisma/client";

function normalizeProcedureStaffRole(
  role: string
): ProcedureStaffRole {
  const normalized = String(role)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const map: Record<string, ProcedureStaffRole> = {
    SURGEON: "PRIMARY_SURGEON",
    PRIMARY_SURGEON: "PRIMARY_SURGEON",
    ASSISTANT_SURGEON: "ASSISTANT_SURGEON",
    ANESTHETIST: "ANESTHETIST",
    NURSE: "NURSE",
    TECHNICIAN: "TECHNICIAN",
    OTHER: "OTHER",
  };

  const resolved = map[normalized];

  if (!resolved) {
    throw new Error("INVALID_PROCEDURE_STAFF_ROLE");
  }

  return resolved;
}

interface CreateProcedureStaffAssignmentInput {
  procedureOrderId: string;
  userId: string;
  role: ProcedureStaffRole;
}

export async function createProcedureStaffAssignment(
  input: CreateProcedureStaffAssignmentInput
) {
  const procedureOrder =
    await prisma.procedureOrder.findUnique({
      where: {
        id: input.procedureOrderId,
      },
      include: {
        encounter: {
          select: {
            hospitalId: true,
          },
        },
      },
    });

  if (!procedureOrder) {
    throw new Error("PROCEDURE_ORDER_NOT_FOUND");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: input.userId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const normalizedRole = normalizeProcedureStaffRole(
    String(input.role)
  );

  const existing =
    await prisma.procedureStaffAssignment.findUnique({
      where: {
        procedureOrderId_userId_role: {
          procedureOrderId:
            input.procedureOrderId,
          userId: input.userId,
          role: normalizedRole,
        },
      },
    });

  if (existing) {
    throw new Error("STAFF_ALREADY_ASSIGNED");
  }

  return prisma.procedureStaffAssignment.create({
    data: {
      procedureOrderId: input.procedureOrderId,
      userId: input.userId,
      role: normalizedRole,
    },

    include: {
      procedureOrder: {
        include: {
          encounter: {
            select: {
              id: true,
              hospitalId: true,
            },
          },
          procedure: true,
        },
      },

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function getProcedureStaffAssignments() {
  return prisma.procedureStaffAssignment.findMany({
    include: {
      procedureOrder: {
        include: {
          encounter: {
            select: {
              id: true,
              hospitalId: true,
            },
          },
          procedure: true,
        },
      },

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },

    orderBy: {
      assignedAt: "desc",
    },
  });
}

export async function getProcedureStaffAssignmentById(
  id: string
) {
  const assignment =
    await prisma.procedureStaffAssignment.findUnique({
      where: {
        id,
      },

      include: {
        procedureOrder: {
          include: {
            encounter: {
              select: {
                id: true,
                hospitalId: true,
              },
            },
            procedure: true,
          },
        },

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

  if (!assignment) {
    throw new Error("PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND");
  }

  return assignment;
}

export async function updateProcedureStaffAssignment(
  id: string,
  role: ProcedureStaffRole
) {
  const normalizedRole = normalizeProcedureStaffRole(
    String(role)
  );

  const assignment =
    await prisma.procedureStaffAssignment.findUnique({
      where: {
        id,
      },
    });

  if (!assignment) {
    throw new Error("PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND");
  }

  const duplicate =
    await prisma.procedureStaffAssignment.findFirst({
      where: {
        procedureOrderId:
          assignment.procedureOrderId,
        userId: assignment.userId,
        role: normalizedRole,
        NOT: {
          id,
        },
      },
    });

  if (duplicate) {
    throw new Error("STAFF_ALREADY_ASSIGNED");
  }

  return prisma.procedureStaffAssignment.update({
    where: {
      id,
    },

    data: {
      role: normalizedRole,
    },

    include: {
      procedureOrder: {
        include: {
          encounter: {
            select: {
              id: true,
              hospitalId: true,
            },
          },
          procedure: true,
        },
      },

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function deleteProcedureStaffAssignment(
  id: string
) {
  const assignment =
    await prisma.procedureStaffAssignment.findUnique({
      where: {
        id,
      },

      include: {
        procedureOrder: {
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

  if (!assignment) {
    throw new Error("PROCEDURE_STAFF_ASSIGNMENT_NOT_FOUND");
  }

  await prisma.procedureStaffAssignment.delete({
    where: {
      id,
    },
  });

  return assignment;
}