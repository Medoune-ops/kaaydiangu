import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ecole = await prisma.ecole.findFirst();

    if (!ecole || !ecole.impaye_liste_active) {
      return NextResponse.json({ active: false, eleves: [] });
    }

    const now = new Date();
    const moisActuel = now.getMonth() + 1;
    const anneeActuelle = now.getFullYear();

    // Date seuil : seuls les élèves inscrits depuis plus de X jours apparaissent
    const dateSeuil = new Date();
    dateSeuil.setDate(dateSeuil.getDate() - ecole.impaye_seuil_jours);

    const eleves = await prisma.eleve.findMany({
      where: {
        actif: true,
        date_inscription: { lte: dateSeuil },
        paiements: {
          some: {
            mois: moisActuel,
            annee: anneeActuelle,
            statut: "NON_PAYE",
          },
        },
      },
      select: {
        nom: true,
        prenom: true,
        matricule: true,
        classe: {
          select: { nom: true },
        },
      },
      orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
    });

    return NextResponse.json({
      active: true,
      seuil_jours: ecole.impaye_seuil_jours,
      mois: moisActuel,
      annee: anneeActuelle,
      eleves: eleves.map((e) => ({
        nom: e.nom,
        prenom: e.prenom,
        matricule: e.matricule,
        classe: e.classe.nom,
      })),
    });
  } catch (error) {
    console.error("[IMPAYES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
