CREATE DATABASE cwfm;

USE cwfm

START TRANSACTION;

CREATE TABLE `folders` (
    `id` bigint(255) NOT NULL,
    `folder_name` text COLLATE utf8_unicode_ci NOT NULL,
    `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE `folders` ADD PRIMARY KEY(`id`);
ALTER TABLE `folders` MODIFY `id` bigint(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

CREATE TABLE `files` (
    `id` bigint(255) NOT NULL,
    `folder_id` bigint(255) NOT NULL,
    `file_name_original` text COLLATE utf8_unicode_ci NOT NULL,
    `file_name_saved` text COLLATE utf8_unicode_ci NOT NULL,
    `file_path` text COLLATE utf8_unicode_ci NOT NULL,
    `file_type` text COLLATE utf8_unicode_ci NOT NULL,
    `file_size` text COLLATE utf8_unicode_ci NOT NULL,
    `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE `files` ADD PRIMARY KEY(`id`);
ALTER TABLE `files` MODIFY `id` bigint(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

COMMIT;