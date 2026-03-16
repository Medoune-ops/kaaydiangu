import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── DONNÉES DE DÉMO ───

const PRENOMS_GARCONS = [
  "Moussa", "Ibrahima", "Ousmane", "Abdoulaye", "Mamadou",
  "Cheikh", "Modou", "Pape", "Aliou", "Babacar",
  "Saliou", "Daouda", "El Hadji", "Serigne", "Malick",
];

const PRENOMS_FILLES = [
  "Fatou", "Aminata", "Awa", "Mariama", "Khady",
  "Ndèye", "Aïssatou", "Coumba", "Sokhna", "Mame",
];

const NOMS = [
  "Diop", "Ndiaye", "Fall", "Sow", "Ba",
  "Diallo", "Sy", "Mbaye", "Gueye", "Sarr",
  "Cissé", "Thiam", "Faye", "Kane", "Diouf",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
  console.log("🌱 Début du seed...\n");

  // Nettoyer la base
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
  // 2. UTILISATEURS PERSONNEL
  // ═══════════════════════════════════════
  console.log("👥 Création des comptes personnel...");
  const mdpHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      nom: "Diop", prenom: "Amadou",
      email: "admin@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "SUPER_ADMIN",
      ecole_id: ecole.id,
    },
  });

  const censeur = await prisma.user.create({
    data: {
      nom: "Ndiaye", prenom: "Marième",
      email: "censeur@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "CENSEUR",
      ecole_id: ecole.id,
    },
  });

  const comptable = await prisma.user.create({
    data: {
      nom: "Fall", prenom: "Ibrahima",
      email: "comptable@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "COMPTABLE",
      ecole_id: ecole.id,
    },
  });

  const prof1 = await prisma.user.create({
    data: {
      nom: "Sy", prenom: "Ousmane",
      email: "prof.maths@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "PROFESSEUR",
      ecole_id: ecole.id,
    },
  });

  const prof2 = await prisma.user.create({
    data: {
      nom: "Ba", prenom: "Aïssatou",
      email: "prof.francais@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "PROFESSEUR",
      ecole_id: ecole.id,
    },
  });

  const prof3 = await prisma.user.create({
    data: {
      nom: "Gueye", prenom: "Cheikh",
      email: "prof.svt@kaaydiangu.sn",
      mot_de_passe: mdpHash, role: "PROFESSEUR",
      ecole_id: ecole.id,
    },
  });

  // ═══════════════════════════════════════
  // 3. CLASSES
  // ═══════════════════════════════════════
  console.log("📚 Création des classes...");
  const classe6A = await prisma.classe.create({
    data: { nom: "6ème A", niveau: "6ème", annee_scolaire: "2025-2026", montant_scolarite: 15000, ecole_id: ecole.id },
  });
  const classe6B = await prisma.classe.create({
    data: { nom: "6ème B", niveau: "6ème", annee_scolaire: "2025-2026", montant_scolarite: 15000, ecole_id: ecole.id },
  });
  const classe5A = await prisma.classe.create({
    data: { nom: "5ème A", niveau: "5ème", annee_scolaire: "2025-2026", montant_scolarite: 18000, ecole_id: ecole.id },
  });
  const classe4A = await prisma.classe.create({
    data: { nom: "4ème A", niveau: "4ème", annee_scolaire: "2025-2026", montant_scolarite: 20000, ecole_id: ecole.id },
  });
  const classe3A = await prisma.classe.create({
    data: { nom: "3ème A", niveau: "3ème", annee_scolaire: "2025-2026", montant_scolarite: 22000, ecole_id: ecole.id },
  });

  const allClasses = [classe6A, classe6B, classe5A, classe4A, classe3A];

  // ═══════════════════════════════════════
  // 4. MATIÈRES
  // ═══════════════════════════════════════
  console.log("📖 Création des matières...");
  const matieresParClasse: Record<string, Awaited<ReturnType<typeof prisma.matiere.create>>[]> = {};

  for (const classe of allClasses) {
    const matieresDefs = [
      { nom: "Mathématiques", coefficient: 4, professeur_id: prof1.id },
      { nom: "Français", coefficient: 4, professeur_id: prof2.id },
      { nom: "SVT", coefficient: 2, professeur_id: prof3.id },
      { nom: "Histoire-Géo", coefficient: 2, professeur_id: null },
      { nom: "Anglais", coefficient: 2, professeur_id: null },
      { nom: "EPS", coefficient: 1, professeur_id: null },
    ];

    matieresParClasse[classe.id] = [];
    for (const m of matieresDefs) {
      const matiere = await prisma.matiere.create({
        data: {
          nom: m.nom,
          coefficient: m.coefficient,
          classe_id: classe.id,
          professeur_id: m.professeur_id,
        },
      });
      matieresParClasse[classe.id].push(matiere);
    }
  }

  // ═══════════════════════════════════════
  // 5. ÉLÈVES (5 par classe = 25 total)
  // ═══════════════════════════════════════
  console.log("🎓 Création des élèves...");
  const allEleves: Awaited<ReturnType<typeof prisma.eleve.create>>[] = [];
  let eleveCount = 0;

  for (const classe of allClasses) {
    for (let i = 0; i < 5; i++) {
      eleveCount++;
      const isFille = i >= 3;
      const prenom = isFille ? randomItem(PRENOMS_FILLES) : randomItem(PRENOMS_GARCONS);
      const nom = randomItem(NOMS);
      const matricule = `KDG-2025-${String(eleveCount).padStart(3, "0")}`;
      const emailEleve = `${prenom.toLowerCase().replace(/[^a-z]/g, "")}.${nom.toLowerCase()}${eleveCount}@kaaydiangu.sn`;

      const userEleve = await prisma.user.create({
        data: {
          nom, prenom,
          email: emailEleve,
          mot_de_passe: mdpHash,
          role: "ELEVE",
          ecole_id: ecole.id,
        },
      });

      const eleve = await prisma.eleve.create({
        data: {
          matricule, nom, prenom,
          date_naissance: new Date(2010 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
          sexe: isFille ? "F" : "M",
          nom_parent: `${randomItem(PRENOMS_GARCONS)} ${nom}`,
          telephone_parent: `+221 77 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
          email_parent: `parent.${nom.toLowerCase()}${eleveCount}@gmail.com`,
          adresse: "Dakar",
          classe_id: classe.id,
          user_id: userEleve.id,
        },
      });

      allEleves.push(eleve);
    }
  }

  // ═══════════════════════════════════════
  // 6. PAIEMENTS (10 mois Oct-Juil)
  // ═══════════════════════════════════════
  console.log("💳 Création des paiements...");
  const moisList: { mois: number; annee: number }[] = [];
  for (let m = 10; m <= 12; m++) moisList.push({ mois: m, annee: 2025 });
  for (let m = 1; m <= 7; m++) moisList.push({ mois: m, annee: 2026 });

  let recuCounter = 0;
  for (const eleve of allEleves) {
    const classeData = allClasses.find((c) => c.id === eleve.classe_id)!;
    for (const ml of moisList) {
      // Mois passés (Oct-Fev) : 70% payés, Mars+ : non payés
      const isPast = ml.annee === 2025 || (ml.annee === 2026 && ml.mois <= 2);
      const isPaid = isPast && Math.random() < 0.7;

      recuCounter++;
      await prisma.paiement.create({
        data: {
          mois: ml.mois,
          annee: ml.annee,
          montant: isPaid ? classeData.montant_scolarite : 0,
          statut: isPaid ? "PAYE" : "NON_PAYE",
          date_paiement: isPaid ? new Date(ml.annee, ml.mois - 1, 5 + Math.floor(Math.random() * 10)) : null,
          mode: isPaid ? randomItem(["ESPECES", "MOBILE_MONEY", "VIREMENT"] as const) : null,
          recu_numero: isPaid ? `RECU-${ml.annee}-${String(recuCounter).padStart(5, "0")}` : null,
          eleve_id: eleve.id,
          enregistre_par_id: isPaid ? comptable.id : null,
        },
      });
    }
  }

  // ═══════════════════════════════════════
  // 7. NOTES (séquences 1 et 2)
  // ═══════════════════════════════════════
  console.log("📝 Création des notes...");
  for (const eleve of allEleves) {
    const matieres = matieresParClasse[eleve.classe_id];
    for (const matiere of matieres) {
      for (const seq of [1, 2]) {
        // 1 contrôle + 1 devoir par matière par séquence
        await prisma.note.create({
          data: {
            valeur: randomFloat(5, 19),
            type: "CONTROLE",
            sequence: seq,
            date: new Date(seq === 1 ? "2025-11-15" : "2026-01-20"),
            eleve_id: eleve.id,
            matiere_id: matiere.id,
          },
        });
        await prisma.note.create({
          data: {
            valeur: randomFloat(4, 20),
            type: "DEVOIR",
            sequence: seq,
            date: new Date(seq === 1 ? "2025-12-10" : "2026-02-15"),
            eleve_id: eleve.id,
            matiere_id: matiere.id,
          },
        });
      }
    }
  }

  // ═══════════════════════════════════════
  // 8. ABSENCES
  // ═══════════════════════════════════════
  console.log("📋 Création des absences...");
  for (const eleve of allEleves) {
    const nbAbsences = Math.floor(Math.random() * 5);
    const matieres = matieresParClasse[eleve.classe_id];
    for (let i = 0; i < nbAbsences; i++) {
      await prisma.absence.create({
        data: {
          date: new Date(2025, 10 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28)),
          duree_heures: randomItem([1, 2, 2, 3, 4]),
          justifiee: Math.random() < 0.3,
          motif: randomItem([null, "Maladie", "Retard", "Absence non justifiée", null]),
          eleve_id: eleve.id,
          matiere_id: randomItem(matieres).id,
        },
      });
    }
  }

  // ═══════════════════════════════════════
  // 9. EMPLOI DU TEMPS
  // ═══════════════════════════════════════
  console.log("📅 Création des emplois du temps...");
  const jours: ("LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI")[] = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"];
  const creneaux = [
    { debut: "08:00", fin: "10:00" },
    { debut: "10:15", fin: "12:15" },
    { debut: "15:00", fin: "17:00" },
  ];

  for (const classe of allClasses) {
    const matieres = matieresParClasse[classe.id];
    let idx = 0;
    for (const jour of jours) {
      for (const creneau of creneaux) {
        const matiere = matieres[idx % matieres.length];
        await prisma.emploiDuTemps.create({
          data: {
            jour,
            heure_debut: creneau.debut,
            heure_fin: creneau.fin,
            salle: `Salle ${Math.floor(Math.random() * 20) + 1}`,
            matiere_id: matiere.id,
            classe_id: classe.id,
          },
        });
        idx++;
      }
    }
  }

  // ═══════════════════════════════════════
  // 10. DÉPENSES
  // ═══════════════════════════════════════
  console.log("💸 Création des dépenses...");
  const depenses = [
    { libelle: "Salaires enseignants - Octobre", montant: 850000, date: "2025-10-30", categorie: "SALAIRE" as const },
    { libelle: "Salaires enseignants - Novembre", montant: 850000, date: "2025-11-30", categorie: "SALAIRE" as const },
    { libelle: "Salaires enseignants - Décembre", montant: 850000, date: "2025-12-30", categorie: "SALAIRE" as const },
    { libelle: "Salaires enseignants - Janvier", montant: 850000, date: "2026-01-30", categorie: "SALAIRE" as const },
    { libelle: "Salaires enseignants - Février", montant: 850000, date: "2026-02-28", categorie: "SALAIRE" as const },
    { libelle: "Fournitures de bureau", montant: 45000, date: "2025-10-15", categorie: "FOURNITURE" as const },
    { libelle: "Cahiers et craies", montant: 32000, date: "2025-11-05", categorie: "FOURNITURE" as const },
    { libelle: "Réparation toiture", montant: 120000, date: "2025-12-20", categorie: "MAINTENANCE" as const },
    { libelle: "Peinture salles de classe", montant: 95000, date: "2026-01-10", categorie: "MAINTENANCE" as const },
    { libelle: "Fête de fin d'année", montant: 75000, date: "2025-12-22", categorie: "AUTRE" as const },
  ];

  for (const d of depenses) {
    await prisma.depense.create({
      data: {
        libelle: d.libelle,
        montant: d.montant,
        date: new Date(d.date),
        categorie: d.categorie,
        ecole_id: ecole.id,
        enregistre_par_id: comptable.id,
      },
    });
  }

  // ═══════════════════════════════════════
  // 11. NOTIFICATIONS
  // ═══════════════════════════════════════
  console.log("🔔 Création des notifications...");
  await prisma.notification.create({
    data: {
      titre: "Bienvenue",
      message: "Bienvenue sur la plateforme Kaaydiangu ! Votre compte a été créé avec succès.",
      type: "INFO",
      destinataire_id: admin.id,
    },
  });

  // Notifs pour quelques élèves
  for (const eleve of allEleves.slice(0, 10)) {
    await prisma.notification.create({
      data: {
        titre: "Nouvelle note",
        message: "Une note de contrôle en Mathématiques (séquence 1) a été saisie.",
        type: "NOTE",
        destinataire_id: eleve.user_id,
        lu: Math.random() < 0.5,
      },
    });
  }

  // ═══════════════════════════════════════
  // 12. AUDIT LOGS
  // ═══════════════════════════════════════
  console.log("📜 Création des logs d'audit...");
  await prisma.auditLog.create({
    data: { action: "SEED_INITIAL", auteur_id: admin.id, details: { info: "Données de démonstration générées" } },
  });

  // ═══════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════
  console.log("\n✅ Seed terminé avec succès !\n");
  console.log("════════════════════════════════════════");
  console.log("  🏫 École : École Kaaydiangu");
  console.log("  📚 Classes : 5 (6èmeA, 6èmeB, 5èmeA, 4èmeA, 3èmeA)");
  console.log(`  🎓 Élèves : ${allEleves.length}`);
  console.log("  📖 Matières : 6 par classe");
  console.log("  📝 Notes : séquences 1 et 2");
  console.log("════════════════════════════════════════");
  console.log("\n  🔐 COMPTES DE CONNEXION :");
  console.log("  ─────────────────────────────────────");
  console.log("  Admin     : admin@kaaydiangu.sn       / password123");
  console.log("  Censeur   : censeur@kaaydiangu.sn     / password123");
  console.log("  Comptable : comptable@kaaydiangu.sn   / password123");
  console.log("  Prof Maths: prof.maths@kaaydiangu.sn  / password123");
  console.log("  Prof Franç: prof.francais@kaaydiangu.sn / password123");
  console.log("  Prof SVT  : prof.svt@kaaydiangu.sn    / password123");
  console.log(`  Élève     : ${allEleves[0].matricule} → voir email en base`);
  console.log("  (Tous les MDP : password123)");
  console.log("════════════════════════════════════════\n");
  console.log("  Lancez : npm run dev");
  console.log("  Ouvrez : http://localhost:3000\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
