-- MPD - AK Rapid Trans
-- MySQL 8+
-- Script derived from the current Laravel migrations and models.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT UNSIGNED NULL,
    `role` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`),
    KEY `users_role_id_index` (`role_id`),
    KEY `users_role_index` (`role`),
    CONSTRAINT `users_role_id_foreign`
        FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clients` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(255) NOT NULL,
    `adresse` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `clients_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `camions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `matricule` VARCHAR(255) NOT NULL,
    `marque` VARCHAR(255) NOT NULL,
    `capacite` INT NOT NULL,
    `statut` VARCHAR(255) NOT NULL DEFAULT 'disponible',
    `localisation` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `camions_matricule_unique` (`matricule`),
    KEY `camions_statut_index` (`statut`),
    KEY `camions_localisation_index` (`localisation`),
    CONSTRAINT `chk_camions_capacite_positive`
        CHECK (`capacite` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commandes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `client_id` BIGINT UNSIGNED NOT NULL,
    `camion_id` BIGINT UNSIGNED NULL,
    `lieu_depart` VARCHAR(255) NOT NULL,
    `lieu_arrivee` VARCHAR(255) NOT NULL,
    `date_transport` DATE NOT NULL,
    `prix` DECIMAL(10,2) NULL,
    `statut` ENUM('en_attente','validee','en_cours','livree','annulee') NOT NULL DEFAULT 'en_attente',
    `verified` TINYINT(1) NOT NULL DEFAULT 0,
    `facture_number` VARCHAR(255) NULL,
    `facture_path` VARCHAR(255) NULL,
    `facture_generated_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `commandes_facture_number_unique` (`facture_number`),
    KEY `commandes_user_id_index` (`user_id`),
    KEY `commandes_client_id_index` (`client_id`),
    KEY `commandes_camion_id_index` (`camion_id`),
    KEY `commandes_statut_index` (`statut`),
    KEY `commandes_verified_index` (`verified`),
    CONSTRAINT `commandes_user_id_foreign`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `commandes_client_id_foreign`
        FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `commandes_camion_id_foreign`
        FOREIGN KEY (`camion_id`) REFERENCES `camions` (`id`)
        ON DELETE SET NULL,
    CONSTRAINT `chk_commandes_prix_positive`
        CHECK (`prix` IS NULL OR `prix` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `commande_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `notifications_user_id_created_at_index` (`user_id`, `created_at`),
    KEY `notifications_is_read_index` (`is_read`),
    KEY `notifications_commande_id_index` (`commande_id`),
    CONSTRAINT `notifications_user_id_foreign`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `notifications_commande_id_foreign`
        FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `commande_id` BIGINT UNSIGNED NULL,
    `client_name` VARCHAR(255) NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(255) NOT NULL DEFAULT 'new_order',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `admin_notifs_commande_type_unique` (`commande_id`, `type`),
    KEY `admin_notifications_is_read_index` (`is_read`),
    KEY `admin_notifications_created_at_index` (`created_at`),
    CONSTRAINT `admin_notifications_commande_id_foreign`
        FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commande_status_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `commande_id` BIGINT UNSIGNED NOT NULL,
    `old_status` VARCHAR(255) NULL,
    `new_status` VARCHAR(255) NOT NULL,
    `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `commande_status_logs_commande_id_index` (`commande_id`),
    KEY `commande_status_logs_changed_at_index` (`changed_at`),
    CONSTRAINT `commande_status_logs_commande_id_foreign`
        FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `contacts_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
