# Tests de charge — Kaaydiangu / Mon École

Scripts de test de performance pour l'application Next.js 14 avec Prisma + NextAuth v5.

---

## Prérequis

- Node.js 18+
- L'application doit tourner localement (`npm run dev`) ou être déployée
- Base de données PostgreSQL accessible et peuplée avec des données de test

---

## Outils disponibles

| Outil | Fichier | Usage |
|---|---|---|
| **k6** | `k6-load-test.js` | Tests avancés multi-scénarios avec métriques |
| **Artillery** | `artillery-config.yml` | Tests HTTP déclaratifs, bon pour CI/CD |
| **autocannon** | `autocannon-test.js` | Tests rapides sans dépendances externes |

---

## 1. k6 (recommandé pour les tests complets)

### Installation

```bash
# Windows (Chocolatey)
choco install k6

# Windows (Winget)
winget install k6 --source winget

# macOS
brew install k6

# Docker
docker pull grafana/k6
```

### Lancer les tests

```bash
# Smoke test — 1 utilisateur, 1 minute (vérification rapide)
k6 run --env SCENARIO=smoke tests/load/k6-load-test.js

# Load test — montée à 50 VUs, maintien 5 min (défaut)
k6 run tests/load/k6-load-test.js

# Stress test — jusqu'à 200 VUs pour trouver le point de rupture
k6 run --env SCENARIO=stress tests/load/k6-load-test.js

# Spike test — pic soudain à 300 VUs pendant 30 secondes
k6 run --env SCENARIO=spike tests/load/k6-load-test.js
```

### Variables d'environnement k6

```bash
k6 run \
  --env BASE_URL=http://localhost:3000 \
  --env EMAIL=comptable@monecole.sn \
  --env PASSWORD=password123 \
  --env ELEVE_ID=<uuid-eleve-reel> \
  --env SCENARIO=load \
  tests/load/k6-load-test.js
```

| Variable | Défaut | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | URL de base de l'application |
| `EMAIL` | `comptable@monecole.sn` | Email du compte de test |
| `PASSWORD` | `password123` | Mot de passe du compte de test |
| `ELEVE_ID` | *(vide)* | UUID d'un élève réel pour tester `/api/paiements?eleve_id=` |
| `SCENARIO` | `load` | `smoke` / `load` / `stress` / `spike` |

### Rapport HTML (k6)

Le script génère automatiquement :
- `tests/load/results/k6-report.html` — rapport visuel
- `tests/load/results/k6-summary.json` — données brutes JSON

```bash
# Ouvrir le rapport après le test
start tests/load/results/k6-report.html   # Windows
open tests/load/results/k6-report.html    # macOS
```

### Via Docker (sans installation k6)

```bash
docker run --rm -it \
  -v "${PWD}/tests/load:/tests/load" \
  --network host \
  grafana/k6 run /tests/load/k6-load-test.js
```

---

## 2. Artillery

### Installation

```bash
npm install -g artillery
# ou localement au projet
npm install --save-dev artillery
```

### Lancer les tests

```bash
# Test complet (local)
artillery run tests/load/artillery-config.yml

# Avec rapport HTML
artillery run \
  --output tests/load/results/artillery-report.json \
  tests/load/artillery-config.yml
artillery report tests/load/results/artillery-report.json

# Environnement staging
artillery run \
  --environment staging \
  tests/load/artillery-config.yml

# Test rapide (10 secondes, 5 req/s)
artillery quick \
  --count 10 \
  --num 5 \
  http://localhost:3000/api/impayes
```

### Intégration CI/CD (GitHub Actions)

```yaml
- name: Tests de charge Artillery
  run: |
    npm install -g artillery
    artillery run tests/load/artillery-config.yml \
      --output tests/load/results/artillery-ci.json
  env:
    TARGET_URL: ${{ secrets.STAGING_URL }}
```

---

## 3. autocannon (tests rapides Node.js)

### Installation

```bash
# Dépendance de développement (recommandé)
npm install --save-dev autocannon

# Ou globalement
npm install -g autocannon
```

### Lancer les tests

```bash
# Tous les scénarios (30s par endpoint)
node tests/load/autocannon-test.js

# Mode rapide (10s par endpoint)
node tests/load/autocannon-test.js --quick

# Scénarios ciblés
node tests/load/autocannon-test.js --scenario public  # pages publiques
node tests/load/autocannon-test.js --scenario auth    # login / CSRF
node tests/load/autocannon-test.js --scenario api     # endpoints API
node tests/load/autocannon-test.js --scenario spike   # pic 300 connexions
```

