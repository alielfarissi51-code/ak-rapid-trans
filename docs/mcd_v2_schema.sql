-- MCD v2 -> Schéma SQL (MySQL 8+)
-- Encodage recommandé: utf8mb4

CREATE TABLE utilisateur (
    id_utilisateur BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    langue VARCHAR(10) NOT NULL DEFAULT 'fr',
    cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE client (
    id_client BIGINT UNSIGNED PRIMARY KEY,
    telephone VARCHAR(30) NULL,
    adresse VARCHAR(255) NULL,
    CONSTRAINT fk_client_utilisateur
        FOREIGN KEY (id_client)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE camion (
    id_camion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    immatriculation VARCHAR(30) NOT NULL UNIQUE,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    capacite DECIMAL(10,2) NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE commande (
    id_commande BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date_commande DATE NOT NULL,
    depart VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'en_attente',
    description TEXT NULL,
    id_client BIGINT UNSIGNED NOT NULL,
    id_camion BIGINT UNSIGNED NULL,
    CONSTRAINT fk_commande_client
        FOREIGN KEY (id_client)
        REFERENCES client(id_client)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_commande_camion
        FOREIGN KEY (id_camion)
        REFERENCES camion(id_camion)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_commande_client (id_client),
    INDEX idx_commande_camion (id_camion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE devis (
    id_devis BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    montant DECIMAL(12,2) NOT NULL,
    date_emission DATE NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'brouillon',
    id_commande BIGINT UNSIGNED NOT NULL UNIQUE,
    CONSTRAINT fk_devis_commande
        FOREIGN KEY (id_commande)
        REFERENCES commande(id_commande)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE service (
    id_service BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT NULL,
    tarif_base DECIMAL(12,2) NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE commande_service (
    id_commande BIGINT UNSIGNED NOT NULL,
    id_service BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id_commande, id_service),
    CONSTRAINT fk_cmdsrv_commande
        FOREIGN KEY (id_commande)
        REFERENCES commande(id_commande)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_cmdsrv_service
        FOREIGN KEY (id_service)
        REFERENCES service(id_service)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE message_contact (
    id_message BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date_envoi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
