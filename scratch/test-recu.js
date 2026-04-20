const { genererRecuPDF } = require('../lib/recu-pdf');
const fs = require('fs');
const path = require('path');

// Mock data
const data = {
  ecole: {
    nom: "Ecole Test",
    annee_scolaire: "2025-2026",
    adresse: "Dakar, Sénégal",
    telephone: "770000000",
  },
  eleve: {
    nom: "DIOP",
    prenom: "Moussa",
    matricule: "MAT-TEST-001",
    classe: "6ème A",
  },
  paiement: {
    recu_numero: "RECU-TEST-001",
    mois: 1,
    annee: 2025,
    montant: 25000,
    mode: "ESPECES",
    date_paiement: new Date().toISOString(),
    enregistre_par: "Comptable Test",
  },
  logoBase64: null
};

async function test() {
  try {
    console.log("Démarrage du test de génération PDF...");
    const buffer = await genererRecuPDF(data);
    const outputPath = path.join(__dirname, 'test-recu.pdf');
    fs.writeFileSync(outputPath, buffer);
    console.log("PDF généré avec succès : " + outputPath);
    console.log("Taille du fichier : " + fs.statSync(outputPath).size + " octets");
  } catch (error) {
    console.error("Erreur pendant le test :", error);
    process.exit(1);
  }
}

test();
