import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — statistiques financières sur 12 mois
export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const ecoleId = session.user.ecoleId;
    const now = new Date();
    const moisActuel = now.getMonth() + 1;
    const anneeActuelle = now.getFullYear();

    // ─── Recettes du mois (paiements PAYE ce mois) ───
    const paiementsMois = await prisma.paiement.findMany({
      where: {
        statut: "PAYE",
        eleve: { classe: { ecole_id: ecoleId } },
        date_paiement: {
          gte: new Date(anneeActuelle, moisActuel - 1, 1),
          lt: new Date(anneeActuelle, moisActuel, 1),
        },
      },
      select: { montant: true },
    });
    const recettesMois = paiementsMois.reduce((s, p) => s + p.montant, 0);

    // ─── Dépenses du mois ───
    const depensesMois = await prisma.depense.findMany({
      where: {
        ecole_id: ecoleId,
        date: {
          gte: new Date(anneeActuelle, moisActuel - 1, 1),
          lt: new Date(anneeActuelle, moisActuel, 1),
        },
      },
      select: { montant: true },
    });
    const totalDepensesMois = depensesMois.reduce((s, d) => s + d.montant, 0);

    // ─── Taux de recouvrement du mois ───
    const totalMensualites = await prisma.paiement.count({
      where: {
        mois: moisActuel,
        annee: anneeActuelle,
        eleve: { classe: { ecole_id: ecoleId }, actif: true },
      },
    });
    const mensualitesPayees = await prisma.paiement.count({
      where: {
        mois: moisActuel,
        annee: anneeActuelle,
        statut: "PAYE",
        eleve: { classe: { ecole_id: ecoleId }, actif: true },
      },
    });
    const tauxRecouvrement =
      totalMensualites > 0
        ? Math.round((mensualitesPayees / totalMensualites) * 10000) / 100
        : 0;

    // ─── Historique 12 mois (recettes + dépenses) ───
    const historique: {
      mois: number;
      annee: number;
      label: string;
      recettes: number;
      depenses: number;
    }[] = [];

    const MOIS_COURTS = [
      "", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
      "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
    ];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(anneeActuelle, moisActuel - 1 - i, 1);
      const m = d.getMonth() + 1;
      const a = d.getFullYear();
      const debut = new Date(a, m - 1, 1);
      const fin = new Date(a, m, 1);

      const [recettes, depenses] = await Promise.all([
        prisma.paiement
          .findMany({
            where: {
              statut: "PAYE",
              eleve: { classe: { ecole_id: ecoleId } },
              date_paiement: { gte: debut, lt: fin },
            },
            select: { montant: true },
          })
          .then((ps) => ps.reduce((s, p) => s + p.montant, 0)),
        prisma.depense
          .findMany({
            where: { ecole_id: ecoleId, date: { gte: debut, lt: fin } },
            select: { montant: true },
          })
          .then((ds) => ds.reduce((s, d) => s + d.montant, 0)),
      ]);

      historique.push({
        mois: m,
        annee: a,
        label: `${MOIS_COURTS[m]} ${a}`,
        recettes,
        depenses,
      });
    }

    return NextResponse.json({
      mois_actuel: { mois: moisActuel, annee: anneeActuelle },
      recettes_mois: recettesMois,
      depenses_mois: totalDepensesMois,
      solde_net: recettesMois - totalDepensesMois,
      taux_recouvrement: tauxRecouvrement,
      mensualites_total: totalMensualites,
      mensualites_payees: mensualitesPayees,
      historique,
    });
  } catch (error) {
    console.error("[COMPTABILITE_STATS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
