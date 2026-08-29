"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../../config/prisma");
const auth_service_1 = require("./auth.service");
async function test() {
    const result = await (0, auth_service_1.loginUser)({
        email: process.env.BOOTSTRAP_ADMIN_EMAIL,
        password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
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
    await prisma_1.prisma.$disconnect();
});
