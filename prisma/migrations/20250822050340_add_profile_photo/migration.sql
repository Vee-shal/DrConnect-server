/*
  Warnings:

  - You are about to drop the column `appointmentDate` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentTime` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Appointment` DROP COLUMN `appointmentDate`,
    DROP COLUMN `appointmentTime`,
    ADD COLUMN `meetingLink` VARCHAR(191) NULL,
    ADD COLUMN `scheduledAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `DoctorProfile` ADD COLUMN `certificate` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `profilePhoto` VARCHAR(191) NULL;
