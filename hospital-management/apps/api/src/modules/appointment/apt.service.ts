import { prisma } from "../../config/prisma";

interface CreateAppointmentInput {
  hospitalId: string;
  patientId: string;
  doctorHospitalId: string;
  doctorDepartmentAssignmentId: string;
  appointmentNumber: string;
  type?: "OPD" | "IPD" | "WALK_IN" | "EMERGENCY" | "VIDEO" | "HOME_VISIT";
  priority?: "NORMAL" | "URGENT" | "EMERGENCY";
  scheduledStart: string;
  scheduledEnd: string;
  reason?: string;
  notes?: string;
}

interface UpdateAppointmentInput {
  type?: CreateAppointmentInput["type"];
  priority?: CreateAppointmentInput["priority"];
  scheduledStart?: string;
  scheduledEnd?: string;
  reason?: string;
  notes?: string;
  status?: 
    | "BOOKED"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "WAITING"
    | "IN_CONSULTATION"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | "RESCHEDULED";
}

export async function createAppointment(
  input: CreateAppointmentInput
) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id: input.hospitalId,
      isActive: true,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      isActive: true,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const doctorHospital = await prisma.doctorHospital.findFirst({
    where: {
      id: input.doctorHospitalId,
      hospitalId: input.hospitalId,
      isActive: true,
    },
  });

  if (!doctorHospital) {
    throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
  }

  const assignment =
    await prisma.doctorDepartmentAssignment.findFirst({
      where: {
        id: input.doctorDepartmentAssignmentId,
        doctorHospitalId: input.doctorHospitalId,
        isActive: true,
      },
    });

  if (!assignment) {
    throw new Error("DOCTOR_ASSIGNMENT_NOT_FOUND");
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      hospitalId: input.hospitalId,
      appointmentNumber: input.appointmentNumber.trim(),
    },
  });

  if (existing) {
    throw new Error("APPOINTMENT_NUMBER_EXISTS");
  }

  return prisma.appointment.create({
    data: {
      hospitalId: input.hospitalId,
      patientId: input.patientId,
      doctorHospitalId: input.doctorHospitalId,
      doctorDepartmentAssignmentId:
        input.doctorDepartmentAssignmentId,

      appointmentNumber: input.appointmentNumber.trim(),

      type: input.type ?? "OPD",
      priority: input.priority ?? "NORMAL",

      scheduledStart: new Date(input.scheduledStart),
      scheduledEnd: new Date(input.scheduledEnd),

      reason: input.reason?.trim(),
      notes: input.notes?.trim(),
    },
  });
}

export async function getAppointments() {
  return prisma.appointment.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      patient: true,
      doctorHospital: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      doctorDepartmentAssignment: {
        include: {
          department: true,
          specialization: true,
        },
      },
    },
    orderBy: {
      scheduledStart: "desc",
    },
  });
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      patient: true,
      doctorHospital: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      doctorDepartmentAssignment: {
        include: {
          department: true,
          specialization: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("APPOINTMENT_NOT_FOUND");
  }

  return appointment;
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!appointment) {
    throw new Error("APPOINTMENT_NOT_FOUND");
  }

  return prisma.appointment.update({
    where: {
      id,
    },
    data: {
      type: input.type,
      priority: input.priority,
      status: input.status,
      scheduledStart: input.scheduledStart
        ? new Date(input.scheduledStart)
        : undefined,
      scheduledEnd: input.scheduledEnd
        ? new Date(input.scheduledEnd)
        : undefined,
      reason: input.reason?.trim(),
      notes: input.notes?.trim(),
    },
  });
}

export async function deleteAppointment(id: string) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!appointment) {
    throw new Error("APPOINTMENT_NOT_FOUND");
  }

  return prisma.appointment.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}