import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Tous les mois de l'année scolaire (Oct 2025 → Juin 2026)
const MOIS_ANNEE = [
  { mois: 10, annee: 2025 },
  { mois: 11, annee: 2025 },
  { mois: 12, annee: 2025 },
  { mois: 1,  annee: 2026 },
  { mois: 2,  annee: 2026 },
  { mois: 3,  annee: 2026 },
  { mois: 4,  annee: 2026 },
  { mois: 5,  annee: 2026 },
  { mois: 6,  annee: 2026 },
];

type MoisAnnee = { mois: number; annee: number };

function moisIndex(m: MoisAnnee): number {
  return m.annee * 100 + m.mois;
}

// Retourne true si debut <= m <= jusqu_a
function estPaye(m: MoisAnnee, debut: MoisAnnee, jusqu_a: MoisAnnee): boolean {
  return moisIndex(m) >= moisIndex(debut) && moisIndex(m) <= moisIndex(jusqu_a);
}

let recuCounter = 0;
function nextRecu(): string {
  recuCounter++;
  return `RECU-2025-${String(recuCounter).padStart(5, "0")}`;
}

async function creerEleve(params: {
  matricule: string;
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  classe_id: string;
  ecole_id: string;
  comptable_id: string;
  inscription_payee: boolean;
  debut_a: MoisAnnee;           // mois d'entrée dans l'école
  paye_jusqu_a: MoisAnnee | null; // null = aucun mois mensuel payé
  montant_mensualite: number;
  montant_inscription: number;
}) {
  const emailBase = `${params.prenom.toLowerCase().replace(/[^a-z]/g, "")}.${params.nom.toLowerCase().replace(/[^a-z]/g, "")}`;
  const email = `${emailBase}.${params.matricule.slice(-3)}@kaaydiangu.sn`;

  const user = await prisma.user.create({
    data: {
      nom: params.nom,
      prenom: params.prenom,
      email,
      mot_de_passe: await bcrypt.hash("password123", 10),
      role: "ELEVE",
      ecole_id: params.ecole_id,
    },
  });

  const eleve = await prisma.eleve.create({
    data: {
      matricule: params.matricule,
      nom: params.nom,
      prenom: params.prenom,
      sexe: params.sexe,
      classe_id: params.classe_id,
      user_id: user.id,
    },
  });

  // Inscription (mois = 0)
  await prisma.paiement.create({
    data: {
      mois: 0,
      annee: 2025,
      montant: params.inscription_payee ? params.montant_inscription : 0,
      statut: params.inscription_payee ? "PAYE" : "NON_PAYE",
      date_paiement: params.inscription_payee ? new Date(params.debut_a.annee, params.debut_a.mois - 1, 1) : null,
      mode: params.inscription_payee ? "ESPECES" : null,
      recu_numero: params.inscription_payee ? nextRecu() : null,
      eleve_id: eleve.id,
      enregistre_par_id: params.inscription_payee ? params.comptable_id : null,
    },
  });

  // Paiements mensuels — uniquement depuis le mois d'entrée
  const moisEleve = MOIS_ANNEE.filter((m) => moisIndex(m) >= moisIndex(params.debut_a));
  for (const m of moisEleve) {
    const paye = params.paye_jusqu_a ? estPaye(m, params.debut_a, params.paye_jusqu_a) : false;
    await prisma.paiement.create({
      data: {
        mois: m.mois,
        annee: m.annee,
        montant: paye ? params.montant_mensualite : 0,
        statut: paye ? "PAYE" : "NON_PAYE",
        date_paiement: paye ? new Date(m.annee, m.mois - 1, 5) : null,
        mode: paye ? "ESPECES" : null,
        recu_numero: paye ? nextRecu() : null,
        eleve_id: eleve.id,
        enregistre_par_id: paye ? params.comptable_id : null,
      },
    });
  }

  return eleve;
}

