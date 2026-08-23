-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_hospitalId_fkey";

-- AlterTable
ALTER TABLE "UserRole" ALTER COLUMN "hospitalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
