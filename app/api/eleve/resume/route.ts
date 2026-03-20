import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const eleve = await prisma.eleve.findFirst({
    where: { user_id: session.user.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      classe_id: true,
      classe: { select: { id: true, nom: true, niveau: true } },
    },
  });

  if (!eleve) {
    return NextResponse.json({ error: "Profil élève introuvable" }, { status: 404 });
  }

  // Dernière séquence avec des notes
  const derniereNote = await prisma.note.findFirst({
    where: { eleve_id: eleve.id },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  const sequence = derniereNote?.sequence || 1;

  // Notes par matière pour cette séquence
  const matieres = await prisma.matiere.findMany({
    where: { classe_id: eleve.classe_id },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, coefficient: true },
  });

  const notes = await prisma.note.findMany({
    where: { eleve_id: eleve.id, sequence },
    select: { valeur: true, type: true, matiere_id: true },
  });

  const matieresData = matieres.map((mat) => {
    const notesMatiere = notes.filter((n) => n.matiere_id === mat.id);
    const moyenne =
      notesMatiere.length > 0
        ? Math.round(
            (notesMatiere.reduce((s, n) => s + n.valeur, 0) / notesMatiere.length) * 100
          ) / 100
        : null;
    return {
      nom: mat.nom,
      coefficient: mat.coefficient,
      notes: notesMatiere.map((n) => ({ valeur: n.valeur, type: n.type })),
      moyenne,
    };
  });

  // Moyenne générale pondérée
  const avecMoyenne = matieresData.filter((m) => m.moyenne !== null);
  let moyenneGenerale: number | null = null;
  if (avecMoyenne.length > 0) {
    const tp = avecMoyenne.reduce((s, m) => s + m.moyenne! * m.coefficient, 0);
    const tc = avecMoyenne.reduce((s, m) => s + m.coefficient, 0);
    moyenneGenerale = tc > 0 ? Math.round((tp / tc) * 100) / 100 : null;
  }

  // Rang
  const classeEleves = await prisma.eleve.findMany({
    where: { classe_id: eleve.classe_id, actif: true },
    select: {
      id: true,
      notes: {
        where: { sequence },
        select: { valeur: true, matiere: { select: { coefficient: true } } },
      },
    },
  });

  const moyennesClasse = classeEleves
    .map((ce) => {
      if (ce.notes.length === 0) return { id: ce.id, moy: null };
      const tp = ce.notes.reduce((s, n) => s + n.valeur * n.matiere.coefficient, 0);
      const tc = ce.notes.reduce((s, n) => s + n.matiere.coefficient, 0);
      return { id: ce.id, moy: tc > 0 ? tp / tc : null };
    })
    .filter((m) => m.moy !== null)
    .sort((a, b) => b.moy! - a.moy!);

  const rang = moyennesClasse.findIndex((m) => m.id === eleve.id) + 1;
  const totalEleves = moyennesClasse.length;

  // Paiements
  const paiements = await prisma.paiement.findMany({
    where: { eleve_id: eleve.id },
    orderBy: [{ annee: "asc" }, { mois: "asc" }],
    select: {
      id: true,
      mois: true,
      annee: true,
      montant: true,
      statut: true,
      recu_numero: true,
      date_paiement: true,
      mode: true,
    },
  });
  const moisRestants = paiements.filter((p) => p.statut === "NON_PAYE").length;

  // Absences
  const absences = await prisma.absence.findMany({
    where: { eleve_id: eleve.id },
    select: { duree_heures: true, justifiee: true },
  });
  const totalAbsences = absences.length;
  const totalHeures = absences.reduce((s, a) => s + a.duree_heures, 0);
  const absencesNonJustifiees = absences.filter((a) => !a.justifiee).length;

  // Notifications
  const notifications = await prisma.notification.findMany({
    where: { destinataire_id: session.user.id },
    orderBy: { date_envoi: "desc" },
    take: 20,
    select: {
      id: true,
      titre: true,
      message: true,
      lu: true,
      type: true,
      date_envoi: true,
    },
  });

  return NextResponse.json({
    eleve: {
      id: eleve.id,
      nom: eleve.nom,
      prenom: eleve.prenom,
      matricule: eleve.matricule,
      classe: eleve.classe,
    },
    sequence,
    matieres: matieresData,
    moyenneGenerale,
    rang: rang || 1,
    totalEleves,
    paiements,
    moisRestants,
    totalAbsences,
    totalHeures,
    absencesNonJustifiees,
    notifications,
  });
  } catch (error) {
    console.error("[ELEVE_RESUME_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
