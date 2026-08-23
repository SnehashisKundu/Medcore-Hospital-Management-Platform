import "dotenv/config";

import { prisma } from "../../config/prisma";
import { loginUser } from "./auth.service";

async function test() {
  const result = await loginUser({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL!,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD!,
  });

  console.log("✅ Login successful");
  console.log("User:", result.user);
  console.log("Token generated:", !!result.accessToken);
}

test()
  .catch((error) => {
    console.error("❌ Login failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });