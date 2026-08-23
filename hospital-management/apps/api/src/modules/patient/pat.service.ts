import { prisma } from "../../config/prisma";

interface CreatePatientInput {
  userId?: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  phone?: string;
  email?: string;
  bloodGroup?:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface UpdatePatientInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: CreatePatientInput["gender"];
  phone?: string;
  email?: string;
  bloodGroup?: CreatePatientInput["bloodGroup"];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export async function createPatient(input: CreatePatientInput) {
  if (input.userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const existingPatient = await prisma.patient.findUnique({
      where: {
        userId: input.userId,
      },
    });

    if (existingPatient) {
      throw new Error("PATIENT_PROFILE_EXISTS");
    }
  }

  return prisma.patient.create({
    data: {
      userId: input.userId,
      firstName: input.firstName.trim(),
      middleName: input.middleName?.trim(),
      lastName: input.lastName?.trim(),
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      phone: input.phone?.trim(),
      email: input.email?.trim().toLowerCase(),
      bloodGroup: input.bloodGroup,
      addressLine1: input.addressLine1?.trim(),
      addressLine2: input.addressLine2?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      country: input.country?.trim() || "India",
      postalCode: input.postalCode?.trim(),
    },
  });
}

export async function getPatients() {
  return prisma.patient.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return patient;
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patient.update({
    where: { id },
    data: {
      firstName: input.firstName?.trim(),
      middleName: input.middleName?.trim(),
      lastName: input.lastName?.trim(),
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      phone: input.phone?.trim(),
      email: input.email?.trim().toLowerCase(),
      bloodGroup: input.bloodGroup,
      addressLine1: input.addressLine1?.trim(),
      addressLine2: input.addressLine2?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      country: input.country?.trim(),
      postalCode: input.postalCode?.trim(),
    },
  });
}

export async function deletePatient(id: string) {
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patient.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}
