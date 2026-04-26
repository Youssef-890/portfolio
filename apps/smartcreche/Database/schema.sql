-- =============================================================
-- SmartCreche - Schéma de base de données SQLite
-- =============================================================
-- Ce script crée l'intégralité des tables nécessaires à
-- l'application SmartCreche. Il est idempotent (IF NOT EXISTS).
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- Table : Categories
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Categories (
    Id       INTEGER PRIMARY KEY AUTOINCREMENT,
    Nom      TEXT    NOT NULL UNIQUE,
    AgeMin   INTEGER NOT NULL,
    AgeMax   INTEGER NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Table : Parents
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Parents (
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    Nom       TEXT    NOT NULL,
    Prenom    TEXT    NOT NULL,
    Telephone TEXT,
    Email     TEXT,
    Adresse   TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Table : Enfants
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Enfants (
    Id            INTEGER PRIMARY KEY AUTOINCREMENT,
    Nom           TEXT    NOT NULL,
    Prenom        TEXT    NOT NULL,
    DateNaissance DATE    NOT NULL,
    Sexe          TEXT    CHECK (Sexe IN ('M','F')) NOT NULL,
    CategorieId   INTEGER,
    ParentId      INTEGER NOT NULL,
    Photo         BLOB,
    DateInscription DATE DEFAULT (date('now')),
    CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategorieId) REFERENCES Categories(Id) ON DELETE SET NULL,
    FOREIGN KEY (ParentId)    REFERENCES Parents(Id)    ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table : Absences
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Absences (
    Id            INTEGER PRIMARY KEY AUTOINCREMENT,
    EnfantId      INTEGER NOT NULL,
    DateAbsence   DATE    NOT NULL,
    Justification TEXT,
    Justifiee     INTEGER NOT NULL DEFAULT 0,  -- 0/1
    FOREIGN KEY (EnfantId) REFERENCES Enfants(Id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table : Activites
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Activites (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    Nom         TEXT    NOT NULL,
    Description TEXT,
    DateActivite DATE   NOT NULL,
    CategorieId INTEGER,
    FOREIGN KEY (CategorieId) REFERENCES Categories(Id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Table : EnfantActivites (attribution M:N)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS EnfantActivites (
    EnfantId   INTEGER NOT NULL,
    ActiviteId INTEGER NOT NULL,
    Note       TEXT,
    PRIMARY KEY (EnfantId, ActiviteId),
    FOREIGN KEY (EnfantId)   REFERENCES Enfants(Id)   ON DELETE CASCADE,
    FOREIGN KEY (ActiviteId) REFERENCES Activites(Id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table : Factures
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Factures (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ParentId    INTEGER NOT NULL,
    Montant     REAL    NOT NULL DEFAULT 0,
    DateFacture DATE    NOT NULL DEFAULT (date('now')),
    DateEcheance DATE,
    Periode     TEXT,     -- Ex: "2026-04"
    Statut      TEXT    NOT NULL DEFAULT 'Impayée' CHECK (Statut IN ('Impayée','Partielle','Payée','Annulée')),
    CreatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ParentId) REFERENCES Parents(Id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table : Paiements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Paiements (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    FactureId    INTEGER NOT NULL,
    Montant      REAL    NOT NULL,
    DatePaiement DATE    NOT NULL DEFAULT (date('now')),
    Methode      TEXT    NOT NULL DEFAULT 'Espèces'
                 CHECK (Methode IN ('Espèces','Chèque','Virement','Carte')),
    Remarque     TEXT,
    FOREIGN KEY (FactureId) REFERENCES Factures(Id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table : Utilisateurs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Utilisateurs (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    Username    TEXT    NOT NULL UNIQUE,
    PasswordHash TEXT   NOT NULL,
    Role        TEXT    NOT NULL DEFAULT 'Utilisateur'
                CHECK (Role IN ('Admin','Utilisateur')),
    Actif       INTEGER NOT NULL DEFAULT 1,
    CreatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Table : Parametres (clef/valeur)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Parametres (
    Cle    TEXT PRIMARY KEY,
    Valeur TEXT
);

-- -------------------------------------------------------------
-- Index de performance
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS IX_Enfants_Parent    ON Enfants(ParentId);
CREATE INDEX IF NOT EXISTS IX_Enfants_Categorie ON Enfants(CategorieId);
CREATE INDEX IF NOT EXISTS IX_Absences_Enfant   ON Absences(EnfantId);
CREATE INDEX IF NOT EXISTS IX_Factures_Parent   ON Factures(ParentId);
CREATE INDEX IF NOT EXISTS IX_Paiements_Facture ON Paiements(FactureId);
