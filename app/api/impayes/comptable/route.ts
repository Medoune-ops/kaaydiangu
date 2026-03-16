import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — liste détaillée des impayés pour le comptable
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const classeId = req.nextUrl.searchParams.get("classe_id");

  const now = new Date();

  // Tous les élèves avec au moins un mois impayé
  const where: Record<string, unknown> = {
    actif: true,
    classe: { ecole_id: session.user.ecoleId },
    paiements: { some: { statut: "NON_PAYE" } },
  };
  if (classeId) {
    where.classe_id = classeId;
  }

  const eleves = await prisma.eleve.findMany({
    where,
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      email_parent: true,
      telephone_parent: true,
      user_id: true,
      classe: { select: { id: true, nom: true, niveau: true } },
      paiements: {
        where: { statut: "NON_PAYE" },
        select: { id: true, mois: true, annee: true },
        orderBy: [{ annee: "asc" }, { mois: "asc" }],
      },
    },
    orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
  });

  const MOIS_NOMS = [
    "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const result = eleves.map((e) => {
    // Calculer le retard en jours depuis le plus ancien mois impayé
    const plusAncien = e.paiements[0];
    let joursRetard = 0;
    if (plusAncien) {
      const debutMois = new Date(plusAncien.annee, plusAncien.mois - 1, 1);
      joursRetard = Math.max(
        0,
        Math.floor((now.getTime() - debutMois.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    return {
      id: e.id,
      nom: e.nom,
      prenom: e.prenom,
      matricule: e.matricule,
      email_parent: e.email_parent,
      telephone_parent: e.telephone_parent,
      user_id: e.user_id,
      classe: e.classe,
      mois_impayes: e.paiements.map(
        (p) => `${MOIS_NOMS[p.mois]} ${p.annee}`
      ),
      nombre_mois_impayes: e.paiements.length,
      jours_retard: joursRetard,
    };
  });

  // Classes pour le filtre
  const classes = await prisma.classe.findMany({
    where: { ecole_id: session.user.ecoleId },
    select: { id: true, nom: true, niveau: true },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  return NextResponse.json({ eleves: result, classes });
}
