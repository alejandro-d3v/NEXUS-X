/*
  Warnings:

  - You are about to drop the column `level` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Grade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "level",
DROP COLUMN "subject";
