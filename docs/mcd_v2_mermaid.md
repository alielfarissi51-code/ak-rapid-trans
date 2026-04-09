# MCD v2 - Rapid Trans

```mermaid
erDiagram
    UTILISATEUR {
        BIGINT id_utilisateur PK
        VARCHAR nom
        VARCHAR prenom
        VARCHAR email UK
        VARCHAR mot_de_passe
        VARCHAR role
        VARCHAR langue
        DATETIME cree_le
    }

    CLIENT {
        BIGINT id_client PK,FK
        VARCHAR telephone
        VARCHAR adresse
    }

    CAMION {
        BIGINT id_camion PK
        VARCHAR immatriculation UK
        VARCHAR marque
        VARCHAR modele
        DECIMAL capacite
        VARCHAR statut
    }

    COMMANDE {
        BIGINT id_commande PK
        DATE date_commande
        VARCHAR depart
        VARCHAR destination
        VARCHAR statut
        TEXT description
        BIGINT id_client FK
        BIGINT id_camion FK_NULL
    }

    DEVIS {
        BIGINT id_devis PK
        DECIMAL montant
        DATE date_emission
        VARCHAR statut
        BIGINT id_commande FK_UK
    }

    SERVICE {
        BIGINT id_service PK
        VARCHAR nom
        TEXT description
        DECIMAL tarif_base
        BOOLEAN actif
    }

    COMMANDE_SERVICE {
        BIGINT id_commande PK,FK
        BIGINT id_service PK,FK
    }

    MESSAGE_CONTACT {
        BIGINT id_message PK
        VARCHAR nom
        VARCHAR email
        VARCHAR sujet
        TEXT message
        DATETIME date_envoi
    }

    UTILISATEUR ||--o| CLIENT : "est un"
    CLIENT ||--o{ COMMANDE : "passe"
    CAMION ||--o{ COMMANDE : "affecte"
    COMMANDE ||--o| DEVIS : "genere"
    COMMANDE ||--|{ COMMANDE_SERVICE : "inclut"
    SERVICE ||--|{ COMMANDE_SERVICE : "est inclus"
```

## Règles métier

- Un UTILISATEUR peut être CLIENT (0 ou 1), et un CLIENT est exactement un UTILISATEUR.
- Un CLIENT peut passer 0 à N COMMANDES.
- Une COMMANDE peut être créée sans CAMION au départ (id_camion nullable), puis affectée plus tard.
- Une COMMANDE génère 0 ou 1 DEVIS principal.
- Une COMMANDE inclut 1 à N SERVICES via COMMANDE_SERVICE.
- MESSAGE_CONTACT reste indépendant (pas de FK obligatoire).
