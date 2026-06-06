import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MOIS_SCOLAIRES = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};
const CAT_LABELS: Record<string, string> = {
  SALAIRE: "Salaires",
  FOURNITURE: "Fournitures",
  MAINTENANCE: "Maintenance",
  AUTRE: "Autre",
};

// ─── Palette de couleurs ───
const BLUE_DARK  = "1E40AF"; // bleu titre
const BLUE_MED   = "3B82F6"; // bleu clair
const GREEN_DARK = "16A34A";
const GREEN_LIGHT= "D1FAE5";
const RED_DARK   = "DC2626";
const RED_LIGHT  = "FEE2E2";
const PURPLE     = "7C3AED";
const PURPLE_LIGHT="EDE9FE";
const GRAY_HEADER= "1E293B"; // texte en-tête sombre
const GRAY_ROW   = "F8FAFC"; // ligne paire
const WHITE      = "FFFFFF";
const GOLD       = "F59E0B"; // total/footer
const GOLD_LIGHT = "FEF3C7";
const BORDER_CLR = "CBD5E1";

function fCFA(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}
function pct(part: number, total: number): string {
  if (total === 0) return "0 %";
  return Math.round((part / total) * 100) + " %";
}

// Style d'une cellule d'en-tête de tableau
function headerStyle(bgHex: string): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: "FF" + WHITE }, size: 10, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top:    { style: "thin", color: { argb: "FF" + BORDER_CLR } },
      bottom: { style: "thin", color: { argb: "FF" + BORDER_CLR } },
      left:   { style: "thin", color: { argb: "FF" + BORDER_CLR } },
      right:  { style: "thin", color: { argb: "FF" + BORDER_CLR } },
    },
  };
}

// Style d'une cellule de données
// shrinkToFit réduit la police pour tenir dans la colonne sans jamais déborder
function dataStyle(even: boolean, align: ExcelJS.Alignment["horizontal"] = "left"): Partial<ExcelJS.Style> {
  return {
    font: { size: 9.5, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (even ? GRAY_ROW : WHITE) } },
    alignment: { horizontal: align, vertical: "middle", wrapText: false, shrinkToFit: true },
    border: {
      top:    { style: "hair", color: { argb: "FF" + BORDER_CLR } },
      bottom: { style: "hair", color: { argb: "FF" + BORDER_CLR } },
      left:   { style: "thin", color: { argb: "FF" + BORDER_CLR } },
      right:  { style: "thin", color: { argb: "FF" + BORDER_CLR } },
    },
  };
}

// Style ligne total / footer
function totalStyle(bgHex: string, textHex: string): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, size: 10, name: "Calibri", color: { argb: "FF" + textHex } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "right", vertical: "middle" },
    border: {
      top:    { style: "medium", color: { argb: "FF" + BORDER_CLR } },
      bottom: { style: "medium", color: { argb: "FF" + BORDER_CLR } },
      left:   { style: "thin",   color: { argb: "FF" + BORDER_CLR } },
      right:  { style: "thin",   color: { argb: "FF" + BORDER_CLR } },
    },
  };
}

// Ajoute un titre de section dans la feuille
function addSectionTitle(ws: ExcelJS.Worksheet, row: number, text: string, colCount: number, bgHex: string) {
  const r = ws.getRow(row);
  r.height = 22;
  const cell = ws.getCell(row, 1);
  cell.value = text;
  cell.style = {
    font: { bold: true, size: 11, color: { argb: "FF" + WHITE }, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "left", vertical: "middle", indent: 1 },
  };
  ws.mergeCells(row, 1, row, colCount);
}

