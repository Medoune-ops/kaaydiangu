import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const ecoleId = session.user.ecoleId;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // 1. Effectif total et par classe
  const classes = await prisma.classe.findMany({
    where: { ecole_id: ecoleId },
    select: {
      id: true,
      nom: true,
      niveau: true,
      _count: { select: { eleves: { where: { actif: true } } } },
    },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  const effectifTotal = classes.reduce((s, c) => s + c._count.eleves, 0);

  // 2. Taux de recouvrement global (mois courant)
  const totalMensualites = await prisma.paiement.count({
    where: {
      eleve: { classe: { ecole_id: ecoleId }, actif: true },
      mois: currentMonth,
      annee: currentYear,
    },
  });

  const mensualitesPayees = await prisma.paiement.count({
    where: {
      eleve: { classe: { ecole_id: ecoleId }, actif: true },
      mois: currentMonth,
      annee: currentYear,
      statut: "PAYE",
    },
  });

  const tauxRecouvrement =
    totalMensualites > 0
      ? Math.round((mensualitesPayees / totalMensualites) * 100)
      : 0;

  // 3. Moyenne générale de l'école (dernière séquence avec des notes)
  const derniereNote = await prisma.note.findFirst({
    where: { eleve: { classe: { ecole_id: ecoleId }, actif: true } },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  const lastSeq = derniereNote?.sequence || 1;

  const elevesAvecNotes = await prisma.eleve.findMany({
    where: { classe: { ecole_id: ecoleId }, actif: true },
    select: {
      id: true,
      notes: {
        where: { sequence: lastSeq },
        select: { valeur: true, matiere: { select: { coefficient: true } } },
      },
    },
  });

  let moyenneEcole: number | null = null;
  const moyennes: number[] = [];
  for (const e of elevesAvecNotes) {
    if (e.notes.length === 0) continue;
    const totalP = e.notes.reduce((s, n) => s + n.valeur * n.matiere.coefficient, 0);
    const totalC = e.notes.reduce((s, n) => s + n.matiere.coefficient, 0);
    if (totalC > 0) moyennes.push(totalP / totalC);
  }
  if (moyennes.length > 0) {
    moyenneEcole = Math.round((moyennes.reduce((s, m) => s + m, 0) / moyennes.length) * 100) / 100;
  }

  // 4. Élèves avec +3 absences non justifiées
  const elevesAbsences = await prisma.eleve.findMany({
    where: {
      classe: { ecole_id: ecoleId },
      actif: true,
      absences: { some: { justifiee: false } },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      classe: { select: { nom: true } },
      _count: { select: { absences: { where: { justifiee: false } } } },
    },
  });

  const elevesAbsencesFiltered = elevesAbsences
    .filter((e) => e._count.absences >= 3)
    .sort((a, b) => b._count.absences - a._count.absences)
    .map((e) => ({
      id: e.id,
      nom: e.nom,
      prenom: e.prenom,
      matricule: e.matricule,
      classe: e.classe.nom,
      absences_non_justifiees: e._count.absences,
    }));

  // 5. Élèves en retard de paiement (mois courant non payé)
  const elevesImpayes = await prisma.eleve.findMany({
    where: {
      classe: { ecole_id: ecoleId },
      actif: true,
      paiements: {
        some: {
          mois: currentMonth,
          annee: currentYear,
          statut: "NON_PAYE",
        },
      },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      classe: { select: { nom: true } },
      paiements: {
        where: { statut: "NON_PAYE" },
        select: { mois: true, annee: true },
        orderBy: [{ annee: "asc" }, { mois: "asc" }],
      },
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  const elevesImpayesList = elevesImpayes.map((e) => ({
    id: e.id,
    nom: e.nom,
    prenom: e.prenom,
    matricule: e.matricule,
    classe: e.classe.nom,
    mois_impayes: e.paiements.length,
  }));

  return NextResponse.json({
    effectifTotal,
    classes: classes.map((c) => ({
      id: c.id,
      nom: c.nom,
      niveau: c.niveau,
      effectif: c._count.eleves,
    })),
    tauxRecouvrement,
    moyenneEcole,
    sequenceRef: lastSeq,
    elevesAbsences: elevesAbsencesFiltered,
    nbAbsences: elevesAbsencesFiltered.length,
    elevesImpayes: elevesImpayesList,
    nbImpayes: elevesImpayesList.length,
  });
  } catch (error) {
    console.error("[ADMIN_STATS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
