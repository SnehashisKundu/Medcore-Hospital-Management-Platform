-- Add hospital verification fields expected by the Prisma schema.
ALTER TABLE "Hospital"
  ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "verifiedById" TEXT;

CREATE INDEX "Hospital_isVerified_idx" ON "Hospital"("isVerified");

ALTER TABLE "Hospital"
  ADD CONSTRAINT "Hospital_verifiedById_fkey"
  FOREIGN KEY ("verifiedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
