import { prisma } from "../../config/prisma";

interface CreateDoctorHospitalInput {
  doctorId: string;
  hospitalId: string;
  joinedAt?: string;
}

interface UpdateDoctorHospitalInput {
  joinedAt?: string;
}

export async function createDoctorHospital(
  input: CreateDoctorHospitalInput
) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id: input.doctorId,
      isActive: true,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const hospital = await prisma.hospital.findFirst({
    where: {
      id: input.hospitalId,
      isActive: true,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const existing = await prisma.doctorHospital.findUnique({
    where: {
      doctorId_hospitalId: {
        doctorId: input.doctorId,
        hospitalId: input.hospitalId,
      },
    },
  });

  if (existing) {
    throw new Error("DOCTOR_HOSPITAL_EXISTS");
  }

  return prisma.doctorHospital.create({
    data: {
      doctorId: input.doctorId,
      hospitalId: input.hospitalId,
      joinedAt: input.joinedAt
        ? new Date(input.joinedAt)
        : new Date(),
    },
  });
}

export async function getDoctorHospitals() {
  return prisma.doctorHospital.findMany({
    where: {
      isActive: true,
    },
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
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDoctorHospitalById(id: string) {
  const doctorHospital =
    await prisma.doctorHospital.findFirst({
      where: {
        id,
        isActive: true,
      },
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
        hospital: true,
      },
    });

  if (!doctorHospital) {
    throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
  }

  return doctorHospital;
}

export async function updateDoctorHospital(
  id: string,
  input: UpdateDoctorHospitalInput
) {
  const doctorHospital =
    await prisma.doctorHospital.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

  if (!doctorHospital) {
    throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
  }

  return prisma.doctorHospital.update({
    where: {
      id,
    },
    data: {
      joinedAt: input.joinedAt
        ? new Date(input.joinedAt)
        : undefined,
    },
  });
}

export async function deleteDoctorHospital(id: string) {
  const doctorHospital =
    await prisma.doctorHospital.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

  if (!doctorHospital) {
    throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
  }

  return prisma.doctorHospital.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}