// Ajoute une ligne vide de séparation
function addBlankRow(ws: ExcelJS.Worksheet, row: number) {
  ws.getRow(row).height = 8;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const mois  = searchParams.get("mois") ? parseInt(searchParams.get("mois")!) : null;
    const annee = parseInt(searchParams.get("annee") || String(new Date().getFullYear()));
    const isAnnuel = !mois;
    const ecoleId  = session.user.ecoleId;

    const ecole = await prisma.ecole.findUnique({
      where: { id: ecoleId },
      select: { nom: true, adresse: true, telephone: true, annee_scolaire: true },
    });

    const periodeLabel = mois ? `${MOIS_NOMS[mois]} ${annee}` : `Exercice ${annee}`;

    // ─── Requêtes BDD ───
    let dateGte: Date, dateLt: Date;
    if (mois) {
      dateGte = new Date(annee, mois - 1, 1);
      dateLt  = new Date(annee, mois, 1);
    } else {
      dateGte = new Date(annee, 0, 1);
      dateLt  = new Date(annee + 1, 0, 1);
    }

    const [paiements, depenses] = await Promise.all([
      prisma.paiement.findMany({
        where: {
          statut: "PAYE",
          eleve: { classe: { ecole_id: ecoleId } },
          date_paiement: { gte: dateGte, lt: dateLt },
        },
        include: {
          eleve: {
            select: { nom: true, prenom: true, matricule: true, classe: { select: { nom: true } } },
          },
          enregistre_par: { select: { nom: true, prenom: true } },
        },
        orderBy: { date_paiement: "asc" },
      }),
      prisma.depense.findMany({
        where: { ecole_id: ecoleId, date: { gte: dateGte, lt: dateLt } },
        include: { enregistre_par: { select: { nom: true, prenom: true } } },
        orderBy: { date: "asc" },
      }),
    ]);

    const totalRecettes = paiements.reduce((s, p) => s + p.montant, 0);
    const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
    const solde = totalRecettes - totalDepenses;

    // Taux de recouvrement
    const moisEcoules = isAnnuel ? Math.min(new Date().getMonth() + 1, 12) : 1;
    let mensTotal = 0, mensPayees = 0;
    if (mois) {
      [mensTotal, mensPayees] = await Promise.all([
        prisma.paiement.count({ where: { mois, annee, eleve: { classe: { ecole_id: ecoleId }, actif: true } } }),
        prisma.paiement.count({ where: { mois, annee, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId }, actif: true } } }),
      ]);
    } else {
      for (let m = 1; m <= moisEcoules; m++) {
        const [t, p] = await Promise.all([
          prisma.paiement.count({ where: { mois: m, annee, eleve: { classe: { ecole_id: ecoleId }, actif: true } } }),
          prisma.paiement.count({ where: { mois: m, annee, statut: "PAYE", eleve: { classe: { ecole_id: ecoleId }, actif: true } } }),
        ]);
        mensTotal += t; mensPayees += p;
      }
    }
    const tauxRecouvrement = mensTotal > 0 ? Math.round((mensPayees / mensTotal) * 10000) / 100 : 0;

    // Ventilation mensuelle
    const ventilationMensuelle: Array<{ label: string; recettes: number; depenses: number; solde: number }> = [];
    if (isAnnuel) {
      for (const m of MOIS_SCOLAIRES) {
        const anneeM = m >= 10 ? annee : annee + 1;
        const dGte = new Date(anneeM, m - 1, 1);
        const dLt  = new Date(anneeM, m, 1);
        const [recAgg, depAgg] = await Promise.all([
          prisma.paiement.aggregate({
            where: { statut: "PAYE", eleve: { classe: { ecole_id: ecoleId } }, date_paiement: { gte: dGte, lt: dLt } },
            _sum: { montant: true },
          }),
          prisma.depense.aggregate({
            where: { ecole_id: ecoleId, date: { gte: dGte, lt: dLt } },
            _sum: { montant: true },
          }),
        ]);
        const r = recAgg._sum.montant ?? 0;
        const d = depAgg._sum.montant ?? 0;
        ventilationMensuelle.push({ label: `${MOIS_NOMS[m]} ${anneeM}`, recettes: r, depenses: d, solde: r - d });
      }
    }

    // ─── Récapitulatifs par mode / catégorie ───
    const recettesParMode: Record<string, number> = {};
    for (const p of paiements) {
      const mode = p.mode || "ESPECES";
      recettesParMode[mode] = (recettesParMode[mode] || 0) + p.montant;
    }
    const depensesParCat: Record<string, number> = {};
    for (const d of depenses) {
      depensesParCat[d.categorie] = (depensesParCat[d.categorie] || 0) + d.montant;
    }

    // ══════════════════════════════════════════════════════
    //  WORKBOOK
    // ══════════════════════════════════════════════════════
    const wb = new ExcelJS.Workbook();
    wb.creator  = ecole?.nom || "Mon École";
    wb.created  = new Date();
    wb.modified = new Date();

    // ── Onglet 1 : Tableau de bord ──────────────────────
    const wsDashboard = wb.addWorksheet("Tableau de bord", {
      properties: { tabColor: { argb: "FF" + BLUE_DARK } },
    });
    wsDashboard.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];

    // Ligne 1 : titre principal
    wsDashboard.mergeCells("A1:F1");
    const titleCell = wsDashboard.getCell("A1");
    titleCell.value = `BILAN FINANCIER — ${(ecole?.nom || "ÉTABLISSEMENT").toUpperCase()} — ${periodeLabel.toUpperCase()}`;
    titleCell.style = {
      font: { bold: true, size: 14, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BLUE_DARK } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsDashboard.getRow(1).height = 32;

    // Ligne 2 : infos école
    wsDashboard.mergeCells("A2:F2");
    const infoCell = wsDashboard.getCell("A2");
    const infoTxt = [
      ecole?.adresse,
      ecole?.telephone ? `Tél : ${ecole.telephone}` : null,
      ecole?.annee_scolaire ? `Année scolaire : ${ecole.annee_scolaire}` : null,
    ].filter(Boolean).join("   |   ");
    infoCell.value = infoTxt;
    infoCell.style = {
      font: { size: 9, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsDashboard.getRow(2).height = 18;

    // Ligne 3 : vide
    wsDashboard.getRow(3).height = 10;

    // Ligne 4 : labels KPI
    wsDashboard.columns = [
      { width: 26 }, { width: 26 }, { width: 26 }, { width: 24 }, { width: 22 }, { width: 22 },
    ];
    const kpiLabels = ["Recettes totales", "Dépenses totales", "Solde net", "Taux recouvrement", "Nb paiements", "Nb dépenses"];
    const kpiValues = [fCFA(totalRecettes), fCFA(totalDepenses), (solde >= 0 ? "+" : "") + fCFA(solde), `${tauxRecouvrement} %`, `${paiements.length}`, `${depenses.length}`];
    const kpiColors = [GREEN_DARK, RED_DARK, solde >= 0 ? GREEN_DARK : RED_DARK, PURPLE, BLUE_DARK, GRAY_HEADER];
    const kpiBgLight = [GREEN_LIGHT, RED_LIGHT, solde >= 0 ? GREEN_LIGHT : RED_LIGHT, PURPLE_LIGHT, "DBEAFE", "F1F5F9"];

    const r4 = wsDashboard.getRow(4);
    r4.height = 16;
    const r5 = wsDashboard.getRow(5);
    r5.height = 24;

    kpiLabels.forEach((label, i) => {
      const col = i + 1;
      const labelCell = wsDashboard.getCell(4, col);
      labelCell.value = label.toUpperCase();
      labelCell.style = {
        font: { bold: true, size: 8, color: { argb: "FF" + kpiColors[i] }, name: "Calibri" },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + kpiBgLight[i] } },
        alignment: { horizontal: "center", vertical: "bottom" },
        border: { top: { style: "medium", color: { argb: "FF" + kpiColors[i] } } },
      };
      const valCell = wsDashboard.getCell(5, col);
      valCell.value = kpiValues[i];
      valCell.style = {
        font: { bold: true, size: 11, color: { argb: "FF" + kpiColors[i] }, name: "Calibri" },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + kpiBgLight[i] } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: { bottom: { style: "medium", color: { argb: "FF" + kpiColors[i] } } },
      };
    });

    // Ligne 6 vide
    addBlankRow(wsDashboard, 6);
    let dashRow = 7;

    // ── Section ventilation mensuelle ──
    if (isAnnuel && ventilationMensuelle.length > 0) {
      addSectionTitle(wsDashboard, dashRow, "  VENTILATION MENSUELLE", 6, BLUE_DARK);
      dashRow++;

      const ventHeaders = ["Mois", "Recettes (FCFA)", "Dépenses (FCFA)", "Solde du mois", "Solde cumulatif", "Balance"];
      const ventHeaderRow = wsDashboard.getRow(dashRow);
      ventHeaderRow.height = 20;
      ventHeaders.forEach((h, i) => {
        const c = wsDashboard.getCell(dashRow, i + 1);
        c.value = h;
        c.style = headerStyle(BLUE_MED);
        if (i !== 0) c.style.alignment = { horizontal: "right", vertical: "middle" };
      });
      dashRow++;

      let cumulatif = 0;
      ventilationMensuelle.forEach((row, idx) => {
        cumulatif += row.solde;
        const even = idx % 2 === 1;
        const r = wsDashboard.getRow(dashRow);
        r.height = 17;

        const cells = [
          row.label,
          row.recettes,
          row.depenses,
          row.solde,
          cumulatif,
          row.solde >= 0 ? "▲ Excédent" : "▼ Déficit",
        ];
        cells.forEach((val, i) => {
          const c = wsDashboard.getCell(dashRow, i + 1);
          c.value = val;
          if (i === 0) {
            c.style = { ...dataStyle(even, "left"), font: { bold: true, size: 9.5, name: "Calibri" } };
          } else if (i === 1) {
            c.style = { ...dataStyle(even, "right"), font: { size: 9.5, name: "Calibri", color: { argb: "FF" + GREEN_DARK } } };
            c.numFmt = '#,##0 "FCFA"';
          } else if (i === 2) {
            c.style = { ...dataStyle(even, "right"), font: { size: 9.5, name: "Calibri", color: { argb: "FF" + RED_DARK } } };
            c.numFmt = '#,##0 "FCFA"';
          } else if (i === 3 || i === 4) {
            const neg = (typeof val === "number") && val < 0;
            c.style = { ...dataStyle(even, "right"), font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + (neg ? RED_DARK : GREEN_DARK) } } };
            c.numFmt = '#,##0 "FCFA"';
          } else {
            const neg = row.solde < 0;
            c.style = { ...dataStyle(even, "center"), font: { size: 9, name: "Calibri", color: { argb: "FF" + (neg ? RED_DARK : GREEN_DARK) } } };
          }
        });
        dashRow++;
      });

      // Ligne total ventilation
      const totR = wsDashboard.getRow(dashRow);
      totR.height = 18;
      ["TOTAL", totalRecettes, totalDepenses, solde, "", ""].forEach((val, i) => {
        const c = wsDashboard.getCell(dashRow, i + 1);
        c.value = val;
        c.style = totalStyle(GOLD_LIGHT, GOLD);
        if (i === 0) c.style.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
        if (i === 1 || i === 2 || i === 3) c.numFmt = '#,##0 "FCFA"';
      });
      dashRow += 2;
    }

    // ── Section récapitulatif par mode ──
    addSectionTitle(wsDashboard, dashRow, "  RECETTES PAR MODE DE PAIEMENT", 6, GREEN_DARK);
    dashRow++;

    const modeHeaderRow = wsDashboard.getRow(dashRow);
    modeHeaderRow.height = 18;
    ["Mode de paiement", "Montant (FCFA)", "% du total", "", "", ""].forEach((h, i) => {
      const c = wsDashboard.getCell(dashRow, i + 1);
      c.value = h;
      c.style = headerStyle(GREEN_DARK);
      if (i > 0) c.style.alignment = { horizontal: "right", vertical: "middle" };
    });
    dashRow++;

    Object.entries(recettesParMode).forEach(([mode, montant], idx) => {
      const even = idx % 2 === 1;
      const r = wsDashboard.getRow(dashRow);
      r.height = 16;
      [[MODE_LABELS[mode] || mode, "left"], [montant, "right"], [pct(montant, totalRecettes), "center"], ["",""], ["",""], ["",""]].forEach(([val, align], i) => {
        const c = wsDashboard.getCell(dashRow, i + 1);
        c.value = val as string | number;
        c.style = dataStyle(even, (align as ExcelJS.Alignment["horizontal"]) || "left");
        if (i === 1 && typeof val === "number") c.numFmt = '#,##0 "FCFA"';
      });
      dashRow++;
    });

    const totModeRow = wsDashboard.getRow(dashRow);
    totModeRow.height = 18;
    [["TOTAL", "left"], [totalRecettes, "right"], ["100 %", "center"], ["",""], ["",""], ["",""]].forEach(([val, align], i) => {
      const c = wsDashboard.getCell(dashRow, i + 1);
      c.value = val as string | number;
      c.style = { ...totalStyle(GREEN_LIGHT, GREEN_DARK), alignment: { horizontal: (align as ExcelJS.Alignment["horizontal"]) || "right", vertical: "middle" } };
      if (i === 1) c.numFmt = '#,##0 "FCFA"';
    });
    dashRow += 2;

    // ── Section récapitulatif par catégorie ──
    addSectionTitle(wsDashboard, dashRow, "  DÉPENSES PAR CATÉGORIE", 6, RED_DARK);
    dashRow++;

    const catHeaderRow = wsDashboard.getRow(dashRow);
    catHeaderRow.height = 18;
    ["Catégorie", "Montant (FCFA)", "% du total", "", "", ""].forEach((h, i) => {
      const c = wsDashboard.getCell(dashRow, i + 1);
      c.value = h;
      c.style = headerStyle(RED_DARK);
      if (i > 0) c.style.alignment = { horizontal: "right", vertical: "middle" };
    });
    dashRow++;

    Object.entries(depensesParCat).forEach(([cat, montant], idx) => {
      const even = idx % 2 === 1;
      const r = wsDashboard.getRow(dashRow);
      r.height = 16;
      [[CAT_LABELS[cat] || cat, "left"], [montant, "right"], [pct(montant, totalDepenses), "center"], ["",""], ["",""], ["",""]].forEach(([val, align], i) => {
        const c = wsDashboard.getCell(dashRow, i + 1);
        c.value = val as string | number;
        c.style = dataStyle(even, (align as ExcelJS.Alignment["horizontal"]) || "left");
        if (i === 1 && typeof val === "number") c.numFmt = '#,##0 "FCFA"';
      });
      dashRow++;
    });

    const totCatRow = wsDashboard.getRow(dashRow);
    totCatRow.height = 18;
    [["TOTAL", "left"], [totalDepenses, "right"], ["100 %", "center"], ["",""], ["",""], ["",""]].forEach(([val, align], i) => {
      const c = wsDashboard.getCell(dashRow, i + 1);
      c.value = val as string | number;
      c.style = { ...totalStyle(RED_LIGHT, RED_DARK), alignment: { horizontal: (align as ExcelJS.Alignment["horizontal"]) || "right", vertical: "middle" } };
      if (i === 1) c.numFmt = '#,##0 "FCFA"';
    });
    dashRow += 2;

    // ── Encadré résultat net ──
    addSectionTitle(wsDashboard, dashRow, "  RÉSULTAT NET DE L'EXERCICE", 6, solde >= 0 ? GREEN_DARK : RED_DARK);
    dashRow++;
    wsDashboard.mergeCells(dashRow, 1, dashRow, 3);
    wsDashboard.mergeCells(dashRow, 4, dashRow, 6);
    const rSituation = wsDashboard.getRow(dashRow);
    rSituation.height = 26;

    const cSitLabel = wsDashboard.getCell(dashRow, 1);
    cSitLabel.value = solde >= 0 ? "✓  Excédent budgétaire" : "✗  Déficit budgétaire";
    cSitLabel.style = {
      font: { bold: true, size: 11, color: { argb: "FF" + (solde >= 0 ? GREEN_DARK : RED_DARK) }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (solde >= 0 ? GREEN_LIGHT : RED_LIGHT) } },
      alignment: { horizontal: "left", vertical: "middle", indent: 1 },
    };
    const cSitVal = wsDashboard.getCell(dashRow, 4);
    cSitVal.value = (solde >= 0 ? "+" : "") + fCFA(solde);
    cSitVal.style = {
      font: { bold: true, size: 13, color: { argb: "FF" + (solde >= 0 ? GREEN_DARK : RED_DARK) }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (solde >= 0 ? GREEN_LIGHT : RED_LIGHT) } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    // ── Onglet 2 : Détail paiements ──────────────────────
    const wsPaiements = wb.addWorksheet("Paiements", {
      properties: { tabColor: { argb: "FF" + GREEN_DARK } },
    });
    wsPaiements.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

    // Titre
    wsPaiements.mergeCells("A1:I1");
    const ptitle = wsPaiements.getCell("A1");
    ptitle.value = `DÉTAIL DES PAIEMENTS — ${periodeLabel.toUpperCase()}`;
    ptitle.style = {
      font: { bold: true, size: 12, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GREEN_DARK } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsPaiements.getRow(1).height = 26;

    // Sous-titre info
    wsPaiements.mergeCells("A2:I2");
    const pinfo = wsPaiements.getCell("A2");
    pinfo.value = `${paiements.length} paiements — Total : ${fCFA(totalRecettes)}   |   Généré le ${new Date().toLocaleDateString("fr-FR")}`;
    pinfo.style = {
      font: { size: 9, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF22C55E" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsPaiements.getRow(2).height = 15;

    // En-têtes
    const pHeaders = ["Date", "Élève", "Matricule", "Classe", "Mois payé", "Montant (FCFA)", "Mode", "N° Reçu", "Enregistré par"];
    const pWidths  = [13, 32, 18, 16, 20, 20, 16, 22, 28];
    wsPaiements.columns = pWidths.map((w) => ({ width: w }));

    const pHeadRow = wsPaiements.getRow(3);
    pHeadRow.height = 20;
    pHeaders.forEach((h, i) => {
      const c = wsPaiements.getCell(3, i + 1);
      c.value = h;
      c.style = headerStyle(GREEN_DARK);
      if (i === 5) c.style.alignment = { horizontal: "right", vertical: "middle" };
    });

    // Données
    paiements.forEach((p, idx) => {
      const even = idx % 2 === 1;
      const r = wsPaiements.getRow(idx + 4);
      r.height = 16;
      const row = [
        p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "",
        `${p.eleve.prenom} ${p.eleve.nom}`,
        p.eleve.matricule,
        p.eleve.classe.nom,
        `${MOIS_NOMS[p.mois]} ${p.annee}`,
        p.montant,
        MODE_LABELS[p.mode || ""] || p.mode || "",
        p.recu_numero || "",
        p.enregistre_par ? `${p.enregistre_par.prenom} ${p.enregistre_par.nom}` : "",
      ];
      row.forEach((val, i) => {
        const c = wsPaiements.getCell(idx + 4, i + 1);
        c.value = val;
        c.style = dataStyle(even, i === 5 ? "right" : "left");
        if (i === 5) c.numFmt = '#,##0 "FCFA"';
      });
    });

    // Ligne total
    const pTotRow = wsPaiements.getRow(paiements.length + 4);
    pTotRow.height = 18;
    ["", "", "", "", "TOTAL", totalRecettes, "", "", ""].forEach((val, i) => {
      const c = wsPaiements.getCell(paiements.length + 4, i + 1);
      c.value = val;
      c.style = { ...totalStyle(GREEN_LIGHT, GREEN_DARK), alignment: { horizontal: i === 4 ? "right" : "right", vertical: "middle" } };
      if (i === 5) c.numFmt = '#,##0 "FCFA"';
    });

    // ── Onglet 3 : Détail dépenses ───────────────────────
    const wsDepenses = wb.addWorksheet("Dépenses", {
      properties: { tabColor: { argb: "FF" + RED_DARK } },
    });
    wsDepenses.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

    wsDepenses.mergeCells("A1:E1");
    const dtitle = wsDepenses.getCell("A1");
    dtitle.value = `DÉTAIL DES DÉPENSES — ${periodeLabel.toUpperCase()}`;
    dtitle.style = {
      font: { bold: true, size: 12, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + RED_DARK } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsDepenses.getRow(1).height = 26;

    wsDepenses.mergeCells("A2:E2");
    const dinfo = wsDepenses.getCell("A2");
    dinfo.value = `${depenses.length} dépenses — Total : ${fCFA(totalDepenses)}   |   Généré le ${new Date().toLocaleDateString("fr-FR")}`;
    dinfo.style = {
      font: { size: 9, color: { argb: "FF" + WHITE }, name: "Calibri" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    wsDepenses.getRow(2).height = 15;

    const dHeaders = ["Date", "Libellé", "Catégorie", "Montant (FCFA)", "Enregistré par"];
    const dWidths  = [13, 46, 18, 20, 28];
    wsDepenses.columns = dWidths.map((w) => ({ width: w }));

    const dHeadRow = wsDepenses.getRow(3);
    dHeadRow.height = 20;
    dHeaders.forEach((h, i) => {
      const c = wsDepenses.getCell(3, i + 1);
      c.value = h;
      c.style = headerStyle(RED_DARK);
      if (i === 3) c.style.alignment = { horizontal: "right", vertical: "middle" };
    });

    depenses.forEach((d, idx) => {
      const even = idx % 2 === 1;
      const r = wsDepenses.getRow(idx + 4);
      r.height = 16;
      const row = [
        new Date(d.date).toLocaleDateString("fr-FR"),
        d.libelle,
        CAT_LABELS[d.categorie] || d.categorie,
        d.montant,
        `${d.enregistre_par.prenom} ${d.enregistre_par.nom}`,
      ];
      row.forEach((val, i) => {
        const c = wsDepenses.getCell(idx + 4, i + 1);
        c.value = val;
        c.style = dataStyle(even, i === 3 ? "right" : "left");
        if (i === 3) c.numFmt = '#,##0 "FCFA"';
      });
    });

    const dTotRow = wsDepenses.getRow(depenses.length + 4);
    dTotRow.height = 18;
    ["", "", "TOTAL", totalDepenses, ""].forEach((val, i) => {
      const c = wsDepenses.getCell(depenses.length + 4, i + 1);
      c.value = val;
      c.style = { ...totalStyle(RED_LIGHT, RED_DARK), alignment: { horizontal: i === 3 ? "right" : "right", vertical: "middle" } };
      if (i === 3) c.numFmt = '#,##0 "FCFA"';
    });

    // ── Génération du buffer ─────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const periode = mois ? `${MOIS_NOMS[mois].toLowerCase()}_${annee}` : String(annee);
    const filename = `bilan_financier_${periode}.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[COMPTABILITE_EXPORT_EXCEL_GET] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
