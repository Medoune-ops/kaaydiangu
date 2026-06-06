import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

// ─── Palette ───
const BLUE_DARK   = "1E40AF";
const BLUE_MED    = "3B82F6";
const GREEN_DARK  = "16A34A";
const GREEN_LIGHT = "D1FAE5";
const RED_DARK    = "DC2626";
const RED_LIGHT   = "FEE2E2";
const PURPLE      = "7C3AED";
const PURPLE_LIGHT= "EDE9FE";
const ORANGE_DARK = "EA580C";
const ORANGE_LIGHT= "FFEDD5";
const GRAY_DARK   = "1E293B";
const GRAY_ROW    = "F8FAFC";
const WHITE       = "FFFFFF";
const GOLD        = "F59E0B";
const GOLD_LIGHT  = "FEF3C7";
const BORDER      = "CBD5E1";

function getMention(avg: number): string {
  if (avg >= 18) return "Très Bien";
  if (avg >= 16) return "Bien";
  if (avg >= 14) return "Assez Bien";
  if (avg >= 12) return "Passable";
  if (avg >= 10) return "Insuffisant";
  return "Faible";
}

function getDecision(avg: number): string {
  return avg >= 10 ? "Admis(e)" : "Redoublant(e)";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function hdr(bgHex: string): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: "FF" + WHITE }, size: 10, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top:    { style: "thin", color: { argb: "FF" + BORDER } },
      bottom: { style: "thin", color: { argb: "FF" + BORDER } },
      left:   { style: "thin", color: { argb: "FF" + BORDER } },
      right:  { style: "thin", color: { argb: "FF" + BORDER } },
    },
  };
}

function row(even: boolean, align: ExcelJS.Alignment["horizontal"] = "left"): Partial<ExcelJS.Style> {
  return {
    font: { size: 9.5, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (even ? GRAY_ROW : WHITE) } },
    alignment: { horizontal: align, vertical: "middle", shrinkToFit: true },
    border: {
      top:    { style: "hair", color: { argb: "FF" + BORDER } },
      bottom: { style: "hair", color: { argb: "FF" + BORDER } },
      left:   { style: "thin", color: { argb: "FF" + BORDER } },
      right:  { style: "thin", color: { argb: "FF" + BORDER } },
    },
  };
}

function totStyle(bgHex: string, fgHex: string): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, size: 10, name: "Calibri", color: { argb: "FF" + fgHex } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "right", vertical: "middle" },
    border: {
      top:    { style: "medium", color: { argb: "FF" + BORDER } },
      bottom: { style: "medium", color: { argb: "FF" + BORDER } },
      left:   { style: "thin",   color: { argb: "FF" + BORDER } },
      right:  { style: "thin",   color: { argb: "FF" + BORDER } },
    },
  };
}

function sectionTitle(ws: ExcelJS.Worksheet, rowNum: number, text: string, cols: number, bgHex: string) {
  ws.getRow(rowNum).height = 22;
  const c = ws.getCell(rowNum, 1);
  c.value = text;
  c.style = {
    font: { bold: true, size: 11, color: { argb: "FF" + WHITE }, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "left", vertical: "middle", indent: 1 },
  };
  ws.mergeCells(rowNum, 1, rowNum, cols);
}

