import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — stats absences par élève pour une classe
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const classeId = req.nextUrl.searchParams.get("classe_id");
  if (!classeId) {
    return NextResponse.json({ error: "classe_id requis" }, { status: 400 });
  }

  const eleves = await prisma.eleve.findMany({
    where: { classe_id: classeId, actif: true },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      absences: {
        select: {
          id: true,
          date: true,
          duree_heures: true,
          justifiee: true,
          matiere: { select: { nom: true } },
        },
      },
    },
    orderBy: [{ nom: "asc" }],
  });

  const stats = eleves.map((e) => {
    const totalAbsences = e.absences.length;
    const totalHeures = e.absences.reduce((s, a) => s + a.duree_heures, 0);
    const nonJustifiees = e.absences.filter((a) => !a.justifiee).length;

    return {
      id: e.id,
      nom: e.nom,
      prenom: e.prenom,
      matricule: e.matricule,
      totalAbsences,
      totalHeures,
      nonJustifiees,
    };
  });

  return NextResponse.json(stats);
}
