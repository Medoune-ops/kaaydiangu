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

    // ─── Stats annuelles (année scolaire active : oct année N → juin année N+1) ───
    const anneeActive = await prisma.anneeScolaire.findFirst({
      where: { ecole_id: ecoleId, est_active: true },
      select: { libelle: true, date_debut: true, date_fin: true },
    });

    // Bornes : date_debut et date_fin de l'année active, sinon 1er jan → 31 déc courant.
    const debutAnnee = anneeActive?.date_debut ?? new Date(anneeActuelle, 0, 1);
    const finAnnee = anneeActive?.date_fin
      ? new Date(new Date(anneeActive.date_fin).getTime() + 24 * 60 * 60 * 1000) // inclure le dernier jour
      : new Date(anneeActuelle + 1, 0, 1);

    // Pour le recouvrement annuel : on compte les mensualités (mois ≠ 0) de l'année active.
    // Si l'année active existe, on filtre par annee_scolaire_id ; sinon par plage de dates.
    const anneeActiveId = anneeActive
      ? (await prisma.anneeScolaire.findFirst({ where: { ecole_id: ecoleId, est_active: true }, select: { id: true } }))?.id
      : undefined;

    const [paiementsAnnee, depensesAnnee, totalMensualitesAnnee, mensualitesPayeesAnnee] =
      await Promise.all([
        prisma.paiement.findMany({
          where: {
            statut: "PAYE",
            eleve: { classe: { ecole_id: ecoleId } },
            date_paiement: { gte: debutAnnee, lt: finAnnee },
          },
          select: { montant: true },
        }),
        prisma.depense.findMany({
          where: { ecole_id: ecoleId, date: { gte: debutAnnee, lt: finAnnee } },
          select: { montant: true },
        }),
        prisma.paiement.count({
          where: {
            eleve: { classe: { ecole_id: ecoleId }, actif: true },
            mois: { not: 0 },
            ...(anneeActiveId ? { annee_scolaire_id: anneeActiveId } : {}),
          },
        }),
        prisma.paiement.count({
          where: {
            statut: "PAYE",
            eleve: { classe: { ecole_id: ecoleId }, actif: true },
            mois: { not: 0 },
            ...(anneeActiveId ? { annee_scolaire_id: anneeActiveId } : { date_paiement: { gte: debutAnnee, lt: finAnnee } }),
          },
        }),
      ]);

    const recettesAnnee = paiementsAnnee.reduce((s, p) => s + p.montant, 0);
    const totalDepensesAnnee = depensesAnnee.reduce((s, d) => s + d.montant, 0);
    const soldeNetAnnee = recettesAnnee - totalDepensesAnnee;
    const recouvrementAnnee =
      totalMensualitesAnnee > 0
        ? Math.round((mensualitesPayeesAnnee / totalMensualitesAnnee) * 10000) / 100
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
      // Stats annuelles
      annee_scolaire_libelle: anneeActive?.libelle ?? String(anneeActuelle),
      recettes_annee: recettesAnnee,
      depenses_annee: totalDepensesAnnee,
      solde_net_annee: soldeNetAnnee,
      recouvrement_annee: recouvrementAnnee,
      mensualites_total_annee: totalMensualitesAnnee,
      mensualites_payees_annee: mensualitesPayeesAnnee,
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
