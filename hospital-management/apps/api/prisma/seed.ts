import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const roles = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "RADIOLOGIST",
  "BILLING_STAFF",
];

const permissions = [
  "USER_MANAGE",
  "ROLE_MANAGE",

  "PATIENT_CREATE",
  "PATIENT_READ",
  "PATIENT_UPDATE",
  "PATIENT_DELETE",

  "HOSPITAL_CREATE",
  "HOSPITAL_READ",
  "HOSPITAL_UPDATE",
  "HOSPITAL_DELETE",

  "DEPARTMENT_CREATE",
  "DEPARTMENT_READ",
  "DEPARTMENT_UPDATE",
  "DEPARTMENT_DELETE",

  "WARD_CREATE",
  "WARD_READ",
  "WARD_UPDATE",
  "WARD_DELETE",

  "ROOM_CREATE",
  "ROOM_READ",
  "ROOM_UPDATE",
  "ROOM_DELETE",

  "BED_CREATE",
  "BED_READ",
  "BED_UPDATE",
  "BED_DELETE",

  "BED_ALLOCATION_CREATE",
  "BED_ALLOCATION_READ",
  "BED_ALLOCATION_UPDATE",

  "ADMISSION_CREATE",
  "ADMISSION_READ",
  "ADMISSION_UPDATE",
  "ADMISSION_DELETE",

  "SPECIALIZATION_CREATE",
  "SPECIALIZATION_READ",
  "SPECIALIZATION_UPDATE",
  "SPECIALIZATION_DELETE",

  "DOCTOR_CREATE",
  "DOCTOR_READ",
  "DOCTOR_UPDATE",
  "DOCTOR_DELETE",

  "DOCTOR_HOSPITAL_CREATE",
  "DOCTOR_HOSPITAL_READ",
  "DOCTOR_HOSPITAL_UPDATE",
  "DOCTOR_HOSPITAL_DELETE",

  "DOCTOR_DEPARTMENT_ASSIGNMENT_CREATE",
  "DOCTOR_DEPARTMENT_ASSIGNMENT_READ",
  "DOCTOR_DEPARTMENT_ASSIGNMENT_UPDATE",
  "DOCTOR_DEPARTMENT_ASSIGNMENT_DELETE",

  "DOCTOR_SCHEDULE_CREATE",
  "DOCTOR_SCHEDULE_READ",
  "DOCTOR_SCHEDULE_UPDATE",
  "DOCTOR_SCHEDULE_DELETE",

  "DOCTOR_LEAVE_CREATE",
  "DOCTOR_LEAVE_READ",
  "DOCTOR_LEAVE_UPDATE",

  "APPOINTMENT_CREATE",
  "APPOINTMENT_READ",
  "APPOINTMENT_UPDATE",
  "APPOINTMENT_DELETE",

  "ENCOUNTER_CREATE",
  "ENCOUNTER_READ",
  "ENCOUNTER_UPDATE",
  "ENCOUNTER_DELETE",

  "VITALS_CREATE",
  "VITALS_READ",
  "VITALS_UPDATE",

  "DIAGNOSIS_CREATE",
  "DIAGNOSIS_READ",
  "DIAGNOSIS_UPDATE",

  "PRESCRIPTION_CREATE",
  "PRESCRIPTION_READ",
  "PRESCRIPTION_UPDATE",

  "PHARMACY_DISPENSE",

  "DIAGNOSTIC_ORDER_CREATE",
  "DIAGNOSTIC_ORDER_READ",
  "DIAGNOSTIC_ORDER_UPDATE",
  "DIAGNOSTIC_RESULT_UPDATE",

  "PROCEDURE_ORDER_CREATE",
  "PROCEDURE_ORDER_READ",
  "PROCEDURE_ORDER_UPDATE",

  "PROCEDURE_STAFF_ASSIGNMENT_CREATE",
  "PROCEDURE_STAFF_ASSIGNMENT_READ",
  "PROCEDURE_STAFF_ASSIGNMENT_UPDATE",
  "PROCEDURE_STAFF_ASSIGNMENT_DELETE",

  "BILLING_CREATE",
  "BILLING_READ",
  "BILLING_UPDATE",
  "PAYMENT_CREATE",

  "ADMISSION_CREATE",
  "ADMISSION_READ",
  "ADMISSION_UPDATE",
  "CLINICAL_NOTE_CREATE",
  "CLINICAL_NOTE_READ",
  "CLINICAL_NOTE_UPDATE",
  "MEDICINE_CREATE",
  "MEDICINE_READ",
  "MEDICINE_UPDATE",
  "MEDICINE_STOCK_CREATE",
  "MEDICINE_STOCK_READ",
  "MEDICINE_STOCK_UPDATE",
  "LAB_RESULT_CREATE",
  "LAB_RESULT_READ",
  "LAB_RESULT_UPDATE",

  "IMAGING_RESULT_READ",
  "IMAGING_RESULT_UPDATE",
];

