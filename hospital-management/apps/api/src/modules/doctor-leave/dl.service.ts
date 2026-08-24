import { prisma } from "../../config/prisma";

interface CreateDoctorLeaveInput {
  doctorHospitalId: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

interface UpdateDoctorLeaveInput {
  startAt?: string;
  endAt?: string;
  reason?: string | null;
}

function validateDateRange(startAt: Date, endAt: Date) {
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new TypeError("INVALID_DATE");
  }

  if (startAt >= endAt) {
    throw new Error("INVALID_LEAVE_RANGE");
  }
}

export async function createDoctorLeave(input: CreateDoctorLeaveInput) {
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  validateDateRange(startAt, endAt);

  const doctorHospital = await prisma.doctorHospital.findFirst({
    where: {
      id: input.doctorHospitalId,
      isActive: true,
    },
  });

  if (!doctorHospital) {
    throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
  }

  const conflictingLeave = await prisma.doctorLeave.findFirst({
    where: {
      doctorHospitalId: input.doctorHospitalId,
      startAt: {
        lt: endAt,
      },
      endAt: {
        gt: startAt,
      },
    },
  });

  if (conflictingLeave) {
    throw new Error("DOCTOR_LEAVE_CONFLICT");
  }

  return prisma.doctorLeave.create({
    data: {
      doctorHospitalId: input.doctorHospitalId,
      startAt,
      endAt,
      reason: input.reason,
    },
    include: {
      doctorHospital: true,
    },
  });
}

export async function getDoctorLeaves() {
  return prisma.doctorLeave.findMany({
    include: {
      doctorHospital: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });
}

export async function getDoctorLeaveById(id: string) {
  const leave = await prisma.doctorLeave.findUnique({
    where: { id },
    include: {
      doctorHospital: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          hospital: true,
        },
      },
    },
  });

  if (!leave) {
    throw new Error("DOCTOR_LEAVE_NOT_FOUND");
  }

  return leave;
}

export async function updateDoctorLeave(
  id: string,
  input: UpdateDoctorLeaveInput
) {
  const leave = await prisma.doctorLeave.findUnique({
    where: { id },
  });

  if (!leave) {
    throw new Error("DOCTOR_LEAVE_NOT_FOUND");
  }

  const finalStartAt = input.startAt
    ? new Date(input.startAt)
    : leave.startAt;

  const finalEndAt = input.endAt
    ? new Date(input.endAt)
    : leave.endAt;

  validateDateRange(finalStartAt, finalEndAt);

  const conflictingLeave = await prisma.doctorLeave.findFirst({
    where: {
      doctorHospitalId: leave.doctorHospitalId,
      id: {
        not: id,
      },
      startAt: {
        lt: finalEndAt,
      },
      endAt: {
        gt: finalStartAt,
      },
    },
  });

  if (conflictingLeave) {
    throw new Error("DOCTOR_LEAVE_CONFLICT");
  }

  return prisma.doctorLeave.update({
    where: { id },
    data: {
      startAt: input.startAt ? finalStartAt : undefined,
      endAt: input.endAt ? finalEndAt : undefined,
      reason: input.reason,
    },
    include: {
      doctorHospital: true,
    },
  });
} 