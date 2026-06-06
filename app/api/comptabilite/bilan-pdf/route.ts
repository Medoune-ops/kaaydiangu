import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MOIS_SCOLAIRES = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7]; // Oct → Juil

const CAT_LABELS: Record<string, string> = {
  SALAIRE: "Salaires",
  FOURNITURE: "Fournitures",
  MAINTENANCE: "Maintenance",
  AUTRE: "Autre",
};

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};

// Couleurs
const C_BLUE   = [30, 64, 175]  as [number, number, number];
const C_GREEN  = [22, 163, 74]  as [number, number, number];
const C_RED    = [220, 38, 38]  as [number, number, number];
const C_PURPLE = [124, 58, 237] as [number, number, number];
const C_GRAY   = [100, 116, 139] as [number, number, number];
const C_WHITE  = [255, 255, 255] as [number, number, number];
const C_BG     = [248, 250, 252] as [number, number, number];

function fCFA(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function pct(part: number, total: number): string {
  if (total === 0) return "0 %";
  return Math.round((part / total) * 100) + " %";
}

// Dessine un bloc KPI (label + valeur) dans un rectangle coloré
function kpiCard(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string,
  accent: [number, number, number]
) {
  // Fond blanc avec bordure gauche colorée
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_GRAY);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");

  // Barre latérale colorée
  doc.setFillColor(...accent);
  doc.roundedRect(x, y, 3, h, 1, 1, "F");

  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C_GRAY);
  doc.text(label.toUpperCase(), x + 6, y + 7);

  // Valeur — tronquer si trop long pour tenir dans la carte
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accent);
  const maxW = w - 8;
  const lines = doc.splitTextToSize(value, maxW);
  doc.text(lines[0] as string, x + 6, y + 14);
}