function sheetTitle(ws: ExcelJS.Worksheet, text: string, cols: number, bgHex: string) {
  ws.mergeCells(1, 1, 1, cols);
  const c = ws.getCell("A1");
  c.value = text;
  c.style = {
    font: { bold: true, size: 13, color: { argb: "FF" + WHITE }, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  ws.getRow(1).height = 32;
}

function sheetSubtitle(ws: ExcelJS.Worksheet, text: string, cols: number, bgHex: string) {
  ws.mergeCells(2, 1, 2, cols);
  const c = ws.getCell("A2");
  c.value = text;
  c.style = {
    font: { size: 9, color: { argb: "FF" + WHITE }, name: "Calibri" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  ws.getRow(2).height = 16;
}

// Colore une cellule selon la moyenne
function avgStyle(avg: number | null, even: boolean): Partial<ExcelJS.Style> {
  const base = row(even, "center");
  if (avg === null) return base;
  const color = avg >= 14 ? GREEN_DARK : avg >= 10 ? ORANGE_DARK : RED_DARK;
  return { ...base, font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + color } } };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const classeId = searchParams.get("classeId");
    if (!classeId) {
      return NextResponse.json({ error: "classeId requis" }, { status: 400 });
    }

    const ecoleId = session.user.ecoleId;

    const classe = await prisma.classe.findFirst({
      where: { id: classeId, ecole_id: ecoleId },
      include: {
        matieres: { orderBy: { nom: "asc" } },
        eleves: {
          where: { actif: true },
          include: {
            notes: { include: { matiere: { select: { id: true, nom: true } } } },
            absences: { include: { matiere: { select: { nom: true } } } },
            paiements: {},
          },
          orderBy: [{ nom: "asc" }, { prenom: "asc" }],
        },
        ecole: { select: { nom: true, adresse: true, telephone: true, annee_scolaire: true } },
      },
    });

    if (!classe) {
      return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
    }

    const ecole = classe.ecole;
    const dateGen = new Date().toLocaleDateString("fr-FR");

    // ─── Calcul bilans élèves ───
    interface StudentBilan {
      id: string;
      matricule: string;
      nom: string;
      prenom: string;
      subjectAvgs: Map<string, number | null>;
      moyGén: number | null;
      rang: number;
      totalAbs: number;
      absJustifiées: number;
      absNonJustifiées: number;
      totalPayé: number;
      nbMensualités: number;
      nbPayées: number;
      mention: string;
      decision: string;
    }

    const bilans: StudentBilan[] = classe.eleves.map((eleve) => {
      const subjectAvgs = new Map<string, number | null>();
      for (const mat of classe.matieres) {
        const notes = eleve.notes.filter((n) => n.matiere_id === mat.id);
        subjectAvgs.set(
          mat.id,
          notes.length > 0 ? round2(notes.reduce((s, n) => s + n.valeur, 0) / notes.length) : null
        );
      }

      let sumW = 0, sumC = 0;
      for (const mat of classe.matieres) {
        const avg = subjectAvgs.get(mat.id);
        if (avg !== null && avg !== undefined) {
          sumW += avg * mat.coefficient;
          sumC += mat.coefficient;
        }
      }
      const moyGén = sumC > 0 ? round2(sumW / sumC) : null;
      const totalAbs = round2(eleve.absences.reduce((s, a) => s + a.duree_heures, 0));
      const absJustifiées = round2(eleve.absences.filter((a) => a.justifiee).reduce((s, a) => s + a.duree_heures, 0));
      const totalPayé = eleve.paiements.filter((p) => p.statut === "PAYE").reduce((s, p) => s + p.montant, 0);
      const nbMensualités = eleve.paiements.length;
      const nbPayées = eleve.paiements.filter((p) => p.statut === "PAYE").length;

      return {
        id: eleve.id,
        matricule: eleve.matricule,
        nom: eleve.nom,
        prenom: eleve.prenom,
        subjectAvgs,
        moyGén,
        rang: 0,
        totalAbs,
        absJustifiées,
        absNonJustifiées: round2(totalAbs - absJustifiées),
        totalPayé,
        nbMensualités,
        nbPayées,
        mention: moyGén !== null ? getMention(moyGén) : "—",
        decision: moyGén !== null ? getDecision(moyGén) : "—",
      };
    });

    const sorted = [...bilans].sort((a, b) => {
      if (a.moyGén === null) return 1;
      if (b.moyGén === null) return -1;
      return b.moyGén - a.moyGén;
    });
    sorted.forEach((s, i) => { s.rang = i + 1; });
    const bilanById = new Map(bilans.map((b) => [b.id, b]));
    bilans.forEach((b) => { b.rang = bilanById.get(b.id)!.rang; });

    const withGrade  = bilans.filter((s) => s.moyGén !== null);
    const admitted   = withGrade.filter((s) => s.moyGén! >= 10);
    const classAvg   = withGrade.length > 0 ? round2(withGrade.reduce((s, b) => s + b.moyGén!, 0) / withGrade.length) : null;
    const successPct = withGrade.length > 0 ? Math.round((admitted.length / withGrade.length) * 100) : 0;
    const matieres   = classe.matieres;

    // ─── WORKBOOK ───
    const wb = new ExcelJS.Workbook();
    wb.creator  = ecole.nom || "Mon École";
    wb.created  = new Date();
    wb.modified = new Date();

    // ══════════════════════════════════════════════════════
    // Onglet 1 — CLASSEMENT
    // ══════════════════════════════════════════════════════
    const wsClass = wb.addWorksheet("Classement", {
      properties: { tabColor: { argb: "FF" + BLUE_DARK } },
    });
    wsClass.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];

    const COLS_C = 8;
    wsClass.columns = [
      { width: 7 }, { width: 18 }, { width: 30 }, { width: 14 },
      { width: 16 }, { width: 12 }, { width: 22 }, { width: 18 },
    ];

    sheetTitle(wsClass, `CLASSEMENT ANNUEL — ${classe.nom.toUpperCase()} — ${ecole.annee_scolaire || ""}`, COLS_C, BLUE_DARK);
    sheetSubtitle(wsClass, `${classe.niveau}${classe.filiere ? " · " + classe.filiere : ""} · Généré le ${dateGen}`, COLS_C, BLUE_MED);

    // KPIs ligne 3-4
    wsClass.getRow(3).height = 16;
    wsClass.getRow(4).height = 22;
    const kpiL = ["Effectif", "Admis(es)", "Taux de réussite", "Moy. de classe", "Nb matières", "Montant scolarité", "", ""];
    const kpiV = [
      String(bilans.length),
      `${admitted.length} / ${withGrade.length}`,
      `${successPct} %`,
      classAvg !== null ? `${classAvg}/20` : "—",
      String(matieres.length),
      classe.montant_scolarite > 0 ? `${classe.montant_scolarite.toLocaleString("fr-FR")} FCFA/mois` : "—",
      "", "",
    ];
    const kpiC = [BLUE_DARK, admitted.length >= withGrade.length / 2 ? GREEN_DARK : RED_DARK, successPct >= 50 ? GREEN_DARK : RED_DARK, PURPLE, GRAY_DARK, ORANGE_DARK, BLUE_DARK, BLUE_DARK];

    kpiL.forEach((lbl, i) => {
      if (!lbl) return;
      const lc = wsClass.getCell(3, i + 1);
      lc.value = lbl.toUpperCase();
      lc.style = { font: { bold: true, size: 8, color: { argb: "FF" + kpiC[i] }, name: "Calibri" }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } }, alignment: { horizontal: "center", vertical: "bottom" }, border: { top: { style: "medium", color: { argb: "FF" + kpiC[i] } } } };
      const vc = wsClass.getCell(4, i + 1);
      vc.value = kpiV[i];
      vc.style = { font: { bold: true, size: 11, color: { argb: "FF" + kpiC[i] }, name: "Calibri" }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } }, alignment: { horizontal: "center", vertical: "middle" }, border: { bottom: { style: "medium", color: { argb: "FF" + kpiC[i] } } } };
    });

    wsClass.getRow(5).height = 8;
    sectionTitle(wsClass, 6, "  TABLEAU DE CLASSEMENT", COLS_C, BLUE_DARK);

    const clHeaders = ["Rang", "Matricule", "Nom & Prénom", "Moy. Gén.", "Mention", "Absences", "Scolarité payée", "Décision"];
    wsClass.getRow(7).height = 20;
    clHeaders.forEach((h, i) => {
      const c = wsClass.getCell(7, i + 1);
      c.value = h;
      c.style = hdr(BLUE_MED);
    });

    sorted.forEach((s, idx) => {
      const even = idx % 2 === 1;
      const r = wsClass.getRow(8 + idx);
      r.height = 17;
      const decColor = s.decision.includes("Admis") ? GREEN_DARK : RED_DARK;
      const mentColor = (s.moyGén ?? 0) >= 14 ? GREEN_DARK : (s.moyGén ?? 0) >= 10 ? ORANGE_DARK : RED_DARK;

      [
        [s.rang, "center"],
        [s.matricule, "center"],
        [`${s.prenom} ${s.nom}`, "left"],
        [s.moyGén !== null ? s.moyGén : "—", "center"],
        [s.mention, "center"],
        [s.totalAbs, "center"],
        [s.totalPayé, "right"],
        [s.decision, "center"],
      ].forEach(([val, align], i) => {
        const c = wsClass.getCell(8 + idx, i + 1);
        c.value = val as string | number;
        if (i === 3) { c.style = avgStyle(s.moyGén, even); c.numFmt = '0.00"/20"'; }
        else if (i === 4) { c.style = { ...row(even, "center"), font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + mentColor } } }; }
        else if (i === 6) { c.style = { ...row(even, "right"), font: { size: 9.5, name: "Calibri" } }; c.numFmt = '#,##0 "FCFA"'; }
        else if (i === 7) { c.style = { ...row(even, "center"), font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + decColor } } }; }
        else { c.style = row(even, align as ExcelJS.Alignment["horizontal"]); }
        if (i === 5) c.numFmt = '0.0"h"';
      });
    });

    // ══════════════════════════════════════════════════════
    // Onglet 2 — NOTES PAR MATIÈRE
    // ══════════════════════════════════════════════════════
    const wsNotes = wb.addWorksheet("Notes par matière", {
      properties: { tabColor: { argb: "FF" + PURPLE } },
    });
    wsNotes.views = [{ state: "frozen", xSplit: 3, ySplit: 4 }];

    const FIXED = 3; // Rang, Matricule, Nom
    const COLS_N = FIXED + matieres.length + 1; // +1 pour Moy. Gén.
    wsNotes.columns = [
      { width: 7 }, { width: 18 }, { width: 30 },
      ...matieres.map(() => ({ width: 14 })),
      { width: 14 },
    ];

    sheetTitle(wsNotes, `NOTES PAR MATIÈRE — ${classe.nom.toUpperCase()} — ${ecole.annee_scolaire || ""}`, COLS_N, PURPLE);
    sheetSubtitle(wsNotes, `Moyennes calculées sur l'ensemble des notes saisies · Généré le ${dateGen}`, COLS_N, "7C3AED");

    // Ligne 3 : coefficients
    wsNotes.getRow(3).height = 16;
    wsNotes.getCell(3, 1).value = "";
    wsNotes.getCell(3, 2).value = "";
    wsNotes.getCell(3, 3).value = "Coefficient →";
    wsNotes.getCell(3, 3).style = { font: { bold: true, italic: true, size: 9, name: "Calibri", color: { argb: "FF" + GRAY_DARK } }, alignment: { horizontal: "right" } };
    matieres.forEach((m, i) => {
      const c = wsNotes.getCell(3, FIXED + 1 + i);
      c.value = m.coefficient;
      c.style = { font: { bold: true, size: 9, name: "Calibri", color: { argb: "FF" + PURPLE } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + PURPLE_LIGHT } }, alignment: { horizontal: "center" } };
    });

    // Ligne 4 : en-têtes
    wsNotes.getRow(4).height = 20;
    ["Rang", "Matricule", "Nom & Prénom", ...matieres.map((m) => m.nom), "Moy. Gén."].forEach((h, i) => {
      const c = wsNotes.getCell(4, i + 1);
      c.value = h;
      c.style = hdr(i >= FIXED && i < FIXED + matieres.length ? PURPLE : BLUE_DARK);
    });

    sorted.forEach((s, idx) => {
      const even = idx % 2 === 1;
      wsNotes.getRow(5 + idx).height = 16;

      wsNotes.getCell(5 + idx, 1).value = s.rang;
      wsNotes.getCell(5 + idx, 1).style = row(even, "center");
      wsNotes.getCell(5 + idx, 2).value = s.matricule;
      wsNotes.getCell(5 + idx, 2).style = row(even, "center");
      wsNotes.getCell(5 + idx, 3).value = `${s.prenom} ${s.nom}`;
      wsNotes.getCell(5 + idx, 3).style = { ...row(even, "left"), font: { bold: true, size: 9.5, name: "Calibri" } };

      matieres.forEach((mat, mi) => {
        const avg = s.subjectAvgs.get(mat.id) ?? null;
        const c = wsNotes.getCell(5 + idx, FIXED + 1 + mi);
        c.value = avg ?? "—";
        c.style = avgStyle(avg, even);
        if (avg !== null) c.numFmt = "0.00";
      });

      const gc = wsNotes.getCell(5 + idx, COLS_N);
      gc.value = s.moyGén ?? "—";
      gc.style = avgStyle(s.moyGén, even);
      if (s.moyGén !== null) gc.numFmt = "0.00";
    });

    // Ligne moyennes de la classe par matière
    const avgRow = wsNotes.getRow(5 + sorted.length);
    avgRow.height = 18;
    wsNotes.mergeCells(5 + sorted.length, 1, 5 + sorted.length, 3);
    wsNotes.getCell(5 + sorted.length, 1).value = "MOYENNE DE CLASSE";
    wsNotes.getCell(5 + sorted.length, 1).style = totStyle(GOLD_LIGHT, GOLD);
    wsNotes.getCell(5 + sorted.length, 1).style.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    matieres.forEach((mat, mi) => {
      const avgs = sorted.map((s) => s.subjectAvgs.get(mat.id)).filter((v): v is number => v !== null);
      const matAvg = avgs.length > 0 ? round2(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
      const c = wsNotes.getCell(5 + sorted.length, FIXED + 1 + mi);
      c.value = matAvg ?? "—";
      // Build the full style in one shot — ExcelJS cell.style is a setter, mutating after assignment is a no-op
      const matBaseStyle = avgStyle(matAvg, false);
      c.style = { ...matBaseStyle, font: { ...matBaseStyle.font, bold: true, size: 10 } };
      if (matAvg !== null) c.numFmt = "0.00";
    });

    const gcAvg = wsNotes.getCell(5 + sorted.length, COLS_N);
    gcAvg.value = classAvg ?? "—";
    const gcBaseStyle = avgStyle(classAvg, false);
    gcAvg.style = { ...gcBaseStyle, font: { ...gcBaseStyle.font, bold: true, size: 10 } };
    if (classAvg !== null) gcAvg.numFmt = "0.00";

    // ══════════════════════════════════════════════════════
    // Onglet 3 — ABSENCES & PAIEMENTS
    // ══════════════════════════════════════════════════════
    const wsAP = wb.addWorksheet("Absences & Paiements", {
      properties: { tabColor: { argb: "FF" + ORANGE_DARK } },
    });
    wsAP.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];
    wsAP.columns = [
      { width: 18 }, { width: 30 }, { width: 12 }, { width: 14 }, { width: 16 },
      { width: 4 },
      { width: 14 }, { width: 20 }, { width: 12 }, { width: 16 },
    ];

    const COLS_AP = 10;
    sheetTitle(wsAP, `ABSENCES & PAIEMENTS — ${classe.nom.toUpperCase()} — ${ecole.annee_scolaire || ""}`, COLS_AP, ORANGE_DARK);
    sheetSubtitle(wsAP, `Données par élève · Généré le ${dateGen}`, COLS_AP, "F97316");

    wsAP.getRow(3).height = 20;
    ["Matricule", "Nom & Prénom", "Abs. totales", "Abs. justif.", "Abs. non justif.", "", "Montant payé", "Scolarité due/mois", "Nb mensualités", "Nb payées"].forEach((h, i) => {
      if (h === "") return;
      const c = wsAP.getCell(3, i + 1);
      c.value = h;
      c.style = hdr(i < 5 ? ORANGE_DARK : GREEN_DARK);
    });

    sorted.forEach((s, idx) => {
      const even = idx % 2 === 1;
      wsAP.getRow(4 + idx).height = 16;
      const scolariteDue = classe.montant_scolarite;
      const taux = s.nbMensualités > 0 ? Math.round((s.nbPayées / s.nbMensualités) * 100) : 0;
      const payColor = taux >= 80 ? GREEN_DARK : taux >= 50 ? ORANGE_DARK : RED_DARK;

      const vals: [string | number, ExcelJS.Alignment["horizontal"], string?][] = [
        [s.matricule, "center"],
        [`${s.prenom} ${s.nom}`, "left"],
        [s.totalAbs, "center", '0.0"h"'],
        [s.absJustifiées, "center", '0.0"h"'],
        [s.absNonJustifiées, "center", '0.0"h"'],
        ["", "center"],
        [s.totalPayé, "right", '#,##0 "FCFA"'],
        [scolariteDue, "right", '#,##0 "FCFA"'],
        [s.nbMensualités, "center"],
        [`${s.nbPayées}/${s.nbMensualités} (${taux} %)`, "center"],
      ];

      vals.forEach(([val, align, fmt], i) => {
        if (i === 5) return;
        const c = wsAP.getCell(4 + idx, i + 1);
        c.value = val;
        if (i === 9) {
          c.style = { ...row(even, "center"), font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + payColor } } };
        } else {
          c.style = row(even, align);
        }
        if (fmt) c.numFmt = fmt;
      });
    });

    // ══════════════════════════════════════════════════════
    // Onglet 4 — EXPORT NOUVELLE ANNÉE (archivage)
    // ══════════════════════════════════════════════════════
    const wsExport = wb.addWorksheet("Export nouvelle année", {
      properties: { tabColor: { argb: "FF" + GREEN_DARK } },
    });
    wsExport.views = [{ state: "frozen", xSplit: 0, ySplit: 4 }];
    wsExport.columns = [
      { width: 18 }, { width: 20 }, { width: 20 }, { width: 24 },
      { width: 14 }, { width: 18 }, { width: 14 }, { width: 16 },
      { width: 16 }, { width: 18 },
    ];

    const COLS_E = 10;
    sheetTitle(wsExport, `EXPORT NOUVELLE ANNÉE — ${classe.nom.toUpperCase()} — ${ecole.annee_scolaire || ""}`, COLS_E, GREEN_DARK);
    sheetSubtitle(wsExport, `Données de transition · Utilisez ce fichier pour inscrire les élèves dans l'année suivante · Généré le ${dateGen}`, COLS_E, "22C55E");

    wsExport.mergeCells(3, 1, 3, COLS_E);
    wsExport.getRow(3).height = 20;
    const noticeCell = wsExport.getCell("A3");
    noticeCell.value = "ℹ️  Ce tableau contient toutes les informations nécessaires pour préparer la rentrée suivante. Filtrez sur « Décision » pour séparer admis et redoublants.";
    noticeCell.style = {
      font: { italic: true, size: 9, name: "Calibri", color: { argb: "FF" + GREEN_DARK } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GREEN_LIGHT } },
      alignment: { horizontal: "left", vertical: "middle", indent: 1, wrapText: true },
    };

    wsExport.getRow(4).height = 20;
    ["Matricule", "Nom", "Prénom", "Classe actuelle", "Niveau", "Filière", "Moy. Générale", "Rang", "Décision", "Observations"].forEach((h, i) => {
      const c = wsExport.getCell(4, i + 1);
      c.value = h;
      c.style = hdr(GREEN_DARK);
    });

    sorted.forEach((s, idx) => {
      const even = idx % 2 === 1;
      wsExport.getRow(5 + idx).height = 16;
      const decColor = s.decision.includes("Admis") ? GREEN_DARK : RED_DARK;
      const vals = [
        s.matricule, s.nom, s.prenom,
        classe.nom, classe.niveau, classe.filiere ?? "",
        s.moyGén, s.rang, s.decision,
        s.moyGén === null ? "Pas de notes enregistrées" : "",
      ];
      vals.forEach((val, i) => {
        const c = wsExport.getCell(5 + idx, i + 1);
        c.value = val ?? "";
        if (i === 6) {
          c.style = avgStyle(typeof val === "number" ? val : null, even);
          if (typeof val === "number") c.numFmt = "0.00";
        } else if (i === 8) {
          c.style = { ...row(even, "center"), font: { bold: true, size: 9.5, name: "Calibri", color: { argb: "FF" + decColor } } };
        } else {
          c.style = row(even, "left");
        }
      });
    });

    // Ligne récapitulative
    wsExport.getRow(5 + sorted.length + 1).height = 8;
    sectionTitle(wsExport, 5 + sorted.length + 2, `  RÉSUMÉ : ${admitted.length} admis | ${sorted.length - admitted.length} redoublants | ${sorted.length} élèves total`, COLS_E, successPct >= 50 ? GREEN_DARK : RED_DARK);

    // ─── Génération du buffer ───
    const buffer = await wb.xlsx.writeBuffer();
    const safeName  = classe.nom.replace(/\s+/g, "_").toLowerCase();
    const safeAnnee = (ecole.annee_scolaire || "annee").replace(/\//g, "-");
    const filename  = `bilan_annuel_${safeName}_${safeAnnee}.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[BILAN_ANNUEL_EXCEL] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
