import "dotenv/config";

import { prisma } from "../../config/prisma";
import { hashPassword } from "./auth.utils";

async function createRadiologist() {
  const email = "radiologist@hospital.com";
  const password = "Radiologist@123";

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("⚠️ Radiologist already exists");
    console.log("User ID:", existingUser.id);
    return;
  }

  const role = await prisma.role.findUnique({
    where: {
      name: "RADIOLOGIST",
    },
  });

  if (!role) {
    throw new Error(
      "RADIOLOGIST role not found. Run seed first."
    );
  }

  const hospital = await prisma.hospital.findFirst();

  if (!hospital) {
    throw new Error(
      "No hospital found. Create hospital first."
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: "Radiology",
        lastName: "Doctor",
        isActive: true,
      },
    });

    await tx.userRole.create({
      data: {
        userId: createdUser.id,
        roleId: role.id,
        hospitalId: hospital.id,
      },
    });

    return createdUser;
  });

  console.log("✅ Radiologist created successfully");
  console.log("User ID:", user.id);
  console.log("Email:", user.email);
  console.log("Hospital ID:", hospital.id);
}

createRadiologist()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });