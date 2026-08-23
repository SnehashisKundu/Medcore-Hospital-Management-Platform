import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { updateHospital } from "../src/modules/hospital/hs.service";

async function main() {
  await prisma.$connect();

  let hospital = await prisma.hospital.findFirst({ where: { deletedAt: null } });

  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: "Temp Hospital",
        code: "TMP001",
      },
    });
    console.log("Created hospital:", hospital.id);
  } else {
    console.log("Found hospital:", hospital.id, hospital.name, hospital.code);
  }

  const updated = await updateHospital(hospital.id, {
    name: hospital.name + " (updated at " + new Date().toISOString() + ")",
  });

  console.log("Update result:", JSON.stringify(updated, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
