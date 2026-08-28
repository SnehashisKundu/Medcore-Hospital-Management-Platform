-- CreateTable
CREATE TABLE "PatientVaccination" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "batchNumber" TEXT,
    "administeredDate" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientVaccination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientVaccination_patientId_idx" ON "PatientVaccination"("patientId");

-- CreateIndex
CREATE INDEX "PatientVaccination_vaccineName_idx" ON "PatientVaccination"("vaccineName");

-- CreateIndex
CREATE INDEX "PatientVaccination_administeredDate_idx" ON "PatientVaccination"("administeredDate");

-- CreateIndex
CREATE INDEX "PatientVaccination_nextDueDate_idx" ON "PatientVaccination"("nextDueDate");

-- AddForeignKey
ALTER TABLE "PatientVaccination" ADD CONSTRAINT "PatientVaccination_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
