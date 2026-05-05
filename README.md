# Kaaydiangu / IREF - Système de Gestion Scolaire Moderne 🚀

## 🎯 **Description du projet**
**IREF** est un système de gestion scolaire complet développé avec **Next.js 15 App Router**, conçu pour gérer un établissement privé sénégalais (maternelle → lycée). Il sépare parfaitement :

- **Site public vitrine** : Attractif, moderne, avec mockup dashboard 3D, liste impayés dynamique, témoignages
- **Dashboard multi-rôles privé** : Admin, Comptable, Censeur, Professeur, Élève

**Objectif** : Digitaliser la gestion (inscriptions, paiements, notes, absences, emplois du temps, bulletins PDF).

## 🛠️ **Technologies**
```
Frontend: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 4, shadcn/ui
Auth: NextAuth v5 (Credentials + bcryptjs)
DB: Prisma v7 + Neon PostgreSQL (serverless)
PDF: pdf-lib (reçus, bulletins)
Upload: UploadThing
Email: Resend (notifications)
Autres: Lucide React icons, Class Variance Authority (CVA)
```

## 📁 **Architecture des routes**
```
app/
├── (public)/          # Site vitrine (non-protégé)
│   ├── page.tsx       # Accueil avec mockup dashboard 3D ✨
│   ├── nos-classes/   # Liste classes (fichier ouvert)
│   └── navbar.tsx     # Navbar dynamique (connecté/non-connecté)
├── (auth)/login/      # Page login
├── dashboard/         # PRIVÉ - Auto-redirect rôle
│   ├── layout.tsx     # Protégé server-side (auth())
│   ├── admin/         # SUPER_ADMIN (équipe, config, audit)
│   ├── comptable/     # COMPTABLE (paiements/reçus PDF, impayés, dépenses)
│   ├── censeur/       # CENSEUR (élèves, notes, bulletins, absences, emplois)
│   ├── professeur/    # PROFESSEUR (notes, absences, upload cours)
│   └── eleve/         # ÉLÈVE (notes, paiements, documents)
└── api/               # Routes API (absences, paiements, notes, upload...)
```

## 🔐 **Authentification & Protection**
- **NextAuth v5** (`auth.ts`) : Login email/matricule + bcrypt
- **Middleware** (`middleware.ts`) : Protège `/dashboard/**`, redirige rôle
- **Session** : JWT avec `role` (SUPER_ADMIN|COMPTABLE|CENSEUR|PROFESSEUR|ELEVE) + `ecoleId`
- **Client-side** : `<SessionProvider>` + `useSession()` (navbar dynamique)

## 🗄️ **Base de données (Prisma)**
**14 tables** : User, Eleve, Classe, Matiere, Paiement, Note, Absence, Ecole, etc.
```
Relations clés:
User (rôles) 1:1 Eleve ← Paiement[], Note[], Absence[]
Classe ← Matiere[] (professeur_id), Eleve[], Note[], EmploiDuTemps[]
```
**Impayés publics** : Requête dynamique (élèves sans paiement mois courant > seuil jours)

## ✨ **Fonctionnalités implémentées**
### Site public
- [x] Design moderne glassmorphism + animations (TiltCard, marquee, aurora)
- [x] Navbar dynamique (dashboard si connecté)
- [x] Liste impayés **live** (API publique)
- [x] Mockup dashboard 3D flottant

### Dashboard
- [x] **Multi-rôles** avec sidebar adaptive
- [x] Comptable : Enreg. paiements, reçus PDF auto, suivi impayés/dépenses
- [x] Censeur : Saisie notes, pointage absences, bulletins PDF, emplois du temps
- [x] Admin : Gestion équipe, config école, journal audit
- [x] Notifications (email + in-app)

### API & Utils
- [x] Upload fichiers/cours (UploadThing)
- [x] Génération PDF (reçus, bulletins)
- [x] Prisma singleton + Neon adapter

## ⏳ **Tâches en cours / futures**
```
Haute priorité:
[ ] Pages manquantes: /a-propos, /revisions, /actualites, /contact
[ ] Emplois du temps (CRUD + viewer public)
[ ] Parent portal (lecture seule)
[ ] Mobile app (React Native ?)

Moyenne:
[ ] Statistiques avancées (tableaux de bord)
[ ] Paiements en ligne (Wave, Orange Money)
[ ] Import/Export Excel élèves
```

## 🚀 **Démarrage rapide**
```bash
# 1. Cloner & installer
git clone <repo> && cd kaaydiangu
npm install

# 2. Config DB (Neon PostgreSQL gratuit)
cp .env.example .env.local
# Ajouter DATABASE_URL, AUTH_SECRET=openssl rand -base64 32

# 3. Prisma
npx prisma generate
npx prisma db push  # ou migrate dev
npx prisma studio   # Explorer DB

# 4. Dev
npm run dev
```
**Ports:** `localhost:3000` (site + dashboard)

## 📝 **Conventions de code**
- **Server Components** : `await auth()` pour session
- **API routes** : Vérifier `session.user.role` avant actions
- **Nommage** : `kebab-case` routes, `PascalCase` components
- **Fichiers modifiés** : Toujours updater **README.md** + cocher TODO.md

## 🐛 **Dépannage courant**
```
Erreur Prisma ? → npx prisma generate
Build fail ? → rm -rf .next/ && npm run build
Session vide ? → Vérifier AUTH_SECRET + NEXTAUTH_URL
Upload fail ? → Clés UploadThing dans .env
```

## 📈 **Roadmap 2025**
1. **Q1** : Pages manquantes + parent portal
2. **Q2** : Mobile PWA + paiements en ligne
3. **Q3** : IA correction notes + prédict. résultats

---

**Dernière MAJ:** Liaison site ↔ dashboard privé (SessionProvider + navbar dynamique)  
**Auteur principal:** BLACKBOXAI  
**Remplace:** CLAUDE.md (plus détaillé, à jour)
