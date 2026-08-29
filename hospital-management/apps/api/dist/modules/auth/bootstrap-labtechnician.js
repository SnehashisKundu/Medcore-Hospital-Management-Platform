"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../../config/prisma");
const auth_utils_1 = require("./auth.utils");
async function createLabTechnician() {
    const email = "labtech@hospital.com";
    const password = "LabTech@123";
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        console.log("⚠️ Lab Technician already exists");
        console.log("User ID:", existingUser.id);
        return;
    }
    const role = await prisma_1.prisma.role.findUnique({
        where: {
            name: "LAB_TECHNICIAN",
        },
    });
    if (!role) {
        throw new Error("LAB_TECHNICIAN role not found. Run seed first.");
    }
    const hospital = await prisma_1.prisma.hospital.findFirst();
    if (!hospital) {
        throw new Error("No hospital found. Create hospital first.");
    }
    const passwordHash = await (0, auth_utils_1.hashPassword)(password);
    const user = await prisma_1.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
            data: {
                email,
                passwordHash,
                firstName: "Lab",
                lastName: "Technician",
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
    console.log("✅ Lab Technician created successfully");
    console.log("User ID:", user.id);
    console.log("Email:", user.email);
    console.log("Hospital ID:", hospital.id);
}
createLabTechnician()
    .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