async function main() {
  console.log("🌱 Début du seed...\n");

  console.log("🗑️  Nettoyage de la base...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cours.deleteMany();
  await prisma.emploiDuTemps.deleteMany();
  await prisma.appreciation.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.note.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.depense.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.eleve.deleteMany();
  await prisma.user.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.ecole.deleteMany();

  // ═══════════════════════════════════════
  // 1. ÉCOLE
  // ═══════════════════════════════════════
  console.log("🏫 Création de l'école...");
  const ecole = await prisma.ecole.create({
    data: {
      nom: "École Kaaydiangu",
      slogan: "L'excellence au service de la jeunesse sénégalaise",
      adresse: "Parcelles Assainies Unité 25, Dakar",
      telephone: "+221 33 867 45 12",
      email: "contact@kaaydiangu.sn",
      annee_scolaire: "2025-2026",
      frais_inscription: 25000,
      impaye_seuil_jours: 30,
      impaye_liste_active: true,
    },
  });

  // ═══════════════════════════════════════
  // 2. PERSONNEL
  // ═══════════════════════════════════════
  console.log("👥 Création des comptes personnel...");
  const mdpHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { nom: "Diop", prenom: "Amadou", email: "admin@kaaydiangu.sn", mot_de_passe: mdpHash, role: "SUPER_ADMIN", ecole_id: ecole.id },
  });
  await prisma.user.create({
    data: { nom: "Ndiaye", prenom: "Marième", email: "censeur@kaaydiangu.sn", mot_de_passe: mdpHash, role: "CENSEUR", ecole_id: ecole.id },
  });
  const comptable = await prisma.user.create({
    data: { nom: "Fall", prenom: "Ibrahima", email: "comptable@kaaydiangu.sn", mot_de_passe: mdpHash, role: "COMPTABLE", ecole_id: ecole.id },
  });

  // ═══════════════════════════════════════
  // 3. CLASSES
  // ═══════════════════════════════════════
  console.log("📚 Création des classes...");
  const classesData = [
    { nom: "Petite Section",  niveau: "Maternelle", frais_inscription: 24000, montant_scolarite: 8000  },
    { nom: "Moyenne Section", niveau: "Maternelle", frais_inscription: 24000, montant_scolarite: 8000  },
    { nom: "Grande Section",  niveau: "Maternelle", frais_inscription: 24000, montant_scolarite: 8000  },
    { nom: "CI",              niveau: "Primaire",   frais_inscription: 25000, montant_scolarite: 9000  },
    { nom: "CP",              niveau: "Primaire",   frais_inscription: 25000, montant_scolarite: 9000  },
    { nom: "CE1",             niveau: "Primaire",   frais_inscription: 27000, montant_scolarite: 10000 },
    { nom: "CE2",             niveau: "Primaire",   frais_inscription: 27000, montant_scolarite: 10000 },
    { nom: "CM1",             niveau: "Primaire",   frais_inscription: 28000, montant_scolarite: 11000 },
    { nom: "CM2",             niveau: "Primaire",   frais_inscription: 28000, montant_scolarite: 11000 },
  ];

  const classes: Record<string, { id: string; frais_inscription: number; montant_scolarite: number }> = {};
  for (const c of classesData) {
    const created = await prisma.classe.create({
      data: { nom: c.nom, niveau: c.niveau, annee_scolaire: "2025-2026", frais_inscription: c.frais_inscription, montant_scolarite: c.montant_scolarite, ecole_id: ecole.id },
    });
    classes[c.nom] = { id: created.id, frais_inscription: c.frais_inscription, montant_scolarite: c.montant_scolarite };
  }

  const OCT  = { mois: 10, annee: 2025 };
  const NOV  = { mois: 11, annee: 2025 };
  const DEC  = { mois: 12, annee: 2025 };
  const JAN  = { mois: 1,  annee: 2026 };

  let num = 1;
  const totalEleves: number[] = [];

  // ═══════════════════════════════════════
  // 4. PETITE SECTION (8 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 Petite Section...");
  const ps = classes["Petite Section"];
  const elevesPS = [
    { prenom: "Oumou",               nom: "Diallo",         sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 3,  annee: 2026 }, inscrip: true },
    { prenom: "Fatoumata Binetou",   nom: "Badji",          sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 2,  annee: 2026 }, inscrip: true },
    { prenom: "Fatou S.",            nom: "Cissokho Donde", sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4,  annee: 2026 }, inscrip: true },
    { prenom: "Marième",             nom: "Ndiaye",         sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4,  annee: 2026 }, inscrip: true },
    { prenom: "Princesse Onyinychi", nom: "Nnabuo",         sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4,  annee: 2026 }, inscrip: true },
    { prenom: "Pape Amadou",         nom: "Diao",           sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4,  annee: 2026 }, inscrip: true },
    { prenom: "Sarata",              nom: "Diédhiou",       sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5,  annee: 2026 }, inscrip: true },
    { prenom: "Jean Claude",         nom: "Diouf",          sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 11, annee: 2025 }, inscrip: true },
  ];
  for (const e of elevesPS) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: ps.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: ps.montant_scolarite, montant_inscription: ps.frais_inscription });
    num++;
  }
  totalEleves.push(elevesPS.length);

  // ═══════════════════════════════════════
  // 5. MOYENNE SECTION (7 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 Moyenne Section...");
  const ms = classes["Moyenne Section"];
  const elevesMS = [
    { prenom: "Marième",        nom: "Watt",    sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Ababacar",       nom: "Faye",    sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Aissatou",       nom: "Diédhiou",sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Maimouna",       nom: "Diatta",  sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Aminata",        nom: "Mane",    sexe: "F" as const, debut: NOV, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Emmanuel Pascal",nom: "Bindia",  sexe: "M" as const, debut: NOV, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Moustapha",      nom: "Badji",   sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 3, annee: 2026 }, inscrip: false },
  ];
  for (const e of elevesMS) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: ms.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: ms.montant_scolarite, montant_inscription: ms.frais_inscription });
    num++;
  }
  totalEleves.push(elevesMS.length);

  // ═══════════════════════════════════════
  // 6. GRANDE SECTION (7 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 Grande Section...");
  const gs = classes["Grande Section"];
  const elevesGS = [
    { prenom: "Cheikh Ahmadou Bouba", nom: "Cissé",   sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 1, annee: 2026 }, inscrip: true },
    { prenom: "Mouhamed Assane",      nom: "Mbaye",   sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true },
    { prenom: "Alimatou Sadya",       nom: "Guène",   sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true },
    { prenom: "Fatoumata Bintou",     nom: "Diouane", sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true },
    { prenom: "Marie",                nom: "Mendy",   sexe: "F" as const, debut: NOV, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true },
    { prenom: "Zahra",                nom: "Ndiaye",  sexe: "F" as const, debut: NOV, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true },
    { prenom: "Abdalinah",            nom: "Dia",     sexe: "M" as const, debut: JAN, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true },
  ];
  for (const e of elevesGS) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: gs.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: gs.montant_scolarite, montant_inscription: gs.frais_inscription });
    num++;
  }
  totalEleves.push(elevesGS.length);

  // ═══════════════════════════════════════
  // 7. CI (19 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CI...");
  const ci = classes["CI"];
  const elevesCI = [
    { prenom: "Serigne Saliou",      nom: "Diongue",  sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Ramatoulaye Anta",    nom: "Thiam",    sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Sounabou",            nom: "Diarra",   sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Houlaymatou",         nom: "Diallo",   sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Pape Cheikh",         nom: "Gueye",    sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Rabia",               nom: "Ndao",     sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Mame Cheikh",         nom: "Diop",     sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Soda",                nom: "Ndoye",    sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Idy",                 nom: "Ndoye",    sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Ndeye Fatou",         nom: "Guène",    sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Daouda",              nom: "Kandé",    sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 2, annee: 2026 }, inscrip: true  },
    { prenom: "Pape Ibrahima",       nom: "Kane",     sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 3, annee: 2026 }, inscrip: false },
    { prenom: "Mbeugué",             nom: "Mbodj",    sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true  },
    { prenom: "Mouhamed Alyassine",  nom: "Sidibé",   sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 3, annee: 2026 }, inscrip: true  },
    { prenom: "Pape Ablaye",         nom: "Sarr",     sexe: "M" as const, debut: NOV, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Zeynab",              nom: "Ndiaye",   sexe: "F" as const, debut: NOV, paye_jusqu_a: DEC,                      inscrip: true  },
    { prenom: "Mouhamed",            nom: "Konté",    sexe: "M" as const, debut: NOV, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Cheikh Mafou",        nom: "Diémé",    sexe: "M" as const, debut: NOV, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
    { prenom: "Bassirou",            nom: "Dia",      sexe: "M" as const, debut: JAN, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true  },
  ];
  for (const e of elevesCI) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: ci.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: ci.montant_scolarite, montant_inscription: ci.frais_inscription });
    num++;
  }
  totalEleves.push(elevesCI.length);

  // ═══════════════════════════════════════
  // 8. CP (15 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CP...");
  const cp = classes["CP"];
  const elevesCP = [
    { prenom: "Arame",               nom: "Ndiaye Ndiour", sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 6, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Houlaymatou",         nom: "Dabo",          sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Rockyatou",           nom: "Ba",            sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Mouhamadou Mountakha",nom: "Sène",          sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Khadidiatou",         nom: "Dondé",         sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Cheikh Kalla",        nom: "Gueye",         sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Mouhamed Fadel",      nom: "Diop",          sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Arame",               nom: "Souaré",        sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Serigne Fallou",      nom: "Faye",          sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Adama Awa",           nom: "Diallo",        sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Sidiki",              nom: "Diallo",        sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Serigne Saliou",      nom: "Fall",          sexe: "M" as const, debut: OCT, paye_jusqu_a: { mois: 4, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Alima",               nom: "Badji",         sexe: "F" as const, debut: OCT, paye_jusqu_a: { mois: 3, annee: 2026 }, inscrip: false, montant_insc: cp.frais_inscription },
    { prenom: "Mame Anta",           nom: "Diène",         sexe: "F" as const, debut: NOV, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: cp.frais_inscription },
    { prenom: "Aïcha",               nom: "Lo",            sexe: "F" as const, debut: NOV, paye_jusqu_a: { mois: 5, annee: 2026 }, inscrip: true,  montant_insc: 17000               },
  ];
  for (const e of elevesCP) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: cp.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: cp.montant_scolarite, montant_inscription: e.montant_insc });
    num++;
  }
  totalEleves.push(elevesCP.length);

  // ═══════════════════════════════════════
  // 9. CE1 (25 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CE1...");
  const ce1 = classes["CE1"];
  const MAI  = { mois: 5, annee: 2026 };
  const AVR  = { mois: 4, annee: 2026 };
  const MARS = { mois: 3, annee: 2026 };

  const elevesCE1 = [
    // Groupe 1 — inscrip + oct → mai
    { prenom: "Mouhamed Seydou",      nom: "Tall",    sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Serigne Souhaibou",    nom: "Diongue", sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Mouhamadou Bassirou",  nom: "Diongue", sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Adaratou Maguette",    nom: "Der",     sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Tabara",               nom: "Fall",    sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Sarata",               nom: "Fall",    sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Maman Diogope",        nom: "Diouf",   sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Diaryatou",            nom: "Mane",    sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Fatimata",             nom: "Diédhiou",sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Mariama",              nom: "Ndiaye",  sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Fatima",               nom: "Ndiaye",  sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: ce1.montant_scolarite },
    // Groupe 2 — inscrip + oct → avril
    { prenom: "Mouhamadou",           nom: "Thiam",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Mouhamadou Fadel",     nom: "Gueye",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Khadidja",             nom: "Watt",    sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Mansour",              nom: "Watt",    sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Nogaye",               nom: "Mbaye",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Mouhamed",             nom: "Faye",    sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Aby",                  nom: "Diouf",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Lyka",                 nom: "Kane",    sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Seynabou",             nom: "Ndoye",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Abdou Aziz",           nom: "Sagna",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    // Individuels
    { prenom: "Rockaya Bintou Rassoul", nom: "Sarr",  sexe: "F" as const, debut: NOV, paye_jusqu_a: AVR,  inscrip: true,  mensualite: ce1.montant_scolarite },
    { prenom: "Cheikh Mbacké",        nom: "Fall",    sexe: "M" as const, debut: OCT, paye_jusqu_a: MARS, inscrip: false, mensualite: ce1.montant_scolarite },
    { prenom: "Mame Cheikh",          nom: "Fall",    sexe: "M" as const, debut: OCT, paye_jusqu_a: MARS, inscrip: false, mensualite: ce1.montant_scolarite },
    { prenom: "Amadou",               nom: "Ba",      sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: 7000                   },
  ];
  for (const e of elevesCE1) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: ce1.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: e.mensualite, montant_inscription: ce1.frais_inscription });
    num++;
  }
  totalEleves.push(elevesCE1.length);

  // ═══════════════════════════════════════
  // 10. CE2 (7 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CE2...");
  const ce2 = classes["CE2"];
  const elevesCE2 = [
    // Groupe 1 — inscrip + oct → avril
    { prenom: "Mouhamed",             nom: "Gueye",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    { prenom: "Isah",                 nom: "Dondé",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    { prenom: "Mbayang",              nom: "Mboup",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    { prenom: "Mouhamadou Moustapha", nom: "Diop",    sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    { prenom: "Idrissa Saidou",       nom: "Konté",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    // Individuels
    { prenom: "Fatou Ndour",          nom: "Faye",    sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI, inscrip: true, montant_insc: ce2.frais_inscription, mensualite: ce2.montant_scolarite },
    { prenom: "Adji Fatou",           nom: "Lo",      sexe: "F" as const, debut: NOV, paye_jusqu_a: MAI, inscrip: true, montant_insc: 18000,                 mensualite: ce2.montant_scolarite },
  ];
  for (const e of elevesCE2) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: ce2.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: e.mensualite, montant_inscription: e.montant_insc });
    num++;
  }
  totalEleves.push(elevesCE2.length);

  // ═══════════════════════════════════════
  // 11. CM1 (5 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CM1...");
  const cm1 = classes["CM1"];
  const elevesCM1 = [
    // Groupe 1 — inscrip + oct → mai
    { prenom: "Khadidia",       nom: "Dabo",   sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI, inscrip: true, mensualite: cm1.montant_scolarite },
    { prenom: "Mamadou Saliou", nom: "Diallo", sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI, inscrip: true, mensualite: cm1.montant_scolarite },
    { prenom: "Seynabou",       nom: "Diallo", sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI, inscrip: true, mensualite: cm1.montant_scolarite },
    // Groupe 2 — inscrip + oct → avril
    { prenom: "Fatimata",       nom: "Loum",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, mensualite: cm1.montant_scolarite },
    { prenom: "Thierno Ahmeth", nom: "Kane",   sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR, inscrip: true, mensualite: cm1.montant_scolarite },
  ];
  for (const e of elevesCM1) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: cm1.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: e.mensualite, montant_inscription: cm1.frais_inscription });
    num++;
  }
  totalEleves.push(elevesCM1.length);

  // ═══════════════════════════════════════
  // 12. CM2 (12 élèves)
  // ═══════════════════════════════════════
  console.log("🎓 CM2...");
  const cm2 = classes["CM2"];
  const elevesCM2 = [
    // Groupe 1 — inscrip + oct → mai
    { prenom: "Aby Samba",        nom: "Ndiour",  sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Ousseynou",        nom: "Sène",    sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Cheikh Tidiane",   nom: "Ndao",    sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Pape Cheikh",      nom: "Diouf",   sexe: "M" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Fatoumata",        nom: "Traoré",  sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Nadège Pita",      nom: "Mane",    sexe: "F" as const, debut: OCT, paye_jusqu_a: MAI,  inscrip: true,  mensualite: cm2.montant_scolarite },
    // Groupe 2 — inscrip + oct → avril
    { prenom: "Tabara",           nom: "Thiam",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Astou",            nom: "Ndoye",   sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Mouhamed",         nom: "Ndiaye",  sexe: "M" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Selly",            nom: "Faye",    sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: cm2.montant_scolarite },
    { prenom: "Nema Aicha",       nom: "Ndiaye",  sexe: "F" as const, debut: OCT, paye_jusqu_a: AVR,  inscrip: true,  mensualite: cm2.montant_scolarite },
    // Individuel
    { prenom: "Mouhamed Al Amine",nom: "Sarr",    sexe: "M" as const, debut: NOV, paye_jusqu_a: MAI,  inscrip: false, mensualite: cm2.montant_scolarite },
  ];
  for (const e of elevesCM2) {
    await creerEleve({ matricule: `KDG-2025-${String(num).padStart(3, "0")}`, ...e, classe_id: cm2.id, ecole_id: ecole.id, comptable_id: comptable.id, debut_a: e.debut, inscription_payee: e.inscrip, montant_mensualite: e.mensualite, montant_inscription: cm2.frais_inscription });
    num++;
  }
  totalEleves.push(elevesCM2.length);

  // ═══════════════════════════════════════
  // AUDIT LOG
  // ═══════════════════════════════════════
  await prisma.auditLog.create({
    data: { action: "SEED_INITIAL", auteur_id: admin.id, details: { info: "Données réelles complètes — PS→CM2" } },
  });

  const total = totalEleves.reduce((a, b) => a + b, 0);
  console.log("\n✅ Seed terminé !\n");
  console.log("════════════════════════════════════════");
  console.log("  🏫 École   : École Kaaydiangu");
  console.log("  📚 Classes : 9 (PS → CM2)");
  console.log(`  🎓 Élèves  : ${total} (PS:${elevesPS.length} MS:${elevesMS.length} GS:${elevesGS.length} CI:${elevesCI.length} CP:${elevesCP.length} CE1:${elevesCE1.length} CE2:${elevesCE2.length} CM1:${elevesCM1.length} CM2:${elevesCM2.length})`);
  console.log("════════════════════════════════════════");
  console.log("  Admin     : admin@kaaydiangu.sn     / password123");
  console.log("  Comptable : comptable@kaaydiangu.sn / password123");
  console.log("  Censeur   : censeur@kaaydiangu.sn   / password123");
  console.log("════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
