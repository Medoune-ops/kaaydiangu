#!/usr/bin/env node
/**
 * autocannon-test.js — Tests de charge rapides sans dépendance k6
 * Kaaydiangu / Mon École
 *
 * Usage :
 *   node tests/load/autocannon-test.js                    # tous les scénarios
 *   node tests/load/autocannon-test.js --scenario public  # pages publiques seulement
 *   node tests/load/autocannon-test.js --scenario api     # endpoints API
 *   node tests/load/autocannon-test.js --scenario auth    # test du login
 *   node tests/load/autocannon-test.js --quick            # test rapide 10s
 *
 * Prérequis :
 *   npm install --save-dev autocannon
 * ou globalement :
 *   npm install -g autocannon
 *
 * L'application doit tourner sur BASE_URL avant de lancer ce script.
 */

"use strict";

const autocannon = require("autocannon");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL  = process.env.BASE_URL  || "http://localhost:3000";
const EMAIL     = process.env.EMAIL     || "comptable@monecole.sn";
const PASSWORD  = process.env.PASSWORD  || "password123";
const ELEVE_ID  = process.env.ELEVE_ID  || "";     // ID d'élève réel si disponible

// Durée des tests (secondes) — réduit avec --quick
const IS_QUICK   = process.argv.includes("--quick");
const DURATION   = IS_QUICK ? 10 : 30;
const CONNECTIONS = IS_QUICK ? 10 : 50;
const PIPELINING  = 1;

// Scénario ciblé
const SCENARIO_ARG = (() => {
  const i = process.argv.indexOf("--scenario");
  return i >= 0 ? process.argv[i + 1] : "all";
})();

const run = promisify(autocannon);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Affiche un résumé lisible des résultats autocannon.
 */
function printResults(label, results) {
  const r = results;
  const p = r.latency;

  console.log("\n" + "─".repeat(60));
  console.log(`  RESULTATS : ${label}`);
  console.log("─".repeat(60));
  console.log(`  URL        : ${r.url}`);
  console.log(`  Durée      : ${r.duration}s | Connexions : ${r.connections}`);
  console.log(`  Requetes   : ${r.requests.total} total | ${r.requests.average.toFixed(1)} req/s moy.`);
  console.log(`  Throughput : ${(r.throughput.average / 1024).toFixed(1)} KB/s`);
  console.log(`  Latence p50: ${p.p50} ms`);
  console.log(`  Latence p90: ${p.p90} ms`);
  console.log(`  Latence p95: ${p.p95} ms  ${p.p95 < 500 ? "[OK]" : "[DEPASSE SEUIL 500ms]"}`);
  console.log(`  Latence p99: ${p.p99} ms`);
  console.log(`  Erreurs    : ${r["2xx"]} 2xx | ${r["4xx"]} 4xx | ${r["5xx"]} 5xx`);

  const errorRate = ((r.non2xx || 0) / (r.requests.total || 1)) * 100;
  console.log(`  Taux erreur: ${errorRate.toFixed(2)}%  ${errorRate < 1 ? "[OK]" : "[DEPASSE SEUIL 1%]"}`);

  // Verdict global
  const passed = p.p95 < 500 && errorRate < 1;
  console.log(`  Verdict    : ${passed ? "PASSE" : "ECHEC"}`);
  console.log("─".repeat(60) + "\n");

  return { label, passed, p95: p.p95, errorRate, reqs: r.requests.total };
}

/**
 * Sauvegarde les résultats bruts en JSON.
 */
