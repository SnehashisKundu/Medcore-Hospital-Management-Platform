import { prisma } from "../../config/prisma";

interface CreateHospitalInput {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  registrationNumber?: string;
  latitude?: number;
  longitude?: number;
}

export async function createHospital(input: CreateHospitalInput) {
  const existingHospital = await prisma.hospital.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existingHospital) {
    throw new Error("HOSPITAL_CODE_EXISTS");
  }

  return prisma.hospital.create({
    data: {
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),

      email: input.email?.trim().toLowerCase(),
      phone: input.phone?.trim(),

      addressLine1: input.addressLine1?.trim(),
      addressLine2: input.addressLine2?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      country: input.country?.trim() || "India",
      postalCode: input.postalCode?.trim(),

      registrationNumber: input.registrationNumber?.trim(),

      latitude: input.latitude,
      longitude: input.longitude,
    },
  });
}

export async function getHospitals() {
  return prisma.hospital.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getHospitalById(id: string) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  return hospital;
}

export async function updateHospital(
  id: string,
  input: Partial<CreateHospitalInput>
) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  if (input.code && input.code.trim().toUpperCase() !== hospital.code) {
    const existing = await prisma.hospital.findUnique({
      where: {
        code: input.code.trim().toUpperCase(),
      },
    });

    if (existing && existing.id !== id) {
      throw new Error("HOSPITAL_CODE_EXISTS");
    }
  }

  return prisma.hospital.update({
    where: { id },
    data: {
      name: input.name?.trim() ?? hospital.name,
      code: input.code?.trim().toUpperCase() ?? hospital.code,

      email: input.email?.trim().toLowerCase() ?? hospital.email,
      phone: input.phone?.trim() ?? hospital.phone,

      addressLine1: input.addressLine1?.trim() ?? hospital.addressLine1,
      addressLine2: input.addressLine2?.trim() ?? hospital.addressLine2,
      city: input.city?.trim() ?? hospital.city,
      state: input.state?.trim() ?? hospital.state,
      country: input.country?.trim() ?? hospital.country,
      postalCode: input.postalCode?.trim() ?? hospital.postalCode,

      registrationNumber:
        input.registrationNumber?.trim() ??
        hospital.registrationNumber,

      latitude: input.latitude ?? hospital.latitude,
      longitude: input.longitude ?? hospital.longitude,
    },
  });
}

export async function deleteHospital(id: string) {
  const hospital = await prisma.hospital.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  return prisma.hospital.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

function calculateDistanceKm(
  userLatitude: number,
  userLongitude: number,
  hospitalLatitude: number,
  hospitalLongitude: number
) {
  const earthRadiusKm = 6371;

  const dLat =
    ((hospitalLatitude - userLatitude) * Math.PI) / 180;

  const dLng =
    ((hospitalLongitude - userLongitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLatitude * Math.PI) / 180) *
      Math.cos((hospitalLatitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  availableOnly = false
) {
  const hospitals = await prisma.hospital.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      latitude: {
        not: null,
      },
      longitude: {
        not: null,
      },
    },
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
      wards: {
        where: {
          isActive: true,
        },
        select: {
          rooms: {
            where: {
              isActive: true,
            },
            select: {
              beds: {
                where: {
                  isActive: true,
                  status: "AVAILABLE",
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const nearbyHospitals = hospitals.map((hospital) => {
    const hospitalLatitude = Number(hospital.latitude);
    const hospitalLongitude = Number(hospital.longitude);

    const distanceKm = calculateDistanceKm(
      latitude,
      longitude,
      hospitalLatitude,
      hospitalLongitude
    );

    const availableBeds = hospital.wards.reduce(
      (wardTotal, ward) =>
        wardTotal +
        ward.rooms.reduce(
          (roomTotal, room) =>
            roomTotal + room.beds.length,
          0
        ),
      0
    );

    return {
      id: hospital.id,
      name: hospital.name,
      code: hospital.code,
      addressLine1: hospital.addressLine1,
      addressLine2: hospital.addressLine2,
      city: hospital.city,
      state: hospital.state,
      country: hospital.country,
      postalCode: hospital.postalCode,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      distanceKm: Number(distanceKm.toFixed(2)),
      availableBeds,
      hasAvailableBed: availableBeds > 0,
    };
  });

  const filteredHospitals = availableOnly
    ? nearbyHospitals.filter(
        (hospital) => hospital.hasAvailableBed
      )
    : nearbyHospitals;

  return filteredHospitals.sort(
    (a, b) => a.distanceKm - b.distanceKm
  );
}