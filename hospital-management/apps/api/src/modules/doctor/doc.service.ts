import { prisma } from "../../config/prisma";
import fs from "fs";
import path from "path";

interface CreateDoctorInput {
  userId: string;
  medicalRegistrationNumber: string;
  qualification?: string;
  bio?: string;
  priorExperienceYears?: number;
}

export async function createDoctor(input: CreateDoctorInput) {
  const medicalRegistrationNumber =
    input.medicalRegistrationNumber.trim().toUpperCase();

  // Check user exists
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Check user already has doctor profile
  const existingDoctor = await prisma.doctor.findUnique({
    where: {
      userId: input.userId,
    },
  });

  if (existingDoctor) {
    throw new Error("DOCTOR_PROFILE_EXISTS");
  }

  // Check registration number
  const existingRegistration =
    await prisma.doctor.findUnique({
      where: {
        medicalRegistrationNumber,
      },
    });

  if (existingRegistration) {
    throw new Error("MEDICAL_REGISTRATION_EXISTS");
  }

  return prisma.doctor.create({
    data: {
      userId: input.userId,
      medicalRegistrationNumber,
      qualification: input.qualification?.trim(),
      bio: input.bio?.trim(),
      priorExperienceYears: input.priorExperienceYears ?? 0,
    },
  });
}

export async function getDoctors() {
  return prisma.doctor.findMany({
    where: {
      isActive: true,
    },
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isActive: true,
    },
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
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  return doctor;
}

interface UpdateDoctorInput {
  medicalRegistrationNumber?: string;
  qualification?: string;
  bio?: string;
  priorExperienceYears?: number;
}

export async function updateDoctor(
  id: string,
  input: UpdateDoctorInput
) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  if (input.medicalRegistrationNumber) {
    const medicalRegistrationNumber =
      input.medicalRegistrationNumber.trim().toUpperCase();

    const existing = await prisma.doctor.findFirst({
      where: {
        medicalRegistrationNumber,
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      throw new Error("MEDICAL_REGISTRATION_EXISTS");
    }

    input.medicalRegistrationNumber =
      medicalRegistrationNumber;
  }

  return prisma.doctor.update({
    where: {
      id,
    },
    data: {
      medicalRegistrationNumber:
        input.medicalRegistrationNumber,
      qualification: input.qualification?.trim(),
      bio: input.bio?.trim(),
      priorExperienceYears:
        input.priorExperienceYears,
    },
  });
}

export async function deleteDoctor(id: string) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  return prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}

export async function uploadDoctorSignature(
  doctorId: string,
  signatureUrl: string
) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id: doctorId,
      deletedAt: null,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const previousSignatureUrl =
    doctor.signatureUrl;

  const updatedDoctor =
    await prisma.doctor.update({
      where: {
        id: doctorId,
      },
      data: {
        signatureUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  if (
    previousSignatureUrl &&
    previousSignatureUrl !== signatureUrl
  ) {
    try {
      const previousFilePath = path.join(
        process.cwd(),
        previousSignatureUrl.replace(/^\//, "")
      );

      if (fs.existsSync(previousFilePath)) {
        fs.unlinkSync(previousFilePath);
      }
    } catch (error) {
      console.error(
        "Failed to delete previous doctor signature:",
        error
      );
    }
  }

  return updatedDoctor;
}

export async function removeDoctorSignature(
  doctorId: string
) {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id: doctorId,
      deletedAt: null,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  if (!doctor.signatureUrl) {
    throw new Error("SIGNATURE_NOT_FOUND");
  }

  const signatureUrl =
    doctor.signatureUrl;

  const updatedDoctor =
    await prisma.doctor.update({
      where: {
        id: doctorId,
      },
      data: {
        signatureUrl: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  try {
    const filePath = path.join(
      process.cwd(),
      signatureUrl.replace(/^\//, "")
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Failed to delete doctor signature file:",
      error
    );
  }

  return updatedDoctor;
}