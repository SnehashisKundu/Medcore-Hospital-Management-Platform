/*
  Warnings:

  - Added the required column `floor` to the `Ward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ward" ADD COLUMN     "floor" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Ward_floor_idx" ON "Ward"("floor");
