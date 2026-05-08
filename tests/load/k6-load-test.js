/**
 * k6 — Script de test de charge — Kaaydiangu / Mon École
 *
 * Usage :
 *   k6 run tests/load/k6-load-test.js                         # load test (défaut)
 *   k6 run --env SCENARIO=smoke tests/load/k6-load-test.js    # smoke test
 *   k6 run --env SCENARIO=stress tests/load/k6-load-test.js   # stress test
 *   k6 run --env SCENARIO=spike tests/load/k6-load-test.js    # spike test
 *
 * Variables d'environnement :
 *   BASE_URL   URL de base de l'application (défaut : http://localhost:3000)
 *   EMAIL      Email d'un compte de test existant  (défaut : comptable@monecole.sn)
 *   PASSWORD   Mot de passe associé                (défaut : password123)
 *   ELEVE_ID   ID d'un élève réel pour les tests de paiements
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const EMAIL    = __ENV.EMAIL    || "comptable@monecole.sn";
const PASSWORD = __ENV.PASSWORD || "password123";
const ELEVE_ID = __ENV.ELEVE_ID || ""; // Remplir avec un vrai ID si disponible

// ─── Métriques personnalisées ─────────────────────────────────────────────────

const errorRate          = new Rate("errors");
const loginDuration      = new Trend("login_duration_ms",      true);
const elevesGetDuration  = new Trend("eleves_get_duration_ms", true);
const paiementsGetDuration = new Trend("paiements_get_duration_ms", true);
const classesDuration    = new Trend("classes_get_duration_ms", true);
const notesDuration      = new Trend("notes_get_duration_ms",   true);
const statsDuration      = new Trend("stats_get_duration_ms",   true);
const authFailures       = new Counter("auth_failures");

// ─── Seuils globaux d'acceptation ─────────────────────────────────────────────

const THRESHOLDS = {
  // Temps de réponse : 95e percentile < 500 ms sur toutes les requêtes
  http_req_duration:          ["p(95)<500"],
  // Taux d'erreur HTTP < 1 %
  errors:                     ["rate<0.01"],
  // Login : p(95) < 1 s (appel DB + bcrypt)
  login_duration_ms:          ["p(95)<1000"],
  // Listes : p(95) < 400 ms
  eleves_get_duration_ms:     ["p(95)<400"],
  paiements_get_duration_ms:  ["p(95)<400"],
  classes_get_duration_ms:    ["p(95)<400"],
  notes_get_duration_ms:      ["p(95)<400"],
  // Stats (requêtes agrégées) : p(95) < 800 ms
  stats_get_duration_ms:      ["p(95)<800"],
  // Taux de réussite HTTP : au moins 99 %
  http_req_failed:            ["rate<0.01"],
};

// ─── Définition des scénarios ─────────────────────────────────────────────────

const SCENARIO = __ENV.SCENARIO || "load";

const SCENARIOS = {
  // 1. Smoke test — 1 VU, 1 minute
  smoke: {
    executor: "constant-vus",
    vus: 1,
    duration: "1m",
    gracefulStop: "10s",
  },

  // 2. Load test — montée 50 VUs en 2 min, maintien 5 min, descente 2 min
  load: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "2m", target: 50  }, // montée
      { duration: "5m", target: 50  }, // plateau
      { duration: "2m", target: 0   }, // descente
    ],
    gracefulRampDown: "30s",
  },

  // 3. Stress test — montée progressive jusqu'à 200 VUs pour trouver le point de rupture
  stress: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "2m",  target: 50  },
      { duration: "2m",  target: 50  },
      { duration: "2m",  target: 100 },
      { duration: "2m",  target: 100 },
      { duration: "2m",  target: 150 },
      { duration: "2m",  target: 150 },
      { duration: "2m",  target: 200 },
      { duration: "5m",  target: 200 },
      { duration: "3m",  target: 0   }, // retour calme
    ],
    gracefulRampDown: "30s",
  },

  // 4. Spike test — pic soudain à 300 VUs pendant 30 secondes
  spike: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "30s", target: 10  }, // charge de base
      { duration: "10s", target: 300 }, // pic brutal
      { duration: "30s", target: 300 }, // maintien du pic
      { duration: "10s", target: 10  }, // retour rapide
      { duration: "30s", target: 10  }, // stabilisation
      { duration: "10s", target: 0   }, // fin
    ],
    gracefulRampDown: "10s",
  },
};

export const options = {
  scenarios: {
    [SCENARIO]: SCENARIOS[SCENARIO] || SCENARIOS.load,
  },
  thresholds: THRESHOLDS,
  // Afficher les erreurs dans la sortie k6
  insecureSkipTLSVerify: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Headers communs pour les requêtes JSON
 */
function jsonHeaders(cookie = "") {
  const h = { "Content-Type": "application/json" };
  if (cookie) h["Cookie"] = cookie;
  return h;
}

