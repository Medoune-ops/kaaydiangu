import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — liste détaillée des impayés pour le comptable
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const classeId = searchParams.get("classe_id");
    const page = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");

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

    const selectOpts = {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      email_parent: true,
      telephone_parent: true,
      user_id: true,
      classe: { select: { id: true, nom: true, niveau: true } },
      paiements: {
        where: { statut: "NON_PAYE" as const },
        select: { id: true, mois: true, annee: true },
        orderBy: [{ annee: "asc" as const }, { mois: "asc" as const }],
      },
    };

    const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapEleves = (eleves: any[]) =>
      eleves.map((e: any) => {
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
            (p: { mois: number; annee: number }) => `${MOIS_NOMS[p.mois]} ${p.annee}`
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

    if (page) {
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limit;

      const [eleves, total] = await Promise.all([
        prisma.eleve.findMany({
          where,
          select: selectOpts,
          orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
          skip,
          take: limit,
        }),
        prisma.eleve.count({ where }),
      ]);

      return NextResponse.json({
        eleves: mapEleves(eleves),
        classes,
        pagination: {
          page: pageNum,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const eleves = await prisma.eleve.findMany({
      where,
      select: selectOpts,
      orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
    });

    return NextResponse.json({ eleves: mapEleves(eleves), classes });
  } catch (error) {
    console.error("[IMPAYES_COMPTABLE_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
