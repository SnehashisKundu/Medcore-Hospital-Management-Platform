import "dotenv/config";
import { prisma } from "../src/config/prisma";

async function main() {
  console.log("🚀 Setting up test data for doctor-department assignment...\n");

  // 1. Create or fetch hospital
  let hospital = await prisma.hospital.findFirst({
    where: { isActive: true },
  });

  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: "Central Hospital",
        code: "CH001",
        isActive: true,
      },
    });
    console.log("✅ Created hospital:", hospital.id, hospital.name);
  } else {
    console.log("✅ Using existing hospital:", hospital.id, hospital.name);
  }

  // 2. Create or fetch specialization
  let specialization = await prisma.specialization.findFirst({
    where: { isActive: true },
  });

  if (!specialization) {
    specialization = await prisma.specialization.create({
      data: {
        name: "Cardiology",
        code: "CARD001",
        isActive: true,
      },
    });
    console.log("✅ Created specialization:", specialization.id, specialization.name);
  } else {
    console.log("✅ Using existing specialization:", specialization.id, specialization.name);
  }

  // 3. Create or fetch department in the hospital
  let department = await prisma.department.findFirst({
    where: {
      hospitalId: hospital.id,
      isActive: true,
    },
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: "Cardiology Department",
        code: "CARD_DEPT",
        hospitalId: hospital.id,
        isActive: true,
      },
    });
    console.log("✅ Created department:", department.id, department.name);
  } else {
    console.log("✅ Using existing department:", department.id, department.name);
  }

  // 4. Create or fetch a user for the doctor
  let user = await prisma.user.findFirst({
    where: {
      email: "doctor@hospital.com",
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "doctor@hospital.com",
        firstName: "Dr.",
        lastName: "Smith",
        passwordHash: "placeholder", // This would normally be hashed
        isActive: true,
      },
    });
    console.log("✅ Created user:", user.id, user.email);
  } else {
    console.log("✅ Using existing user:", user.id, user.email);
  }

  // 5. Create or fetch doctor
  let doctor = await prisma.doctor.findFirst({
    where: { userId: user.id },
  });

  if (!doctor) {
    doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        medicalRegistrationNumber: "REG001",
        isActive: true,
      },
    });
    console.log("✅ Created doctor:", doctor.id);
  } else {
    console.log("✅ Using existing doctor:", doctor.id);
  }

  // 6. Create or fetch doctor-hospital link
  let doctorHospital = await prisma.doctorHospital.findFirst({
    where: {
      doctorId: doctor.id,
      hospitalId: hospital.id,
    },
  });

  if (!doctorHospital) {
    doctorHospital = await prisma.doctorHospital.create({
      data: {
        doctorId: doctor.id,
        hospitalId: hospital.id,
        joinedAt: new Date(),
        isActive: true,
      },
    });
    console.log("✅ Created doctor-hospital link:", doctorHospital.id);
  } else {
    console.log("✅ Using existing doctor-hospital link:", doctorHospital.id);
  }

  // 7. Create or fetch doctor-department assignment
  let assignment = await prisma.doctorDepartmentAssignment.findFirst({
    where: {
      doctorHospitalId: doctorHospital.id,
      departmentId: department.id,
      specializationId: specialization.id,
      isActive: true,
    },
  });

  if (!assignment) {
    assignment = await prisma.doctorDepartmentAssignment.create({
      data: {
        doctorHospitalId: doctorHospital.id,
        departmentId: department.id,
        specializationId: specialization.id,
        isPrimary: true,
        isActive: true,
      },
    });
    console.log("✅ Created assignment:", assignment.id);
  } else {
    console.log("✅ Using existing assignment:", assignment.id);
  }

  console.log("\n📋 Test Data Summary:");
  console.log("=====================");
  console.log("Hospital ID:", hospital.id);
  console.log("Doctor ID:", doctor.id);
  console.log("Doctor Hospital ID:", doctorHospital.id);
  console.log("Department ID:", department.id);
  console.log("Specialization ID:", specialization.id);
  console.log("Assignment ID:", assignment.id);

  console.log("\n📝 Use this doctorHospitalId in your POST request:");
  console.log(`"doctorHospitalId": "${doctorHospital.id}"`);
  console.log(`"departmentId": "${department.id}"`);
  console.log(`"specializationId": "${specialization.id}"`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Script error:", err);
  process.exit(1);
});
