import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // Année scolaire : oct 2025 → juin 2026
    const ANNEE_SCOLAIRE_DEBUT = new Date(2025, 9, 1); // 1 oct 2025
    const ANNEE_SCOLAIRE_FIN   = new Date(2026, 6, 1); // 1 jul 2026

    // ─── Recettes du mois courant ───
    const paiementsMois = await prisma.paiement.findMany({
      where: {
        statut: "PAYE",
        eleve: { classe: { ecole_id: ecoleId } },
        date_paiement: {
          gte: new Date(anneeActuelle, moisActuel - 1, 1),
          lt:  new Date(anneeActuelle, moisActuel, 1),
        },
      },
      select: { montant: true },
    });
    const recettesMois = paiementsMois.reduce((s, p) => s + p.montant, 0);

    // ─── Dépenses du mois courant ───
    const depensesMois = await prisma.depense.findMany({
      where: {
        ecole_id: ecoleId,
        date: {
          gte: new Date(anneeActuelle, moisActuel - 1, 1),
          lt:  new Date(anneeActuelle, moisActuel, 1),
        },
      },
      select: { montant: true },
    });
    const totalDepensesMois = depensesMois.reduce((s, d) => s + d.montant, 0);

    // ─── Taux de recouvrement du mois courant (hors inscription mois=0) ───
    const [totalMensualites, mensualitesPayees] = await Promise.all([
      prisma.paiement.count({
        where: { mois: moisActuel, annee: anneeActuelle, eleve: { classe: { ecole_id: ecoleId }, actif: true } },
      }),
      prisma.paiement.count({
        where: { mois: moisActuel, annee: anneeActuelle, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId }, actif: true } },
      }),
    ]);
    const tauxRecouvrement = totalMensualites > 0
      ? Math.round((mensualitesPayees / totalMensualites) * 10000) / 100
      : 0;

    // ─── Totaux annuels (inscriptions) ───
    const inscriptionsPayees = await prisma.paiement.findMany({
      where: {
        mois: 0,
        statut: "PAYE",
        eleve: { classe: { ecole_id: ecoleId } },
      },
      select: { montant: true },
    });
    const totalInscriptions = inscriptionsPayees.reduce((s, p) => s + p.montant, 0);
    const nbInscriptionsPayees = inscriptionsPayees.length;

    // ─── Totaux annuels (mensualités) ───
    const mensualitesAnneePayees = await prisma.paiement.findMany({
      where: {
        statut: "PAYE",
        mois: { not: 0 },
        eleve: { classe: { ecole_id: ecoleId } },
        date_paiement: { gte: ANNEE_SCOLAIRE_DEBUT, lt: ANNEE_SCOLAIRE_FIN },
      },
      select: { montant: true },
    });
    const totalMensualitesAnnee = mensualitesAnneePayees.reduce((s, p) => s + p.montant, 0);

    const nbMensualitesTotal = await prisma.paiement.count({
      where: { mois: { not: 0 }, eleve: { classe: { ecole_id: ecoleId }, actif: true } },
    });
    const nbMensualitesPayeesAnnee = await prisma.paiement.count({
      where: { mois: { not: 0 }, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId } } },
    });

    // ─── Total dépenses annuelles ───
    const depensesAnnee = await prisma.depense.findMany({
      where: { ecole_id: ecoleId, date: { gte: ANNEE_SCOLAIRE_DEBUT, lt: ANNEE_SCOLAIRE_FIN } },
      select: { montant: true },
    });
    const totalDepensesAnnee = depensesAnnee.reduce((s, d) => s + d.montant, 0);

    // ─── Nombre d'élèves actifs ───
    const nbEleves = await prisma.eleve.count({
      where: { actif: true, classe: { ecole_id: ecoleId } },
    });

    // ─── Historique 12 mois ───
    const MOIS_COURTS = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const historique = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(anneeActuelle, moisActuel - 1 - i, 1);
      const m = d.getMonth() + 1;
      const a = d.getFullYear();
      const debut = new Date(a, m - 1, 1);
      const fin   = new Date(a, m, 1);

      const [recettes, depenses] = await Promise.all([
        prisma.paiement
          .findMany({ where: { statut: "PAYE", eleve: { classe: { ecole_id: ecoleId } }, date_paiement: { gte: debut, lt: fin } }, select: { montant: true } })
          .then((ps) => ps.reduce((s, p) => s + p.montant, 0)),
        prisma.depense
          .findMany({ where: { ecole_id: ecoleId, date: { gte: debut, lt: fin } }, select: { montant: true } })
          .then((ds) => ds.reduce((s, d) => s + d.montant, 0)),
      ]);

      historique.push({ mois: m, annee: a, label: `${MOIS_COURTS[m]} ${a}`, recettes, depenses });
    }

    return NextResponse.json({
      mois_actuel: { mois: moisActuel, annee: anneeActuelle },
      // Mois courant
      recettes_mois: recettesMois,
      depenses_mois: totalDepensesMois,
      solde_net: recettesMois - totalDepensesMois,
      taux_recouvrement: tauxRecouvrement,
      mensualites_total: totalMensualites,
      mensualites_payees: mensualitesPayees,
      // Annuel
      total_inscriptions: totalInscriptions,
      nb_inscriptions_payees: nbInscriptionsPayees,
      total_mensualites_annee: totalMensualitesAnnee,
      nb_mensualites_payees_annee: nbMensualitesPayeesAnnee,
      nb_mensualites_total_annee: nbMensualitesTotal,
      total_depenses_annee: totalDepensesAnnee,
      solde_annee: totalInscriptions + totalMensualitesAnnee - totalDepensesAnnee,
      nb_eleves: nbEleves,
      historique,
    });
  } catch (error) {
    console.error("[COMPTABILITE_STATS_GET] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
