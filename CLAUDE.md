# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Kaaydiangu / Mon École** — Système de gestion scolaire multi-rôles (Next.js 14, App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth v5, PostgreSQL).

## Commandes essentielles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lint
npm run lint

# Prisma — après modification de schema.prisma
npx prisma migrate dev --name <nom_migration>

# Générer le client Prisma
npx prisma generate

# Voir/éditer la base de données
npx prisma studio
```

## Architecture

### Structure des routes (App Router)
- `app/(public)/` — Site vitrine public (page d'accueil, liste des impayés dynamique)
- `app/(auth)/login/` — Page de connexion
- `app/dashboard/` — Dashboard protégé, redirige vers le sous-module selon le rôle
  - `admin/` → SUPER_ADMIN
  - `comptable/` → COMPTABLE (paiements, dépenses, reçus PDF)
  - `censeur/` → CENSEUR (notes, absences, emploi du temps)
  - `professeur/` → PROFESSEUR (saisie notes, cours)
  - `eleve/` → ELEVE (consultation notes, paiements, cours)
- `app/api/` — Routes API Next.js

### Authentification
- **NextAuth v5** avec stratégie JWT et provider Credentials
- Fichier principal : `auth.ts` à la racine
- Le token JWT embarque `role` et `ecoleId`
- Le middleware (`middleware.ts`) protège toutes les routes `/dashboard/*` et redirige selon le rôle
- Types augmentés dans `types/next-auth.d.ts`

### Base de données
- **Prisma v7** avec Neon PostgreSQL (serverless) via `@prisma/adapter-neon`
- Client généré dans `app/generated/prisma/client.ts` (généré automatiquement, ne pas modifier)
- Client singleton dans `lib/prisma.ts` — utilise `PrismaNeon` adapter + `DATABASE_URL`
- Schéma complet dans `prisma/schema.prisma` — 14 tables
- Config Prisma dans `prisma.config.ts` (Prisma v7 : le `url` n'est plus dans `schema.prisma`)

### Tables clés et leurs relations
- `User` → lié à `Ecole`, un user ELEVE a un `Eleve` associé (1-to-1)
- `Eleve` → lié à `Classe`, `User`, possède `Note[]`, `Absence[]`, `Paiement[]`
- `Matiere` → lié à `Classe` + `professeur` (User), source de `Note[]`, `Absence[]`
- `Paiement` → lié à `Eleve`, déclenche notifications et génération de reçu PDF

### Logique des impayés
La liste publique des impayés n'est **pas stockée** — c'est une requête dynamique :
```ts
// Élèves sans paiement pour le mois courant depuis plus de X jours
prisma.eleve.findMany({
  where: {
    paiements: { none: { mois: currentMonth, annee: currentYear } },
    date_inscription: { lte: subDays(new Date(), ecole.impaye_seuil_jours) }
  }
})
```
Dès qu'un paiement est enregistré, l'élève disparaît automatiquement de la liste.

### Variables d'environnement requises
```
DATABASE_URL      # URL PostgreSQL
AUTH_SECRET       # Secret NextAuth (générer avec: openssl rand -base64 32)
NEXTAUTH_URL      # URL de l'app (http://localhost:3000 en dev)
```

## Conventions
- Toujours utiliser `await auth()` dans les Server Components pour récupérer la session
- Les routes API doivent vérifier le rôle via `session.user.role` avant toute opération
- Les mots de passe sont hashés avec `bcryptjs` avant insertion en base
- Le `matricule` des élèves est auto-généré (format à définir, ex: `ECO-2024-001`)
- `AuditLog` doit être alimenté pour toute action sensible (paiement, modification note, etc.)
