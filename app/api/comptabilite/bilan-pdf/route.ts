import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MOIS_NOMS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const CAT_LABELS: Record<string, string> = {
  SALAIRE: "Salaires",
  FOURNITURE: "Fournitures",
  MAINTENANCE: "Maintenance",
  AUTRE: "Autre",
};

function fCFA(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const { searchParams } = req.nextUrl;
  const mois = searchParams.get("mois") ? parseInt(searchParams.get("mois")!) : null;
  const annee = parseInt(searchParams.get("annee") || String(new Date().getFullYear()));
  const ecoleId = session.user.ecoleId;

  const ecole = await prisma.ecole.findUnique({
    where: { id: ecoleId },
    select: { nom: true, adresse: true, telephone: true, annee_scolaire: true },
  });

  // Période
  let dateGte: Date, dateLt: Date;
  if (mois) {
    dateGte = new Date(annee, mois - 1, 1);
    dateLt = new Date(annee, mois, 1);
  } else {
    dateGte = new Date(annee, 0, 1);
    dateLt = new Date(annee + 1, 0, 1);
  }

  const periodeLabel = mois ? `${MOIS_NOMS[mois]} ${annee}` : `Année ${annee}`;

  // Recettes
  const paiements = await prisma.paiement.findMany({
    where: {
      statut: "PAYE",
      eleve: { classe: { ecole_id: ecoleId } },
      date_paiement: { gte: dateGte, lt: dateLt },
    },
    select: { montant: true, mode: true },
  });
  const totalRecettes = paiements.reduce((s, p) => s + p.montant, 0);

  // Recettes par mode
  const recettesParMode: Record<string, number> = {};
  for (const p of paiements) {
    const mode = p.mode || "ESPECES";
    recettesParMode[mode] = (recettesParMode[mode] || 0) + p.montant;
  }

  // Dépenses
  const depenses = await prisma.depense.findMany({
    where: { ecole_id: ecoleId, date: { gte: dateGte, lt: dateLt } },
    select: { montant: true, categorie: true },
  });
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);

  // Dépenses par catégorie
  const depensesParCat: Record<string, number> = {};
  for (const d of depenses) {
    depensesParCat[d.categorie] = (depensesParCat[d.categorie] || 0) + d.montant;
  }

  // Taux de recouvrement
  let tauxRecouvrement = 0;
  let mensTotal = 0;
  let mensPayees = 0;
  if (mois) {
    mensTotal = await prisma.paiement.count({
      where: { mois, annee, eleve: { classe: { ecole_id: ecoleId }, actif: true } },
    });
    mensPayees = await prisma.paiement.count({
      where: { mois, annee, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId }, actif: true } },
    });
    tauxRecouvrement = mensTotal > 0 ? Math.round((mensPayees / mensTotal) * 10000) / 100 : 0;
  } else {
    // Sur l'année : moyenne des mois écoulés
    const moisEcoules = mois ? 1 : Math.min(new Date().getMonth() + 1, 12);
    let totalT = 0, totalP = 0;
    for (let m = 1; m <= moisEcoules; m++) {
      const t = await prisma.paiement.count({
        where: { mois: m, annee, eleve: { classe: { ecole_id: ecoleId }, actif: true } },
      });
      const p = await prisma.paiement.count({
        where: { mois: m, annee, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId }, actif: true } },
      });
      totalT += t;
      totalP += p;
    }
    mensTotal = totalT;
    mensPayees = totalP;
    tauxRecouvrement = totalT > 0 ? Math.round((totalP / totalT) * 10000) / 100 : 0;
  }

  const solde = totalRecettes - totalDepenses;

  // ─── GÉNÉRATION PDF ───
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();

  // En-tête
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pw, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text((ecole?.nom || "IREF").toUpperCase(), pw / 2, 14, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  if (ecole?.adresse) doc.text(ecole.adresse, pw / 2, 20, { align: "center" });
  if (ecole?.telephone) doc.text(`Tél : ${ecole.telephone}`, pw / 2, 25, { align: "center" });
  doc.text(`Année scolaire : ${ecole?.annee_scolaire || ""}`, pw / 2, 30, { align: "center" });

  // Titre
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`BILAN FINANCIER — ${periodeLabel.toUpperCase()}`, pw / 2, 46, { align: "center" });

  // KPI
  const ky = 55;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(14, ky, pw - 28, 30, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const col1 = 20;
  const col2 = pw / 4 + 5;
  const col3 = pw / 2 + 5;
  const col4 = (pw * 3) / 4 + 5;

  const kpiBlock = (x: number, label: string, value: string, color: [number, number, number]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, ky + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(value, x, ky + 16);
  };

  kpiBlock(col1, "Recettes", fCFA(totalRecettes), [22, 163, 74]);
  kpiBlock(col2, "Dépenses", fCFA(totalDepenses), [220, 38, 38]);
  kpiBlock(col3, "Solde net", (solde >= 0 ? "+" : "") + fCFA(solde), solde >= 0 ? [22, 163, 74] : [220, 38, 38]);
  kpiBlock(col4, "Recouvrement", `${tauxRecouvrement}%`, [124, 58, 237]);

  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "normal");
  doc.text(`${mensPayees}/${mensTotal} mensualités collectées`, col4, ky + 22);

  // Tableau recettes par mode
  let tableY = ky + 38;
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Recettes par mode de paiement", 14, tableY);

  const modeLabels: Record<string, string> = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    VIREMENT: "Virement",
  };

  autoTable(doc, {
    startY: tableY + 3,
    head: [["Mode", "Montant (FCFA)", "% du total"]],
    body: Object.entries(recettesParMode).map(([mode, montant]) => [
      modeLabels[mode] || mode,
      fCFA(montant),
      totalRecettes > 0 ? `${Math.round((montant / totalRecettes) * 100)}%` : "0%",
    ]),
    foot: [["Total", fCFA(totalRecettes), "100%"]],
    theme: "grid",
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontSize: 8 },
    footStyles: { fillColor: [240, 253, 244], textColor: [22, 163, 74], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableY = (doc as any).lastAutoTable?.finalY ?? tableY + 30;
  tableY += 10;

  // Tableau dépenses par catégorie
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Dépenses par catégorie", 14, tableY);

  autoTable(doc, {
    startY: tableY + 3,
    head: [["Catégorie", "Montant (FCFA)", "% du total"]],
    body: Object.entries(depensesParCat).map(([cat, montant]) => [
      CAT_LABELS[cat] || cat,
      fCFA(montant),
      totalDepenses > 0 ? `${Math.round((montant / totalDepenses) * 100)}%` : "0%",
    ]),
    foot: [["Total", fCFA(totalDepenses), "100%"]],
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8 },
    footStyles: { fillColor: [254, 242, 242], textColor: [220, 38, 38], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Pied de page
  const ph = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(14, ph - 15, pw - 14, ph - 15);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${ecole?.nom || ""}`,
    pw / 2,
    ph - 10,
    { align: "center" }
  );

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `bilan_${mois ? `${MOIS_NOMS[mois]}_${annee}` : annee}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[COMPTABILITE_BILAN_PDF_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
