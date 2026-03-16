import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — retourne les données du bulletin en JSON (consultation élève)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const eleveId = searchParams.get("eleve_id");
  const sequenceStr = searchParams.get("sequence");

  if (!eleveId || !sequenceStr) {
    return NextResponse.json({ error: "eleve_id et sequence requis" }, { status: 400 });
  }

  const sequence = parseInt(sequenceStr);
  if (isNaN(sequence) || sequence < 1 || sequence > 6) {
    return NextResponse.json({ error: "Séquence invalide (1-6)" }, { status: 400 });
  }

  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      user: { select: { id: true } },
      classe: {
        include: {
          ecole: { select: { nom: true, annee_scolaire: true } },
          matieres: {
            include: { professeur: { select: { nom: true, prenom: true } } },
            orderBy: { nom: "asc" },
          },
        },
      },
    },
  });

  if (!eleve) return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });

  // Un élève ne peut voir que son propre bulletin
  if (session.user.role === "ELEVE" && eleve.user.id !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const notes = await prisma.note.findMany({
    where: { eleve_id: eleveId, sequence },
    include: { matiere: true },
  });

  const appreciations = await prisma.appreciation.findMany({
    where: { eleve_id: eleveId, sequence },
  });

  const matieresData = eleve.classe.matieres.map((mat) => {
    const notesMatiere = notes.filter((n) => n.matiere_id === mat.id);
    const moyenne =
      notesMatiere.length > 0
        ? notesMatiere.reduce((s, n) => s + n.valeur, 0) / notesMatiere.length
        : null;
    return {
      nom: mat.nom,
      coefficient: mat.coefficient,
      notes: notesMatiere.map((n) => ({ valeur: n.valeur, type: n.type })),
      moyenne: moyenne !== null ? Math.round(moyenne * 100) / 100 : null,
      appreciation: notesMatiere.find((n) => n.appreciation)?.appreciation || null,
    };
  });

  // Moyenne générale pondérée
  const avecMoyenne = matieresData.filter((m) => m.moyenne !== null);
  let moyenneGenerale: number | null = null;
  if (avecMoyenne.length > 0) {
    const totalPondere = avecMoyenne.reduce((s, m) => s + m.moyenne! * m.coefficient, 0);
    const totalCoef = avecMoyenne.reduce((s, m) => s + m.coefficient, 0);
    moyenneGenerale = totalCoef > 0 ? Math.round((totalPondere / totalCoef) * 100) / 100 : null;
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

  const rang = moyennesClasse.findIndex((m) => m.id === eleveId) + 1;

  const absences = await prisma.absence.findMany({ where: { eleve_id: eleveId } });

  return NextResponse.json({
    ecole: eleve.classe.ecole.nom,
    annee_scolaire: eleve.classe.ecole.annee_scolaire,
    eleve: { nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule },
    classe: eleve.classe.nom,
    sequence,
    matieres: matieresData,
    moyenneGenerale,
    rang: rang || 1,
    totalEleves: moyennesClasse.length,
    appreciationGenerale: appreciations.length > 0 ? appreciations[0].texte : null,
    totalAbsences: absences.length,
    totalHeuresAbsences: absences.reduce((s, a) => s + a.duree_heures, 0),
  });
}
