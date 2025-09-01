-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_userId_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorProfile` DROP FOREIGN KEY `DoctorProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropIndex
DROP INDEX `Chat_userId_fkey` ON `Chat`;

-- DropIndex
DROP INDEX `Message_chatId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- AddForeignKey
ALTER TABLE `DoctorProfile` ADD CONSTRAINT `DoctorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
