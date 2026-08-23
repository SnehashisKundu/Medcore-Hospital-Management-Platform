import { prisma } from "../../config/prisma";

interface CreateEncounterInput {
  hospitalId: string;
  patientId: string;

  appointmentId?: string;
  emergencyCaseId?: string;

  doctorHospitalId?: string;
  doctorDepartmentAssignmentId?: string;

  encounterNumber: string;

  consultationType:
    | "OPD"
    | "IPD"
    | "WALK_IN"
    | "EMERGENCY"
    | "VIDEO"
    | "HOME_VISIT";

  chiefComplaint?: string;
  remarks?: string;

  startedAt?: string;
  followUpRequired?: boolean;
  followUpAfterDays?: number;
}

interface UpdateEncounterInput {
  status?:
    | "ACTIVE"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";

  chiefComplaint?: string;
  remarks?: string;

  endedAt?: string;

  followUpRequired?: boolean;
  followUpAfterDays?: number;
}

export async function createEncounter(
  input: CreateEncounterInput
) {
  // 1. Check hospital
  const hospital = await prisma.hospital.findFirst({
    where: {
      id: input.hospitalId,
      isActive: true,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  // 2. Check patient
  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      isActive: true,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  // 3. If appointment is provided, check it
  if (input.appointmentId) {
    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id: input.appointmentId,
          hospitalId: input.hospitalId,
          patientId: input.patientId,
          deletedAt: null,
        },
      });

    if (!appointment) {
      throw new Error("APPOINTMENT_NOT_FOUND");
    }

    const existingEncounterForAppointment =
      await prisma.encounter.findUnique({
        where: {
          appointmentId: input.appointmentId,
        },
      });

    if (existingEncounterForAppointment) {
      throw new Error(
        "ENCOUNTER_ALREADY_EXISTS_FOR_APPOINTMENT"
      );
    }
  }

  if (input.emergencyCaseId) {
    const existingEncounterForEmergencyCase =
      await prisma.encounter.findUnique({
        where: {
          emergencyCaseId: input.emergencyCaseId,
        },
      });

    if (existingEncounterForEmergencyCase) {
      throw new Error(
        "ENCOUNTER_ALREADY_EXISTS_FOR_EMERGENCY_CASE"
      );
    }
  }

  // 4. Check DoctorHospital if provided
  if (input.doctorHospitalId) {
    const doctorHospital =
      await prisma.doctorHospital.findFirst({
        where: {
          id: input.doctorHospitalId,
          hospitalId: input.hospitalId,
          isActive: true,
        },
      });

    if (!doctorHospital) {
      throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
  }

  // 5. Check DoctorDepartmentAssignment if provided
  if (input.doctorDepartmentAssignmentId) {
    const assignment =
      await prisma.doctorDepartmentAssignment.findFirst({
        where: {
          id: input.doctorDepartmentAssignmentId,
          isActive: true,
          ...(input.doctorHospitalId
            ? {
                doctorHospitalId:
                  input.doctorHospitalId,
              }
            : {}),
        },
      });

    if (!assignment) {
      throw new Error("DOCTOR_ASSIGNMENT_NOT_FOUND");
    }
  }

  // 6. Check duplicate encounter number
  const existing = await prisma.encounter.findFirst({
    where: {
      hospitalId: input.hospitalId,
      encounterNumber: input.encounterNumber.trim(),
    },
  });

  if (existing) {
    throw new Error("ENCOUNTER_NUMBER_EXISTS");
  }

  // 7. Create encounter
  return prisma.encounter.create({
    data: {
      hospitalId: input.hospitalId,
      patientId: input.patientId,

      appointmentId: input.appointmentId,
      emergencyCaseId: input.emergencyCaseId,

      doctorHospitalId: input.doctorHospitalId,
      doctorDepartmentAssignmentId:
        input.doctorDepartmentAssignmentId,

      encounterNumber:
        input.encounterNumber.trim(),

      consultationType: input.consultationType,

      chiefComplaint:
        input.chiefComplaint?.trim(),

      remarks: input.remarks?.trim(),

      startedAt: input.startedAt
        ? new Date(input.startedAt)
        : undefined,

      followUpRequired:
        input.followUpRequired ?? false,

      followUpAfterDays:
        input.followUpAfterDays,
    },
  });
}

export async function getEncounters() {
  return prisma.encounter.findMany({
    include: {
      patient: true,
      hospital: true,

      appointment: true,

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
      startedAt: "desc",
    },
  });
}

export async function getEncounterById(
  id: string
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id,
    },

    include: {
      patient: true,
      hospital: true,

      appointment: true,

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

      vitals: true,
      diagnoses: true,
      clinicalNotes: true,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  return encounter;
}

export async function updateEncounter(
  id: string,
  input: UpdateEncounterInput
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  return prisma.encounter.update({
    where: {
      id,
    },

    data: {
      status: input.status,

      chiefComplaint:
        input.chiefComplaint?.trim(),

      remarks: input.remarks?.trim(),

      endedAt: input.endedAt
        ? new Date(input.endedAt)
        : undefined,

      followUpRequired:
        input.followUpRequired,

      followUpAfterDays:
        input.followUpAfterDays,
    },
  });
}

export async function deleteEncounter(
  id: string
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  return prisma.encounter.update({
    where: {
      id,
    },

    data: {
      status: "CANCELLED",
      endedAt: new Date(),
    },
  });
}