### Variables d'environnement autocannon

```bash
BASE_URL=http://localhost:3000 \
EMAIL=comptable@monecole.sn \
PASSWORD=password123 \
ELEVE_ID=<uuid> \
node tests/load/autocannon-test.js --quick
```

---

## Endpoints testés

### Publics (sans authentification)

| Endpoint | Méthode | Description |
|---|---|---|
| `/` | GET | Page d'accueil publique |
| `/api/impayes` | GET | Liste dynamique des élèves en retard |
| `/api/auth/csrf` | GET | Token CSRF pour le login |

### Authentifiés (session JWT NextAuth)

| Endpoint | Méthode | Rôles autorisés |
|---|---|---|
| `/api/classes` | GET | Tous |
| `/api/eleves` | GET | SUPER_ADMIN, CENSEUR, COMPTABLE |
| `/api/paiements?eleve_id=` | GET | Tous |
| `/api/paiements/recherche` | GET | SUPER_ADMIN, COMPTABLE |
| `/api/absences` | GET | Tous |
| `/api/absences/stats?classe_id=` | GET | Tous |
| `/api/notes?classe_id=&matiere_id=` | GET | SUPER_ADMIN, PROFESSEUR, CENSEUR |
| `/api/depenses` | GET | SUPER_ADMIN, COMPTABLE |
| `/api/comptabilite/stats` | GET | SUPER_ADMIN, COMPTABLE |
| `/api/admin/stats` | GET | SUPER_ADMIN |
| `/api/admin/audit` | GET | SUPER_ADMIN |
| `/api/notifications` | GET | Tous |
| `/api/emplois-du-temps` | GET | Tous |
| `/api/censeur/matieres` | GET | SUPER_ADMIN, CENSEUR |

---

## Seuils d'acceptation

| Métrique | Seuil |
|---|---|
| Latence p95 | < 500 ms |
| Latence p99 | < 1 000 ms |
| Taux d'erreur HTTP | < 1 % |
| Login (bcrypt) p95 | < 1 000 ms |
| Stats agrégées p95 | < 800 ms |

---

## Préparer les données de test

Pour obtenir des résultats représentatifs, créez des comptes de test en base :

```sql
-- Exemple de données de test minimales
-- (adapter selon votre schema Prisma)

-- 1. Vérifier qu'un compte comptable existe
SELECT id, email, role FROM "User" WHERE role = 'COMPTABLE' LIMIT 1;

-- 2. Récupérer un ELEVE_ID pour les tests de paiements
SELECT e.id, e.nom, e.prenom FROM "Eleve" e LIMIT 1;

-- 3. Récupérer un CLASSE_ID pour les tests de notes
SELECT id, nom FROM "Classe" LIMIT 1;
```

Puis lancer les tests avec les bons IDs :

```bash
k6 run \
  --env ELEVE_ID=$(npx prisma db seed --preview-feature 2>/dev/null | grep "eleve_id" | head -1) \
  tests/load/k6-load-test.js
```

---

## Interprétation des résultats

### Bons indicateurs

- `p95 < 500ms` — la majorité des utilisateurs ont une expérience fluide
- `errorRate < 1%` — le serveur est stable
- Pas de dégradation progressive au fil du temps (signe de fuite mémoire)

### Signaux d'alerte

| Symptome | Cause probable | Action |
|---|---|---|
| p95 > 500ms sur `/api/comptabilite/stats` | Requête DB complexe (12 mois) | Ajouter un cache Redis ou pagination |
| p95 > 1s sur login | bcrypt trop lent sous charge | Passer à 8 rounds au lieu de 10 |
| 5xx sur `/api/eleves` | Connexions Prisma/Neon épuisées | Augmenter `connection_limit` dans `DATABASE_URL` |
| Timeouts sur Vercel | Cold start (serverless) | Activer Fluid Compute ou passer à Pro |

### Optimisations Neon (PostgreSQL serverless)

Ajouter ces paramètres dans `DATABASE_URL` :

```
DATABASE_URL="postgresql://...@...neon.tech/...?connection_limit=10&pool_timeout=20&pgbouncer=true"
```

---

## Structure des résultats

```
tests/load/results/
  k6-report.html          # Rapport HTML k6 (graphiques)
  k6-summary.json         # Données brutes k6
  artillery-report.json   # Rapport Artillery brut
  autocannon-*.json       # Résultats autocannon horodatés
```

> Le dossier `tests/load/results/` est ignoré par git (voir `.gitignore`).
