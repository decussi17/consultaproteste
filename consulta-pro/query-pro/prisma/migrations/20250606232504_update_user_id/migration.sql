/*
  Warnings:

  - Made the column `user_id` on table `Consulta` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Consulta` DROP FOREIGN KEY `Consulta_user_id_fkey`;

-- AlterTable
ALTER TABLE `Consulta` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Documento` ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `document_name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