// Ajoute le pied de page sur toutes les pages
function addFooter(doc: jsPDF, ecoleName: string) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    doc.line(14, ph - 14, pw - 14, ph - 14);
    doc.setFontSize(6.5);
    doc.setTextColor(...C_GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${ecoleName}`,
      14, ph - 9
    );
    doc.text(`Page ${i} / ${totalPages}`, pw - 14, ph - 9, { align: "right" });
  }
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
    const isAnnuel = !mois;

    const ecole = await prisma.ecole.findUnique({
      where: { id: ecoleId },
      select: { nom: true, adresse: true, telephone: true, annee_scolaire: true },
    });

    // ─── Période ───
    let dateGte: Date, dateLt: Date;
    if (mois) {
      dateGte = new Date(annee, mois - 1, 1);
      dateLt  = new Date(annee, mois, 1);
    } else {
      dateGte = new Date(annee, 0, 1);
      dateLt  = new Date(annee + 1, 0, 1);
    }
    const periodeLabel = mois ? `${MOIS_NOMS[mois]} ${annee}` : `Exercice ${annee}`;

    // ─── Données globales ───
    const [paiements, depenses] = await Promise.all([
      prisma.paiement.findMany({
        where: {
          statut: "PAYE",
          eleve: { classe: { ecole_id: ecoleId } },
          date_paiement: { gte: dateGte, lt: dateLt },
        },
        select: { montant: true, mode: true, date_paiement: true, mois: true, annee: true },
      }),
      prisma.depense.findMany({
        where: { ecole_id: ecoleId, date: { gte: dateGte, lt: dateLt } },
        select: { montant: true, categorie: true, date: true },
      }),
    ]);

    const totalRecettes = paiements.reduce((s, p) => s + p.montant, 0);
    const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
    const solde = totalRecettes - totalDepenses;

    // Recettes par mode
    const recettesParMode: Record<string, number> = {};
    for (const p of paiements) {
      const mode = p.mode || "ESPECES";
      recettesParMode[mode] = (recettesParMode[mode] || 0) + p.montant;
    }

    // Dépenses par catégorie
    const depensesParCat: Record<string, number> = {};
    for (const d of depenses) {
      depensesParCat[d.categorie] = (depensesParCat[d.categorie] || 0) + d.montant;
    }

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

    // ─── Ventilation mensuelle (bilan annuel uniquement) ───
    let ventilationMensuelle: Array<{
      mois: number; anneeM: number; label: string;
      recettes: number; depenses: number; solde: number;
    }> = [];

    if (isAnnuel) {
      for (const m of MOIS_SCOLAIRES) {
        const anneeM = m >= 10 ? annee : annee + 1;
        const dGte = new Date(anneeM, m - 1, 1);
        const dLt  = new Date(anneeM, m, 1);

        const [recMois, depMois] = await Promise.all([
          prisma.paiement.aggregate({
            where: { statut: "PAYE", eleve: { classe: { ecole_id: ecoleId } }, date_paiement: { gte: dGte, lt: dLt } },
            _sum: { montant: true },
          }),
          prisma.depense.aggregate({
            where: { ecole_id: ecoleId, date: { gte: dGte, lt: dLt } },
            _sum: { montant: true },
          }),
        ]);

        const r = recMois._sum.montant ?? 0;
        const d = depMois._sum.montant ?? 0;
        ventilationMensuelle.push({ mois: m, anneeM, label: `${MOIS_NOMS[m]} ${anneeM}`, recettes: r, depenses: d, solde: r - d });
      }
    }

    // ─── GÉNÉRATION PDF ───
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const MARGIN = 14;

    // ══════════ EN-TÊTE ══════════
    // Bande bleue principale
    doc.setFillColor(...C_BLUE);
    doc.rect(0, 0, pw, 38, "F");

    // Accent décoratif (triangle en coin)
    doc.setFillColor(37, 99, 235);
    doc.triangle(pw - 40, 0, pw, 0, pw, 40, "F");

    doc.setTextColor(...C_WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text((ecole?.nom || "ÉTABLISSEMENT").toUpperCase(), MARGIN, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    if (ecole?.adresse) doc.text(ecole.adresse, MARGIN, 20);
    const infos = [ecole?.telephone ? `Tél : ${ecole.telephone}` : "", ecole?.annee_scolaire ? `Année scolaire : ${ecole.annee_scolaire}` : ""].filter(Boolean).join("   |   ");
    if (infos) doc.text(infos, MARGIN, 26);

    // Badge type de document
    doc.setFillColor(255, 255, 255, 0.15);
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(MARGIN, 31, 55, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_WHITE);
    doc.text("BILAN FINANCIER ANNUEL", MARGIN + 2, 35.2);

    // ══════════ TITRE ══════════
    let cy = 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C_BLUE);
    doc.text(periodeLabel.toUpperCase(), pw / 2, cy, { align: "center" });

    // Ligne décorative sous le titre
    cy += 3;
    doc.setDrawColor(...C_BLUE);
    doc.setLineWidth(0.8);
    doc.line(pw / 2 - 40, cy, pw / 2 + 40, cy);
    cy += 7;

    // ══════════ CARTES KPI ══════════
    const cardW = (pw - MARGIN * 2 - 9) / 4;
    const cardH = 22;

    kpiCard(doc, MARGIN,                   cy, cardW, cardH, "Recettes totales", fCFA(totalRecettes), C_GREEN);
    kpiCard(doc, MARGIN + cardW + 3,       cy, cardW, cardH, "Dépenses totales", fCFA(totalDepenses), C_RED);
    kpiCard(doc, MARGIN + (cardW + 3) * 2, cy, cardW, cardH, "Solde net", (solde >= 0 ? "+" : "") + fCFA(solde), solde >= 0 ? C_GREEN : C_RED);
    kpiCard(doc, MARGIN + (cardW + 3) * 3, cy, cardW, cardH, "Recouvrement", `${tauxRecouvrement} %`, C_PURPLE);

    // Sous-label recouvrement
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_GRAY);
    doc.text(`${mensPayees}/${mensTotal} mensualités`, MARGIN + (cardW + 3) * 3 + 6, cy + cardH - 4);

    cy += cardH + 10;

    // ══════════ TABLEAU VENTILATION MENSUELLE (annuel uniquement) ══════════
    if (isAnnuel && ventilationMensuelle.length > 0) {
      // Titre section
      doc.setFillColor(...C_BG);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(MARGIN, cy - 1, pw - MARGIN * 2, 7, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C_BLUE);
      doc.text("Ventilation mensuelle", MARGIN + 3, cy + 4);
      cy += 10;

      // Calcul solde cumulatif
      let cumulatif = 0;
      const bodyMensuel = ventilationMensuelle.map((row) => {
        cumulatif += row.solde;
        return [
          row.label,
          fCFA(row.recettes),
          fCFA(row.depenses),
          (row.solde >= 0 ? "+" : "") + fCFA(row.solde),
          (cumulatif >= 0 ? "+" : "") + fCFA(cumulatif),
        ];
      });

      autoTable(doc, {
        startY: cy,
        head: [["Mois", "Recettes", "Dépenses", "Solde du mois", "Solde cumulatif"]],
        body: bodyMensuel,
        foot: [["TOTAL", fCFA(totalRecettes), fCFA(totalDepenses), (solde >= 0 ? "+" : "") + fCFA(solde), ""]],
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: C_BLUE,
          textColor: C_WHITE,
          fontStyle: "bold",
          fontSize: 7.5,
          halign: "center",
        },
        footStyles: {
          fillColor: [226, 232, 240],
          textColor: C_BLUE,
          fontStyle: "bold",
          fontSize: 7.5,
        },
        columnStyles: {
          0: { cellWidth: 32, halign: "left" },
          1: { cellWidth: 35, halign: "right" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
          4: { cellWidth: 38, halign: "right" },
        },
        // Colorier les soldes positifs en vert, négatifs en rouge
        didParseCell: (data) => {
          if (data.section === "body" && (data.column.index === 3 || data.column.index === 4)) {
            const val = ventilationMensuelle[data.row.index];
            if (!val) return;
            const isNeg = data.column.index === 3 ? val.solde < 0 : false;
            data.cell.styles.textColor = isNeg ? C_RED : C_GREEN;
            data.cell.styles.fontStyle = "bold";
          }
          if (data.section === "body" && data.column.index === 0) {
            data.cell.styles.fontStyle = "bold";
          }
        },
        margin: { left: MARGIN, right: MARGIN },
      });

      cy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? cy + 60;
      cy += 10;
    }

    // ══════════ TABLEAUX RÉCAPITULATIFS CÔTE À CÔTE ══════════
    const halfW = (pw - MARGIN * 2 - 6) / 2;

    // Titre recettes
    doc.setFillColor(...C_BG);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(MARGIN, cy - 1, halfW, 7, 1, 1, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C_GREEN);
    doc.text("Recettes par mode", MARGIN + 3, cy + 4);

    // Titre dépenses
    doc.setFillColor(...C_BG);
    doc.roundedRect(MARGIN + halfW + 6, cy - 1, halfW, 7, 1, 1, "FD");
    doc.setTextColor(...C_RED);
    doc.text("Dépenses par catégorie", MARGIN + halfW + 6 + 3, cy + 4);
    cy += 10;

    const startYRecap = cy;

    // Tableau recettes par mode (colonne gauche)
    const recBody = Object.entries(recettesParMode).map(([mode, montant]) => [
      MODE_LABELS[mode] || mode,
      fCFA(montant),
      pct(montant, totalRecettes),
    ]);
    if (recBody.length === 0) recBody.push(["Aucune recette", "0 FCFA", "0 %"]);

    autoTable(doc, {
      startY: startYRecap,
      head: [["Mode", "Montant", "%"]],
      body: recBody,
      foot: [["Total", fCFA(totalRecettes), "100 %"]],
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: { fillColor: C_GREEN, textColor: C_WHITE, fontStyle: "bold", fontSize: 7.5 },
      footStyles: { fillColor: [240, 253, 244], textColor: C_GREEN, fontStyle: "bold", fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: halfW * 0.45, halign: "left" },
        1: { cellWidth: halfW * 0.35, halign: "right" },
        2: { cellWidth: halfW * 0.2,  halign: "center" },
      },
      margin: { left: MARGIN, right: MARGIN + halfW + 6 },
    });

    // Tableau dépenses par catégorie (colonne droite)
    const depBody = Object.entries(depensesParCat).map(([cat, montant]) => [
      CAT_LABELS[cat] || cat,
      fCFA(montant),
      pct(montant, totalDepenses),
    ]);
    if (depBody.length === 0) depBody.push(["Aucune dépense", "0 FCFA", "0 %"]);

    autoTable(doc, {
      startY: startYRecap,
      head: [["Catégorie", "Montant", "%"]],
      body: depBody,
      foot: [["Total", fCFA(totalDepenses), "100 %"]],
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: { fillColor: C_RED, textColor: C_WHITE, fontStyle: "bold", fontSize: 7.5 },
      footStyles: { fillColor: [254, 242, 242], textColor: C_RED, fontStyle: "bold", fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: halfW * 0.45, halign: "left" },
        1: { cellWidth: halfW * 0.35, halign: "right" },
        2: { cellWidth: halfW * 0.2,  halign: "center" },
      },
      margin: { left: MARGIN + halfW + 6, right: MARGIN },
    });

    cy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? cy + 40;
    cy += 10;

    // ══════════ ENCADRÉ SOLDE FINAL ══════════
    const soldeColor = solde >= 0 ? C_GREEN : C_RED;
    const soldeBg   = solde >= 0 ? [240, 253, 244] as [number,number,number] : [254, 242, 242] as [number,number,number];

    doc.setFillColor(...soldeBg);
    doc.setDrawColor(...soldeColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, cy, pw - MARGIN * 2, 20, 2, 2, "FD");

    // Barre gauche épaisse
    doc.setFillColor(...soldeColor);
    doc.roundedRect(MARGIN, cy, 4, 20, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C_GRAY);
    doc.text("RÉSULTAT NET DE L'EXERCICE", MARGIN + 8, cy + 8);

    doc.setFontSize(13);
    doc.setTextColor(...soldeColor);
    const soldeStr = (solde >= 0 ? "+" : "") + fCFA(solde);
    doc.text(soldeStr, pw - MARGIN - 4, cy + 13, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_GRAY);
    const situationTxt = solde >= 0
      ? `Excédent budgétaire — Recettes supérieures aux dépenses de ${fCFA(solde)}`
      : `Déficit budgétaire — Dépenses supérieures aux recettes de ${fCFA(Math.abs(solde))}`;
    doc.text(situationTxt, MARGIN + 8, cy + 15);

    // ══════════ PIED DE PAGE ══════════
    addFooter(doc, ecole?.nom || "");

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filename = `bilan_financier_${mois ? `${MOIS_NOMS[mois].toLowerCase()}_${annee}` : annee}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[COMPTABILITE_BILAN_PDF_GET] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
