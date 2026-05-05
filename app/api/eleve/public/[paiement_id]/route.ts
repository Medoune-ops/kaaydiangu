import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paiement_id: string }> }
) {
  try {
    const { paiement_id } = await params;

    const paiement = await prisma.paiement.findUnique({
      where: { id: paiement_id, statut: "PAYE" },
      include: {
        eleve: {
          include: {
            classe: { select: { id: true, nom: true } },
          },
        },
      },
    });

    if (!paiement) {
      return NextResponse.json({ error: "Reçu introuvable" }, { status: 404 });
    }

    const eleve = paiement.eleve;

    const [tousLesPaiements, notes, cours] = await Promise.all([
      prisma.paiement.findMany({
        where: { eleve_id: eleve.id, statut: "PAYE" },
        orderBy: [{ annee: "asc" }, { mois: "asc" }],
        select: {
          id: true,
          mois: true,
          annee: true,
          montant: true,
          mode: true,
          recu_numero: true,
          date_paiement: true,
        },
      }),
      prisma.note.findMany({
        where: { eleve_id: eleve.id },
        select: { sequence: true },
        distinct: ["sequence"],
        orderBy: { sequence: "asc" },
      }),
      prisma.cours.findMany({
        where: { classe_id: eleve.classe_id },
        include: {
          matiere: { select: { nom: true } },
          depose_par: { select: { nom: true, prenom: true } },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    return NextResponse.json({
      eleve: {
        nom: eleve.nom,
        prenom: eleve.prenom,
        matricule: eleve.matricule,
        classe: eleve.classe.nom,
      },
      eleveId: eleve.id,
      sequences: notes.map((n) => n.sequence),
      paiements: tousLesPaiements,
      cours,
    });
  } catch (error) {
    console.error("[ELEVE_PUBLIC_GET] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