/**
 * Effectue le login et retourne le cookie de session.
 * NextAuth v5 utilise le flow CSRF + credentials via /api/auth/callback/credentials.
 */
function login() {
  // Étape 1 — Récupérer le token CSRF
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`, {
    tags: { name: "auth_csrf" },
  });

  const csrfOk = check(csrfRes, {
    "csrf 200": (r) => r.status === 200,
    "csrf a un token": (r) => {
      try {
        return !!JSON.parse(r.body).csrfToken;
      } catch {
        return false;
      }
    },
  });

  if (!csrfOk) {
    authFailures.add(1);
    errorRate.add(1);
    return null;
  }

  let csrfToken;
  try {
    csrfToken = JSON.parse(csrfRes.body).csrfToken;
  } catch {
    authFailures.add(1);
    return null;
  }

  // Étape 2 — POST credentials
  const start = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    JSON.stringify({
      csrfToken,
      email: EMAIL,
      password: PASSWORD,
      redirect: "false",
      callbackUrl: `${BASE_URL}/dashboard`,
      json: "true",
    }),
    {
      headers: jsonHeaders(),
      redirects: 0,
      tags: { name: "auth_login" },
    }
  );
  loginDuration.add(Date.now() - start);

  const loginOk = check(loginRes, {
    "login 200 ou 302": (r) => r.status === 200 || r.status === 302,
  });

  if (!loginOk) {
    authFailures.add(1);
    errorRate.add(1);
    return null;
  }

  // Extraire le cookie de session (next-auth.session-token)
  const setCookie = loginRes.headers["Set-Cookie"] || "";
  const sessionMatch = setCookie.match(/next-auth\.session-token=[^;]+/);
  return sessionMatch ? sessionMatch[0] : null;
}

// ─── Scénario principal ───────────────────────────────────────────────────────

export default function () {
  // Chaque VU se connecte une fois, puis enchaîne les requêtes authentifiées
  const sessionCookie = login();

  if (!sessionCookie) {
    sleep(1);
    return;
  }

  const authHeaders = { headers: jsonHeaders(sessionCookie) };

  // ── Groupe 1 : Pages publiques (sans auth) ────────────────────────────────
  group("pages_publiques", () => {
    // Page d'accueil
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: "GET /" } });
    check(homeRes, { "accueil 200": (r) => r.status === 200 })
      || errorRate.add(1);

    sleep(0.5);

    // Liste publique des impayés (sans auth nécessaire)
    const impayesRes = http.get(`${BASE_URL}/api/impayes`, {
      tags: { name: "GET /api/impayes" },
    });
    check(impayesRes, { "impayes publics 200": (r) => r.status === 200 })
      || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 2 : Données de référence ──────────────────────────────────────
  group("donnees_reference", () => {
    // Liste des classes
    const t0 = Date.now();
    const classesRes = http.get(`${BASE_URL}/api/classes`, {
      ...authHeaders,
      tags: { name: "GET /api/classes" },
    });
    classesDuration.add(Date.now() - t0);

    check(classesRes, {
      "classes 200": (r) => r.status === 200,
      "classes est un tableau": (r) => {
        try { return Array.isArray(JSON.parse(r.body)); }
        catch { return false; }
      },
    }) || errorRate.add(1);

    sleep(0.3);

    // Matieres du censeur
    const matieresRes = http.get(`${BASE_URL}/api/censeur/matieres`, {
      ...authHeaders,
      tags: { name: "GET /api/censeur/matieres" },
    });
    check(matieresRes, {
      "matieres 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 3 : Gestion des élèves ─────────────────────────────────────────
  group("gestion_eleves", () => {
    // Liste des élèves (page 1)
    const t0 = Date.now();
    const elevesRes = http.get(`${BASE_URL}/api/eleves?page=1&limit=20`, {
      ...authHeaders,
      tags: { name: "GET /api/eleves" },
    });
    elevesGetDuration.add(Date.now() - t0);

    check(elevesRes, {
      "eleves 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);

    sleep(0.3);

    // Statistiques des absences (nécessite classe_id — on teste sans paramètre = 400)
    const absStatsRes = http.get(`${BASE_URL}/api/absences/stats`, {
      ...authHeaders,
      tags: { name: "GET /api/absences/stats (sans param)" },
    });
    check(absStatsRes, {
      "absences/stats 400 sans classe_id": (r) => r.status === 400,
    });

    sleep(0.3);

    // Absences récentes (sans filtre)
    const absencesRes = http.get(`${BASE_URL}/api/absences?page=1&limit=20`, {
      ...authHeaders,
      tags: { name: "GET /api/absences" },
    });
    check(absencesRes, {
      "absences 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 4 : Paiements & Comptabilité ───────────────────────────────────
  group("paiements_comptabilite", () => {
    // Liste des paiements (eleve_id requis — sans param = 400)
    const t0 = Date.now();
    const paiementsRes = http.get(`${BASE_URL}/api/paiements`, {
      ...authHeaders,
      tags: { name: "GET /api/paiements (sans param)" },
    });
    paiementsGetDuration.add(Date.now() - t0);

    check(paiementsRes, {
      "paiements 400 sans eleve_id": (r) => r.status === 400,
    });

    // Si on a un eleve_id de test, on peut tester la vraie liste
    if (ELEVE_ID) {
      const t1 = Date.now();
      const paiementsEleveRes = http.get(
        `${BASE_URL}/api/paiements?eleve_id=${ELEVE_ID}&page=1`,
        { ...authHeaders, tags: { name: "GET /api/paiements?eleve_id" } }
      );
      paiementsGetDuration.add(Date.now() - t1);

      check(paiementsEleveRes, {
        "paiements eleve 200": (r) => r.status === 200,
      }) || errorRate.add(1);
    }

    sleep(0.3);

    // Stats comptabilité
    const t2 = Date.now();
    const statsRes = http.get(`${BASE_URL}/api/comptabilite/stats`, {
      ...authHeaders,
      tags: { name: "GET /api/comptabilite/stats" },
    });
    statsDuration.add(Date.now() - t2);

    check(statsRes, {
      "stats comptabilite 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);

    sleep(0.3);

    // Dépenses du mois courant
    const now = new Date();
    const depensesRes = http.get(
      `${BASE_URL}/api/depenses?mois=${now.getMonth() + 1}&annee=${now.getFullYear()}&page=1`,
      { ...authHeaders, tags: { name: "GET /api/depenses" } }
    );
    check(depensesRes, {
      "depenses 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);

    sleep(0.3);

    // Recherche de paiements
    const rechercheRes = http.get(`${BASE_URL}/api/paiements/recherche?q=dupont`, {
      ...authHeaders,
      tags: { name: "GET /api/paiements/recherche" },
    });
    check(rechercheRes, {
      "recherche paiements 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 5 : Notes et bulletins ─────────────────────────────────────────
  group("notes_bulletins", () => {
    // Notes (sans classe_id et matiere_id = 400)
    const t0 = Date.now();
    const notesRes = http.get(`${BASE_URL}/api/notes`, {
      ...authHeaders,
      tags: { name: "GET /api/notes (sans param)" },
    });
    notesDuration.add(Date.now() - t0);

    check(notesRes, {
      "notes 400 sans params obligatoires": (r) => r.status === 400,
    });

    sleep(0.3);

    // Bulletins (sans eleve_id et sequence = 400)
    const bulletinsRes = http.get(`${BASE_URL}/api/bulletins`, {
      ...authHeaders,
      tags: { name: "GET /api/bulletins (sans param)" },
    });
    check(bulletinsRes, {
      "bulletins 400 sans params obligatoires": (r) => r.status === 400,
    });

    sleep(0.3);

    // Emplois du temps
    const edtRes = http.get(`${BASE_URL}/api/emplois-du-temps`, {
      ...authHeaders,
      tags: { name: "GET /api/emplois-du-temps" },
    });
    check(edtRes, {
      "edt 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 6 : Tableau de bord admin ─────────────────────────────────────
  group("dashboard_admin", () => {
    // Stats admin (SUPER_ADMIN uniquement — 403 attendu pour autres rôles)
    const t0 = Date.now();
    const adminStatsRes = http.get(`${BASE_URL}/api/admin/stats`, {
      ...authHeaders,
      tags: { name: "GET /api/admin/stats" },
    });
    statsDuration.add(Date.now() - t0);

    check(adminStatsRes, {
      "admin/stats 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);

    sleep(0.3);

    // Audit log
    const auditRes = http.get(`${BASE_URL}/api/admin/audit?page=1&limit=20`, {
      ...authHeaders,
      tags: { name: "GET /api/admin/audit" },
    });
    check(auditRes, {
      "audit 200 ou 403": (r) => [200, 403].includes(r.status),
    }) || errorRate.add(1);
  });

  sleep(1);

  // ── Groupe 7 : Notifications ──────────────────────────────────────────────
  group("notifications", () => {
    const notifRes = http.get(`${BASE_URL}/api/notifications`, {
      ...authHeaders,
      tags: { name: "GET /api/notifications" },
    });
    check(notifRes, {
      "notifications 200": (r) => r.status === 200,
      "notifications a des champs attendus": (r) => {
        try {
          const body = JSON.parse(r.body);
          return "notifications" in body && "nonLues" in body;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  sleep(1);
}

// ─── Rapport de fin de test ───────────────────────────────────────────────────

export function handleSummary(data) {
  return {
    // Rapport HTML
    "tests/load/results/k6-report.html": htmlReport(data),
    // Résumé texte dans la console
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    // Export JSON brut
    "tests/load/results/k6-summary.json": JSON.stringify(data, null, 2),
  };
}
