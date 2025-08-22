/*
  Warnings:

  - You are about to drop the column `certificate` on the `DoctorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DoctorProfile` DROP COLUMN `certificate`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `certificate` VARCHAR(191) NULL;