function saveResults(allResults) {
  const dir = path.join(__dirname, "results");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = path.join(
    dir,
    `autocannon-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(allResults, null, 2));
  console.log(`Resultats sauvegardes dans : ${filename}`);
}

/**
 * Récupère le token CSRF de NextAuth.
 */
async function fetchCsrfToken() {
  const http = require("http");
  const https = require("https");

  return new Promise((resolve, reject) => {
    const lib = BASE_URL.startsWith("https") ? https : http;
    lib.get(`${BASE_URL}/api/auth/csrf`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data).csrfToken || null);
        } catch {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

// ─── Définition des tests ─────────────────────────────────────────────────────

/**
 * Test 1 — Page d'accueil publique
 */
async function testPublicHome() {
  console.log("\n[1/7] Test page d accueil publique...");
  const result = await run({
    url: BASE_URL,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: PIPELINING,
    title: "GET /",
    headers: { accept: "text/html" },
  });
  return printResults("GET /  (accueil public)", result);
}

/**
 * Test 2 — API publique des impayés
 */
async function testPublicImpayes() {
  console.log("\n[2/7] Test API impayés publique...");
  const result = await run({
    url: `${BASE_URL}/api/impayes`,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: PIPELINING,
    title: "GET /api/impayes",
    headers: { accept: "application/json" },
  });
  return printResults("GET /api/impayes  (public)", result);
}

/**
 * Test 3 — Endpoint CSRF (préambule de toute session)
 */
async function testCsrf() {
  console.log("\n[3/7] Test endpoint CSRF...");
  const result = await run({
    url: `${BASE_URL}/api/auth/csrf`,
    connections: Math.min(CONNECTIONS, 20), // CSRF n'a pas besoin de beaucoup de charge
    duration: DURATION,
    pipelining: PIPELINING,
    title: "GET /api/auth/csrf",
    headers: { accept: "application/json" },
  });
  return printResults("GET /api/auth/csrf", result);
}

/**
 * Test 4 — Login (POST credentials)
 * Attention : requêtes lourdes (bcrypt). Connexions réduites intentionnellement.
 */
async function testLogin() {
  console.log("\n[4/7] Test login (POST /api/auth/callback/credentials)...");

  let csrfToken;
  try {
    csrfToken = await fetchCsrfToken();
  } catch {
    csrfToken = "dummy-csrf-token";
  }

  const body = JSON.stringify({
    csrfToken: csrfToken || "dummy",
    email: EMAIL,
    password: PASSWORD,
    redirect: "false",
    callbackUrl: `${BASE_URL}/dashboard`,
    json: "true",
  });

  // bcrypt est coûteux (10 rounds) — on réduit la charge pour ne pas saturer CPU
  const loginConnections = Math.min(CONNECTIONS, 5);
  const loginDuration    = Math.min(DURATION, 20);

  const result = await run({
    url: `${BASE_URL}/api/auth/callback/credentials`,
    method: "POST",
    connections: loginConnections,
    duration: loginDuration,
    pipelining: 1, // pas de pipelining sur auth
    title: "POST /api/auth/callback/credentials",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body,
  });
  return printResults("POST /api/auth/callback/credentials (login)", result);
}

/**
 * Test 5 — Endpoints API authentifiés (avec session cookie injecté)
 * Note : Ces tests simulent une session déjà établie.
 * Pour un vrai test auth, utiliser k6 qui gère les cookies dynamiquement.
 */
async function testAuthenticatedEndpoints(sessionCookie = "") {
  const authHeader = sessionCookie
    ? { cookie: sessionCookie, accept: "application/json" }
    : { accept: "application/json" };

  const endpoints = [
    {
      label: "GET /api/classes",
      url: `${BASE_URL}/api/classes`,
      expectedCodes: [200, 401, 403], // 401/403 si cookie invalide
    },
    {
      label: "GET /api/eleves?page=1",
      url: `${BASE_URL}/api/eleves?page=1&limit=20`,
      expectedCodes: [200, 401, 403],
    },
    {
      label: "GET /api/notifications",
      url: `${BASE_URL}/api/notifications`,
      expectedCodes: [200, 401],
    },
    {
      label: "GET /api/comptabilite/stats",
      url: `${BASE_URL}/api/comptabilite/stats`,
      expectedCodes: [200, 401, 403],
    },
    {
      label: "GET /api/absences?page=1",
      url: `${BASE_URL}/api/absences?page=1&limit=20`,
      expectedCodes: [200, 401, 403],
    },
  ];

  const results = [];

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    console.log(`\n[5.${i + 1}/${endpoints.length}] Test ${ep.label}...`);

    const result = await run({
      url: ep.url,
      connections: CONNECTIONS,
      duration: DURATION,
      pipelining: PIPELINING,
      title: ep.label,
      headers: authHeader,
    });

    results.push(printResults(ep.label, result));
  }

  return results;
}

/**
 * Test 6 — Endpoints de stats lourds (requêtes DB agrégées)
 */
async function testHeavyStats(sessionCookie = "") {
  console.log("\n[6/7] Test endpoints stats lourds...");
  const headers = sessionCookie
    ? { cookie: sessionCookie, accept: "application/json" }
    : { accept: "application/json" };

  // Connexions réduites car requêtes DB complexes (12 mois d'historique)
  const result = await run({
    url: `${BASE_URL}/api/comptabilite/stats`,
    connections: Math.min(CONNECTIONS, 20),
    duration: DURATION,
    pipelining: 1,
    title: "GET /api/comptabilite/stats (lourde)",
    headers,
  });
  return printResults("GET /api/comptabilite/stats (stats 12 mois)", result);
}

/**
 * Test 7 — Endpoints avec paramètres invalides (validation Zod)
 * Vérifie que le serveur répond vite aux requêtes invalides (pas de fuite DB).
 */
async function testInvalidRequests(sessionCookie = "") {
  console.log("\n[7/7] Test requetes invalides (validation rapide)...");
  const headers = sessionCookie
    ? { cookie: sessionCookie, accept: "application/json" }
    : { accept: "application/json" };

  const result = await run({
    url: `${BASE_URL}/api/notes`, // manque classe_id et matiere_id => 400 rapide
    connections: CONNECTIONS,
    duration: Math.min(DURATION, 15),
    pipelining: PIPELINING,
    title: "GET /api/notes (params manquants)",
    headers,
  });
  return printResults("GET /api/notes sans params (400 attendu)", result);
}

// ─── Point d'entrée ───────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("  TESTS DE CHARGE AUTOCANNON — Kaaydiangu / Mon École");
  console.log("=".repeat(60));
  console.log(`  BASE_URL    : ${BASE_URL}`);
  console.log(`  Connections : ${CONNECTIONS}`);
  console.log(`  Durée/test  : ${DURATION}s`);
  console.log(`  Scénario    : ${SCENARIO_ARG}`);
  console.log(`  Mode rapide : ${IS_QUICK ? "oui" : "non"}`);
  console.log("=".repeat(60));

  // Vérifier que le serveur est accessible
  try {
    const http = require("http");
    const https = require("https");
    const lib = BASE_URL.startsWith("https") ? https : http;
    await new Promise((resolve, reject) => {
      lib.get(BASE_URL, resolve).on("error", reject);
    });
  } catch {
    console.error(`\nERREUR : Impossible de joindre ${BASE_URL}`);
    console.error("Verifiez que l application tourne avec : npm run dev\n");
    process.exit(1);
  }

  const allResults = [];
  const startTime = Date.now();

  try {
    // Sélection du scénario selon --scenario
    if (SCENARIO_ARG === "public" || SCENARIO_ARG === "all") {
      allResults.push(await testPublicHome());
      allResults.push(await testPublicImpayes());
    }

    if (SCENARIO_ARG === "auth" || SCENARIO_ARG === "all") {
      allResults.push(await testCsrf());
      allResults.push(await testLogin());
    }

    if (SCENARIO_ARG === "api" || SCENARIO_ARG === "all") {
      const apiResults = await testAuthenticatedEndpoints();
      allResults.push(...apiResults);
      allResults.push(await testHeavyStats());
      allResults.push(await testInvalidRequests());
    }

    if (SCENARIO_ARG === "spike") {
      // Spike test : montée brutale sur la page d'accueil
      console.log("\n[SPIKE] Test pic soudain sur page accueil...");
      const spike = await run({
        url: BASE_URL,
        connections: 300,
        duration: 30,
        pipelining: 1,
        title: "SPIKE 300 connexions",
        headers: { accept: "text/html" },
      });
      allResults.push(printResults("SPIKE 300 connexions simultanées", spike));
    }

  } catch (err) {
    console.error("\nErreur pendant les tests :", err.message);
  }

  // Résumé global
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed   = allResults.filter((r) => r.passed).length;
  const total    = allResults.length;

  console.log("\n" + "=".repeat(60));
  console.log("  RESUME GLOBAL");
  console.log("=".repeat(60));
  console.log(`  Tests effectues : ${total}`);
  console.log(`  Passes          : ${passed}`);
  console.log(`  Echoues         : ${total - passed}`);
  console.log(`  Duree totale    : ${elapsed}s`);
  console.log("");

  for (const r of allResults) {
    const icon = r.passed ? "[PASSE]" : "[ECHEC]";
    console.log(`  ${icon}  ${r.label} — p95=${r.p95}ms | erreurs=${r.errorRate.toFixed(2)}%`);
  }

  console.log("=".repeat(60) + "\n");

  // Sauvegarde JSON
  saveResults({
    timestamp: new Date().toISOString(),
    config: { BASE_URL, CONNECTIONS, DURATION, SCENARIO_ARG },
    summary: { total, passed, failed: total - passed, elapsed_s: parseFloat(elapsed) },
    tests: allResults,
  });

  // Code de sortie : 1 si des tests ont échoué
  process.exit(total - passed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Erreur fatale :", err);
  process.exit(1);
});
