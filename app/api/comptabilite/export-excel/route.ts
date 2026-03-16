import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const MOIS_NOMS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const mois = searchParams.get("mois") ? parseInt(searchParams.get("mois")!) : null;
  const annee = parseInt(searchParams.get("annee") || String(new Date().getFullYear()));

  const ecoleId = session.user.ecoleId;

  // Paiements
  const paiementWhere: Record<string, unknown> = {
    statut: "PAYE",
    eleve: { classe: { ecole_id: ecoleId } },
  };
  if (mois) {
    paiementWhere.date_paiement = {
      gte: new Date(annee, mois - 1, 1),
      lt: new Date(annee, mois, 1),
    };
  } else {
    paiementWhere.date_paiement = {
      gte: new Date(annee, 0, 1),
      lt: new Date(annee + 1, 0, 1),
    };
  }

  const paiements = await prisma.paiement.findMany({
    where: paiementWhere,
    include: {
      eleve: {
        select: {
          nom: true, prenom: true, matricule: true,
          classe: { select: { nom: true } },
        },
      },
      enregistre_par: { select: { nom: true, prenom: true } },
    },
    orderBy: { date_paiement: "asc" },
  });

  // Dépenses
  const depenseWhere: Record<string, unknown> = { ecole_id: ecoleId };
  if (mois) {
    depenseWhere.date = {
      gte: new Date(annee, mois - 1, 1),
      lt: new Date(annee, mois, 1),
    };
  } else {
    depenseWhere.date = {
      gte: new Date(annee, 0, 1),
      lt: new Date(annee + 1, 0, 1),
    };
  }

  const depenses = await prisma.depense.findMany({
    where: depenseWhere,
    include: { enregistre_par: { select: { nom: true, prenom: true } } },
    orderBy: { date: "asc" },
  });

  // Feuille Paiements
  const paiementsData = paiements.map((p) => ({
    "Date": p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "",
    "Élève": `${p.eleve.prenom} ${p.eleve.nom}`,
    "Matricule": p.eleve.matricule,
    "Classe": p.eleve.classe.nom,
    "Mois payé": `${MOIS_NOMS[p.mois]} ${p.annee}`,
    "Montant (FCFA)": p.montant,
    "Mode": MODE_LABELS[p.mode || ""] || p.mode || "",
    "N° Reçu": p.recu_numero || "",
    "Enregistré par": p.enregistre_par ? `${p.enregistre_par.prenom} ${p.enregistre_par.nom}` : "",
  }));

  // Feuille Dépenses
  const depensesData = depenses.map((d) => ({
    "Date": new Date(d.date).toLocaleDateString("fr-FR"),
    "Libellé": d.libelle,
    "Catégorie": d.categorie,
    "Montant (FCFA)": d.montant,
    "Enregistré par": `${d.enregistre_par.prenom} ${d.enregistre_par.nom}`,
  }));

  // Feuille Résumé
  const totalRecettes = paiements.reduce((s, p) => s + p.montant, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
  const resumeData = [
    { "Indicateur": "Total recettes", "Valeur": totalRecettes },
    { "Indicateur": "Total dépenses", "Valeur": totalDepenses },
    { "Indicateur": "Solde net", "Valeur": totalRecettes - totalDepenses },
    { "Indicateur": "Nombre de paiements", "Valeur": paiements.length },
    { "Indicateur": "Nombre de dépenses", "Valeur": depenses.length },
  ];

  const wb = XLSX.utils.book_new();

  const wsResume = XLSX.utils.json_to_sheet(resumeData);
  wsResume["!cols"] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResume, "Résumé");

  const wsPaiements = XLSX.utils.json_to_sheet(paiementsData);
  wsPaiements["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 12 },
    { wch: 18 }, { wch: 15 }, { wch: 14 }, { wch: 20 }, { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPaiements, "Paiements");

  const wsDepenses = XLSX.utils.json_to_sheet(depensesData);
  wsDepenses["!cols"] = [{ wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsDepenses, "Dépenses");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const periode = mois ? `${MOIS_NOMS[mois]}_${annee}` : String(annee);
  const filename = `bilan_financier_${periode}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
