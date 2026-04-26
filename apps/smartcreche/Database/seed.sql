-- =============================================================
-- SmartCreche - Jeu de données d'exemple
-- =============================================================

-- Paramètres généraux ----------------------------------------
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('NomCreche', 'SmartCrèche');
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('Adresse', '12 rue des Lilas, Casablanca');
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('Telephone', '+212 522 000 000');
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('Email', 'contact@smartcreche.ma');
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('Devise', 'DH');
INSERT OR IGNORE INTO Parametres (Cle, Valeur) VALUES ('TarifMensuel', '800');

-- Utilisateur admin par défaut -------------------------------
-- Identifiants : admin / admin123
-- Le hash est calculé selon l'algorithme de PasswordHelper (SHA256+Salt).
-- Mot de passe : admin123    Sel : smartcreche_salt
-- Hash: SHA256("admin123" + "smartcreche_salt")
INSERT OR IGNORE INTO Utilisateurs (Username, PasswordHash, Role, Actif)
VALUES ('admin',
        '2d3c22944bef9c5007e4fdbdc5286e185f23427176534eefebabb80f97fa8ebb',
        'Admin', 1);

-- Catégories -------------------------------------------------
INSERT OR IGNORE INTO Categories (Nom, AgeMin, AgeMax) VALUES ('Bébés',   0, 1);
INSERT OR IGNORE INTO Categories (Nom, AgeMin, AgeMax) VALUES ('Petits',  2, 3);
INSERT OR IGNORE INTO Categories (Nom, AgeMin, AgeMax) VALUES ('Moyens',  4, 5);
INSERT OR IGNORE INTO Categories (Nom, AgeMin, AgeMax) VALUES ('Grands',  6, 7);

-- Parents ----------------------------------------------------
INSERT OR IGNORE INTO Parents (Id, Nom, Prenom, Telephone, Email, Adresse) VALUES
 (1,'Alami',   'Youssef','+212 661 11 11 11','y.alami@mail.com','Rue 1, Rabat'),
 (2,'Benani',  'Nadia',  '+212 662 22 22 22','n.benani@mail.com','Rue 2, Casa'),
 (3,'Cherkaoui','Omar',  '+212 663 33 33 33','o.cherkaoui@mail.com','Rue 3, Fès'),
 (4,'Doukkali','Sara',   '+212 664 44 44 44','s.doukkali@mail.com','Rue 4, Tanger');

-- Enfants ----------------------------------------------------
INSERT OR IGNORE INTO Enfants (Nom, Prenom, DateNaissance, Sexe, CategorieId, ParentId) VALUES
 ('Alami',    'Lina',   '2023-05-14','F',1,1),
 ('Alami',    'Adam',   '2022-03-10','M',2,1),
 ('Benani',   'Yasmine','2021-11-20','F',2,2),
 ('Cherkaoui','Rayan',  '2020-07-02','M',3,3),
 ('Doukkali', 'Hiba',   '2019-01-25','F',4,4);

-- Absences ---------------------------------------------------
INSERT OR IGNORE INTO Absences (EnfantId, DateAbsence, Justification, Justifiee) VALUES
 (1,'2026-04-02','Rhume',1),
 (2,'2026-04-05','',0),
 (3,'2026-04-10','Vaccin',1);

-- Activités --------------------------------------------------
INSERT OR IGNORE INTO Activites (Nom, Description, DateActivite, CategorieId) VALUES
 ('Peinture',   'Atelier de peinture au doigt',          '2026-04-08', 2),
 ('Chansons',   'Éveil musical',                          '2026-04-09', 1),
 ('Lecture',    'Lecture d''un conte animé',              '2026-04-10', 3),
 ('Sortie parc','Sortie au jardin public',                '2026-04-15', 4);

-- Attributions activités -------------------------------------
INSERT OR IGNORE INTO EnfantActivites (EnfantId, ActiviteId, Note) VALUES
 (2,1,'Très motivé'),
 (3,1,'Participe bien'),
 (4,3,'Concentré'),
 (5,4,'A adoré la sortie');

-- Factures ---------------------------------------------------
INSERT OR IGNORE INTO Factures (ParentId, Montant, DateFacture, DateEcheance, Periode, Statut) VALUES
 (1, 1600, '2026-04-01','2026-04-15','2026-04','Partielle'),
 (2,  800, '2026-04-01','2026-04-15','2026-04','Payée'),
 (3,  800, '2026-04-01','2026-04-15','2026-04','Impayée'),
 (4,  800, '2026-04-01','2026-04-15','2026-04','Impayée');

-- Paiements --------------------------------------------------
INSERT OR IGNORE INTO Paiements (FactureId, Montant, DatePaiement, Methode, Remarque) VALUES
 (1, 800, '2026-04-05','Virement','Acompte'),
 (2, 800, '2026-04-04','Espèces', NULL);
