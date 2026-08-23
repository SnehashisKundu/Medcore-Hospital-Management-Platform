import { prisma } from "../../config/prisma";

interface CreateHospitalProcedureInput {
  hospitalId: string;
  procedureId: string;
  basePrice: number;
  estimatedDurationMinutes?: number;
  isAvailable?: boolean;
}

interface UpdateHospitalProcedureInput {
  basePrice?: number;
  estimatedDurationMinutes?: number;
  isAvailable?: boolean;
}

type SortOption = "price" | "distance";

function calculateDistanceKm(
  userLatitude: number,
  userLongitude: number,
  hospitalLatitude: number,
  hospitalLongitude: number
) {
  const earthRadiusKm = 6371;

  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const latitudeDifference = toRadians(
    hospitalLatitude - userLatitude
  );

  const longitudeDifference = toRadians(
    hospitalLongitude - userLongitude
  );

  const a =
    Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
    Math.cos(toRadians(userLatitude)) *
      Math.cos(toRadians(hospitalLatitude)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number(
    (earthRadiusKm * c).toFixed(2)
  );
}

export async function createHospitalProcedure(
  input: CreateHospitalProcedureInput
) {
  const hospital =
    await prisma.hospital.findFirst({
      where: {
        id: input.hospitalId,
        isActive: true,
        deletedAt: null,
      },
    });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const procedure =
    await prisma.procedure.findFirst({
      where: {
        id: input.procedureId,
        isActive: true,
      },
    });

  if (!procedure) {
    throw new Error("PROCEDURE_NOT_FOUND");
  }

  const existingHospitalProcedure =
    await prisma.hospitalProcedure.findUnique({
      where: {
        hospitalId_procedureId: {
          hospitalId: input.hospitalId,
          procedureId: input.procedureId,
        },
      },
    });

  if (existingHospitalProcedure) {
    throw new Error(
      "HOSPITAL_PROCEDURE_ALREADY_EXISTS"
    );
  }

  if (input.basePrice < 0) {
    throw new Error("INVALID_BASE_PRICE");
  }

  if (
    input.estimatedDurationMinutes !== undefined &&
    input.estimatedDurationMinutes < 0
  ) {
    throw new Error("INVALID_DURATION");
  }

  return prisma.hospitalProcedure.create({
    data: {
      hospitalId: input.hospitalId,
      procedureId: input.procedureId,
      basePrice: input.basePrice,
      estimatedDurationMinutes:
        input.estimatedDurationMinutes,
      isAvailable:
        input.isAvailable ?? true,
      isActive: true,
    },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      procedure: {
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
        },
      },
    },
  });
}

export async function getHospitalProcedures(
  hospitalId?: string,
  procedureId?: string,
  userLatitude?: number,
  userLongitude?: number,
  sort?: SortOption
) {
  const hospitalProcedures =
    await prisma.hospitalProcedure.findMany({
      where: {
        ...(hospitalId ? { hospitalId } : {}),
        ...(procedureId ? { procedureId } : {}),
        isActive: true,
        isAvailable: true,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            code: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
            latitude: true,
            longitude: true,
          },
        },
        procedure: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            description: true,
          },
        },
      },
    });

  const hasUserLocation =
    userLatitude !== undefined &&
    userLongitude !== undefined;

  const data = hospitalProcedures.map(
    (hospitalProcedure) => {
      const hospitalLatitude =
        hospitalProcedure.hospital.latitude;

      const hospitalLongitude =
        hospitalProcedure.hospital.longitude;

      let distanceKm: number | null = null;

      if (
        hasUserLocation &&
        hospitalLatitude !== null &&
        hospitalLongitude !== null
      ) {
        distanceKm = calculateDistanceKm(
          userLatitude,
          userLongitude,
          Number(hospitalLatitude),
          Number(hospitalLongitude)
        );
      }

      return {
        ...hospitalProcedure,
        distanceKm,
      };
    }
  );

  if (sort === "price") {
    data.sort(
      (a, b) =>
        Number(a.basePrice) - Number(b.basePrice)
    );
  }

  if (sort === "distance") {
    data.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      return a.distanceKm - b.distanceKm;
    });
  }

  if (!sort) {
    data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  return data;
}

export async function getHospitalProcedureById(
  id: string
) {
  const hospitalProcedure =
    await prisma.hospitalProcedure.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            code: true,
            addressLine1: true,
            city: true,
            state: true,
            country: true,
            latitude: true,
            longitude: true,
          },
        },
        procedure: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            description: true,
          },
        },
      },
    });

  if (!hospitalProcedure) {
    throw new Error("HOSPITAL_PROCEDURE_NOT_FOUND");
  }

  return hospitalProcedure;
}

export async function updateHospitalProcedure(
  id: string,
  input: UpdateHospitalProcedureInput
) {
  const hospitalProcedure =
    await prisma.hospitalProcedure.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

  if (!hospitalProcedure) {
    throw new Error("HOSPITAL_PROCEDURE_NOT_FOUND");
  }

  if (
    input.basePrice !== undefined &&
    input.basePrice < 0
  ) {
    throw new Error("INVALID_BASE_PRICE");
  }

  if (
    input.estimatedDurationMinutes !== undefined &&
    input.estimatedDurationMinutes < 0
  ) {
    throw new Error("INVALID_DURATION");
  }

  return prisma.hospitalProcedure.update({
    where: {
      id,
    },
    data: {
      basePrice: input.basePrice,
      estimatedDurationMinutes:
        input.estimatedDurationMinutes,
      isAvailable: input.isAvailable,
    },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      procedure: {
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
        },
      },
    },
  });
}

export async function deleteHospitalProcedure(
  id: string
) {
  const hospitalProcedure =
    await prisma.hospitalProcedure.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

  if (!hospitalProcedure) {
    throw new Error("HOSPITAL_PROCEDURE_NOT_FOUND");
  }

  return prisma.hospitalProcedure.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      procedure: {
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
        },
      },
    },
  });
}