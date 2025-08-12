-- AlterTable
ALTER TABLE `Appointment` ADD COLUMN `mode` ENUM('OFFLINE', 'ONLINE') NULL,
    MODIFY `appointmentDate` DATETIME(3) NULL;