const rolePermissionMap: Record<string, string[]> = {
  SUPER_ADMIN: permissions,

  HOSPITAL_ADMIN: [
    "USER_MANAGE",
    "ROLE_MANAGE",

    "PATIENT_CREATE",
    "PATIENT_READ",
    "PATIENT_UPDATE",

    "APPOINTMENT_CREATE",
    "APPOINTMENT_READ",
    "APPOINTMENT_UPDATE",

    "ENCOUNTER_READ",
    "ENCOUNTER_DELETE",

    "PRESCRIPTION_READ",

    "BILLING_CREATE",
    "BILLING_READ",
    "BILLING_UPDATE",
    "PAYMENT_CREATE",

    "ADMISSION_CREATE",
    "ADMISSION_READ",
    "ADMISSION_UPDATE",
    "DEPARTMENT_CREATE",
    "DEPARTMENT_READ",
    "DEPARTMENT_UPDATE",
    "DEPARTMENT_DELETE",
    "LAB_RESULT_READ",
    "LAB_RESULT_UPDATE",
    "IMAGING_RESULT_READ",
    "IMAGING_RESULT_UPDATE",
    "WARD_CREATE",
    "WARD_READ",
    "WARD_UPDATE",
    "WARD_DELETE",

    "ROOM_CREATE",
    "ROOM_READ",
    "ROOM_UPDATE",
    "ROOM_DELETE",
  ],

  DOCTOR: [
    "PATIENT_READ",

    "APPOINTMENT_READ",

    "ENCOUNTER_CREATE",
    "ENCOUNTER_READ",
    "ENCOUNTER_UPDATE",

    "PRESCRIPTION_CREATE",
    "PRESCRIPTION_READ",

    "DIAGNOSTIC_ORDER_CREATE",
    "DIAGNOSTIC_ORDER_READ",
    "DIAGNOSTIC_ORDER_UPDATE",

    "ADMISSION_READ",
  ],

  NURSE: [
    "PATIENT_READ",
    "ENCOUNTER_READ",
    "ENCOUNTER_UPDATE",
    "ADMISSION_READ",
    "ADMISSION_UPDATE",
  ],

  RECEPTIONIST: [
    "PATIENT_CREATE",
    "PATIENT_READ",
    "PATIENT_UPDATE",

    "APPOINTMENT_CREATE",
    "APPOINTMENT_READ",
    "APPOINTMENT_UPDATE",

    "ADMISSION_CREATE",
    "ADMISSION_READ",

    "BILLING_READ",
  ],

  PHARMACIST: [
    "PATIENT_READ",
    "PRESCRIPTION_READ",
    "PHARMACY_DISPENSE",
    "BILLING_READ",
    "MEDICINE_CREATE",
    "MEDICINE_READ",
    "MEDICINE_UPDATE",
    "MEDICINE_STOCK_CREATE",
    "MEDICINE_STOCK_READ",
    "MEDICINE_STOCK_UPDATE",
  ],

  LAB_TECHNICIAN: [
    "PATIENT_READ",
    "ENCOUNTER_READ",
    "LAB_RESULT_READ",
    "LAB_RESULT_CREATE",
    "LAB_RESULT_UPDATE",
  ],

  RADIOLOGIST: [
    "PATIENT_READ",
    "ENCOUNTER_READ",
    "IMAGING_RESULT_READ",
    "IMAGING_RESULT_UPDATE",
  ],

  BILLING_STAFF: [
    "PATIENT_READ",
    "BILLING_CREATE",
    "BILLING_READ",
    "BILLING_UPDATE",
    "PAYMENT_CREATE",
  ],
};

async function main() {
  console.log("🌱 Starting database seed...");

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });
  }

  for (const permissionName of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permissionName,
      },
      update: {},
      create: {
        name: permissionName,
      },
    });
  }

  for (const [roleName, permissionNames] of Object.entries(
    rolePermissionMap
  )) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionName}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ Roles created");
  console.log("✅ Permissions created");
  console.log("✅ Role permissions assigned");
  console.log("🌱 Seed completed");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  