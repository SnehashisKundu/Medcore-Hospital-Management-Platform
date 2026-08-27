-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "referenceType" TEXT;

-- CreateIndex
CREATE INDEX "Notification_referenceType_idx" ON "Notification"("referenceType");

-- CreateIndex
CREATE INDEX "Notification_referenceId_idx" ON "Notification"("referenceId");
