import "dotenv/config";
import { prisma } from "../../config/prisma";
import { hashPassword } from "./auth.utils";

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("⚠️ Bootstrap admin already exists");
    return;
  }

  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: "SUPER_ADMIN",
    },
  });

  if (!superAdminRole) {
    throw new Error(
      "SUPER_ADMIN role not found. Run RBAC seed first."
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.$transaction(async (tx) => {
    // 1. Create user
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: "System",
        lastName: "Admin",
        isActive: true,
      },
    });

    // 2. Assign platform-level SUPER_ADMIN
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,

        // Platform role → no hospital
        hospitalId: null,
      },
    });

    return user;
  });

  console.log("✅ SUPER_ADMIN created successfully");
  console.log(`📧 Email: ${admin.email}`);
}

bootstrapAdmin()
  .catch((error) => {
    console.error("❌ Bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });