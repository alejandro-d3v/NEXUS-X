-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "gradeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StudentGrade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StudentGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentGrade_studentId_idx" ON "StudentGrade"("studentId");

-- CreateIndex
CREATE INDEX "StudentGrade_gradeId_idx" ON "StudentGrade"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGrade_studentId_gradeId_key" ON "StudentGrade"("studentId", "gradeId");

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Migrate existing student-grade relationships
-- This creates StudentGrade entries for all existing students
INSERT INTO "StudentGrade" ("id", "studentId", "gradeId", "enrolledAt", "isActive")
SELECT
    gen_random_uuid(),
    sp."id" as "studentId",
    sp."gradeId" as "gradeId",
    sp."enrollmentDate" as "enrolledAt",
    true as "isActive"
FROM "StudentProfile" sp
WHERE sp."gradeId" IS NOT NULL;
