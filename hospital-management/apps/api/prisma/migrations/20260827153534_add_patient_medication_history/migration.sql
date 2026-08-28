-- CreateTable
CREATE TABLE "PatientMedicationHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedicationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientMedicationHistory_patientId_idx" ON "PatientMedicationHistory"("patientId");

-- CreateIndex
CREATE INDEX "PatientMedicationHistory_medicineName_idx" ON "PatientMedicationHistory"("medicineName");

-- CreateIndex
CREATE INDEX "PatientMedicationHistory_isCurrent_idx" ON "PatientMedicationHistory"("isCurrent");

-- AddForeignKey
ALTER TABLE "PatientMedicationHistory" ADD CONSTRAINT "PatientMedicationHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
