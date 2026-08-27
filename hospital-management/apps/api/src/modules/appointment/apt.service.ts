import { prisma } from "../../config/prisma";
import { NotificationType } from "../../generated/prisma/client";
import { sendPatientNotification } from "../notification/notification.service";

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

const DAY_OF_WEEK = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function parseAppointmentDates(
  scheduledStart: string,
  scheduledEnd: string
) {
  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("INVALID_APPOINTMENT_DATE");
  }

  if (start >= end) {
    throw new Error("INVALID_APPOINTMENT_RANGE");
  }

  return { start, end };
}

function getTimeInMinutes(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function getDayOfWeek(date: Date) {
  return DAY_OF_WEEK[date.getUTCDay()];
}

function parseScheduleTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

async function validateAppointmentAvailability(
  doctorHospitalId: string,
  departmentId: string,
  scheduledStart: Date,
  scheduledEnd: Date,
  excludeAppointmentId?: string
) {
  // Appointment must start and end on the same calendar day
  if (
    scheduledStart.getUTCFullYear() !== scheduledEnd.getUTCFullYear() ||
    scheduledStart.getUTCMonth() !== scheduledEnd.getUTCMonth() ||
    scheduledStart.getUTCDate() !== scheduledEnd.getUTCDate()
  ) {
    throw new Error("APPOINTMENT_MUST_BE_SAME_DAY");
  }

  const dayOfWeek = getDayOfWeek(scheduledStart);

  const startMinutes = getTimeInMinutes(scheduledStart);
  const endMinutes = getTimeInMinutes(scheduledEnd);

  const schedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorHospitalId,
      departmentId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!schedules.length) {
    throw new Error("DOCTOR_NOT_AVAILABLE_ON_DAY");
  }

  const matchingSchedule = schedules.find((schedule) => {
    const scheduleStart = parseScheduleTime(schedule.startTime);
    const scheduleEnd = parseScheduleTime(schedule.endTime);

    const appointmentDuration =
      endMinutes - startMinutes;

    const isWithinSchedule =
      startMinutes >= scheduleStart &&
      endMinutes <= scheduleEnd;

    const isCorrectDuration =
      appointmentDuration ===
      schedule.slotDurationMinutes;

    const isSlotAligned =
      (startMinutes - scheduleStart) %
        schedule.slotDurationMinutes ===
      0;

    return (
      isWithinSchedule &&
      isCorrectDuration &&
      isSlotAligned
    );
  });

  if (!matchingSchedule) {
    throw new Error("INVALID_DOCTOR_SCHEDULE_SLOT");
  }

  // Doctor must not be on leave during appointment time
  const leaveConflict = await prisma.doctorLeave.findFirst({
    where: {
      doctorHospitalId,
      startAt: {
        lt: scheduledEnd,
      },
      endAt: {
        gt: scheduledStart,
      },
    },
  });

  if (leaveConflict) {
    throw new Error("DOCTOR_ON_LEAVE");
  }

  // Doctor must not already have another active appointment
  const appointmentConflict =
    await prisma.appointment.findFirst({
      where: {
        doctorHospitalId,
        deletedAt: null,
        status: {
          not: "CANCELLED",
        },
        ...(excludeAppointmentId
          ? {
              id: {
                not: excludeAppointmentId,
              },
            }
          : {}),
        scheduledStart: {
          lt: scheduledEnd,
        },
        scheduledEnd: {
          gt: scheduledStart,
        },
      },
    });

  if (appointmentConflict) {
    throw new Error("APPOINTMENT_SLOT_ALREADY_BOOKED");
  }
}

export async function createAppointment(
  input: CreateAppointmentInput
) {
  const { start, end } = parseAppointmentDates(
    input.scheduledStart,
    input.scheduledEnd
  );

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

  const existingAppointment =
    await prisma.appointment.findFirst({
      where: {
        hospitalId: input.hospitalId,
        appointmentNumber:
          input.appointmentNumber.trim(),
      },
    });

  if (existingAppointment) {
    throw new Error("APPOINTMENT_NUMBER_EXISTS");
  }

  await validateAppointmentAvailability(
    input.doctorHospitalId,
    assignment.departmentId,
    start,
    end
  );

  const appointment = await prisma.appointment.create({
      data: {
        hospitalId: input.hospitalId,
        patientId: input.patientId,
        doctorHospitalId: input.doctorHospitalId,
        doctorDepartmentAssignmentId:
          input.doctorDepartmentAssignmentId,

        appointmentNumber:
          input.appointmentNumber.trim(),

        type: input.type ?? "OPD",
        priority: input.priority ?? "NORMAL",

        scheduledStart: start,
        scheduledEnd: end,

        reason: input.reason?.trim(),
        notes: input.notes?.trim(),
      },
  });

await sendPatientNotification({
  patientId: appointment.patientId,
  type: NotificationType.APPOINTMENT_BOOKED,
  subject: "Appointment Booked",
  message:
    `Your appointment (${appointment.appointmentNumber}) ` +
    `has been booked successfully.`,
  referenceType: "APPOINTMENT",
  referenceId: appointment.id,
});

return appointment;
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
    include: {
      doctorDepartmentAssignment: true,
    },
  });

  if (!appointment) {
    throw new Error("APPOINTMENT_NOT_FOUND");
  }

  // Keep raw strings here so invalid dates are handled
  // by parseAppointmentDates instead of toISOString().
  const finalStart =
    input.scheduledStart !== undefined
      ? input.scheduledStart
      : appointment.scheduledStart.toISOString();

  const finalEnd =
    input.scheduledEnd !== undefined
      ? input.scheduledEnd
      : appointment.scheduledEnd.toISOString();

  const { start, end } = parseAppointmentDates(
    finalStart,
    finalEnd
  );

  const finalStatus =
    input.status ?? appointment.status;

  // Cancelled appointments do not occupy doctor slots.
  if (finalStatus !== "CANCELLED") {
    await validateAppointmentAvailability(
      appointment.doctorHospitalId,
      appointment.doctorDepartmentAssignment.departmentId,
      start,
      end,
      appointment.id
    );
  }

  return prisma.appointment.update({
    where: {
      id,
    },
    data: {
      type: input.type,
      priority: input.priority,
      status: input.status,

      scheduledStart:
        input.scheduledStart !== undefined
          ? start
          : undefined,

      scheduledEnd:
        input.scheduledEnd !== undefined
          ? end
          : undefined,

      reason:
        input.reason !== undefined
          ? input.reason.trim()
          : undefined,

      notes:
        input.notes !== undefined
          ? input.notes.trim()
          : undefined,
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