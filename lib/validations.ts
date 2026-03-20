import { z } from "zod";

// Paiement — POST /api/paiements
export const paiementSchema = z.object({
  paiement_id: z.string().min(1, "ID paiement requis"),
  montant: z.number().positive("Le montant doit être positif"),
  mode: z.enum(["ESPECES", "MOBILE_MONEY", "VIREMENT"]),
});

// Note individuelle (dans le batch)
export const noteItemSchema = z.object({
  eleve_id: z.string().min(1, "ID élève requis"),
  valeur: z.number().min(0, "La note minimum est 0").max(20, "La note maximum est 20"),
  appreciation: z.string().optional(),
});

// Notes en lot — POST /api/notes
export const batchNotesSchema = z.object({
  matiere_id: z.string().min(1, "ID matière requis"),
  type: z.enum(["CONTROLE", "DEVOIR", "EXAMEN"]),
  sequence: z.number().int().min(1, "Séquence minimum 1").max(6, "Séquence maximum 6"),
  date: z.string().optional(),
  notes: z.array(noteItemSchema).min(1, "Au moins une note requise"),
});

// Absences en lot — POST /api/absences
export const absenceItemSchema = z.object({
  eleve_id: z.string().min(1, "ID élève requis"),
  motif: z.string().optional(),
});

export const batchAbsencesSchema = z.object({
  matiere_id: z.string().min(1, "ID matière requis"),
  date: z.string().min(1, "Date requise"),
  duree_heures: z.number().positive("La durée doit être positive"),
  absences: z.array(absenceItemSchema).min(1, "Au moins une absence requise"),
});

// Dépense — POST /api/depenses
export const depenseSchema = z.object({
  libelle: z.string().min(1, "Libellé requis"),
  montant: z.number().positive("Le montant doit être positif"),
  categorie: z.enum(["SALAIRE", "FOURNITURE", "MAINTENANCE", "AUTRE"]),
  date: z.string().min(1, "Date requise"),
});

// Élève — POST /api/eleves
export const eleveSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  classe_id: z.string().min(1, "Classe requise"),
  date_naissance: z.string().optional(),
  sexe: z.enum(["M", "F"]).optional().nullable(),
  photo: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  nom_parent: z.string().optional().nullable(),
  telephone_parent: z.string().optional().nullable(),
  email_parent: z.string().email("Email parent invalide").optional().nullable(),
});

// User/Staff — POST /api/admin/users
export const userSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  role: z.enum(["COMPTABLE", "CENSEUR", "PROFESSEUR"]),
});

// Cours — POST /api/cours
export const coursSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  matiere_id: z.string().min(1, "Matière requise"),
  classe_id: z.string().min(1, "Classe requise"),
  fichier_url: z.string().min(1, "URL du fichier requise"),
  description: z.string().optional().nullable(),
});
