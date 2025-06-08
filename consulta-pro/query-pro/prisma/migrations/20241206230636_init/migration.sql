-- CreateTable
CREATE TABLE `Consulta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `form_data` JSON NULL,
    `status` ENUM('Pending', 'Finished', 'Error', 'Processing') NOT NULL DEFAULT 'Pending',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consulta_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `document_name` VARCHAR(100) NOT NULL,
    `integration_url` VARCHAR(250) NOT NULL,
    `sent_data` JSON NULL,
    `response_data` JSON NULL,
    `status` ENUM('Pending', 'Finished', 'Error', 'Processing') NOT NULL DEFAULT 'Pending',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_consulta_id_fkey` FOREIGN KEY (`consulta_id`) REFERENCES `Consulta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
