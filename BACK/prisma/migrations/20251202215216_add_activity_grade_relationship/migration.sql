/*
  Warnings:

  - You are about to drop the column `grade` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "grade";

-- CreateTable
CREATE TABLE "ActivityGrade" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityGrade_activityId_idx" ON "ActivityGrade"("activityId");

-- CreateIndex
CREATE INDEX "ActivityGrade_gradeId_idx" ON "ActivityGrade"("gradeId");

-- CreateIndex
CREATE INDEX "ActivityGrade_assignedBy_idx" ON "ActivityGrade"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityGrade_activityId_gradeId_key" ON "ActivityGrade"("activityId", "gradeId");

-- AddForeignKey
ALTER TABLE "ActivityGrade" ADD CONSTRAINT "ActivityGrade_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityGrade" ADD CONSTRAINT "ActivityGrade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityGrade" ADD CONSTRAINT "ActivityGrade_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
