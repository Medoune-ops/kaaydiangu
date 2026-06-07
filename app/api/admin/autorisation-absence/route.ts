import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MOIS[d.getMonth() + 1]} ${d.getFullYear()}`;
}

function nbJours(debut: string, fin: string): number {
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
}

function dotLine(doc: jsPDF, x: number, y: number, width: number) {
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([0.5, 1.2], 0);
  doc.line(x, y, x + width, y);
  doc.setLineDashPattern([], 0);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const p = req.nextUrl.searchParams;
  const nom         = p.get("nom")             ?? "";
  const matricule   = p.get("matricule")        ?? "";
  const grade       = p.get("grade")            ?? "";
  const fonction    = p.get("fonction")         ?? "";
  const dateDebut   = p.get("date_debut")       ?? "";
  const dateFin     = p.get("date_fin")         ?? "";
  const motif       = p.get("motif")            ?? "";
  const dateRestit  = p.get("date_restitution") ?? dateFin;

  if (!nom || !dateDebut || !dateFin) {
    return NextResponse.json({ error: "Paramètres manquants (nom, date_debut, date_fin)" }, { status: 400 });
  }

  const ecole = await prisma.ecole.findUnique({ where: { id: session.user.ecoleId } });
  const ecoleName = ecole?.nom ?? "École";
  const jours = nbJours(dateDebut, dateFin);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const margin = 25;
  const center = W / 2;

  // ── Fond blanc pur ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, 297, "F");

  // ── En-tête centré ──
  let y = 22;
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 80);
  doc.text("MINISTERE DE L'EDUCATION", center, y, { align: "center" });
  y += 7;
  doc.setFontSize(10);
  doc.text("INSPECTION DE L'EDUCATION ET DE LA FORMATION DE SANGALKAM", center, y, { align: "center" });
  y += 6;

  // Ligne pointillée décorative sous le header
  dotLine(doc, center - 45, y, 90);
  y += 14;

  // ── Titre ──
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 10, 10);
  doc.text("DEMANDE D'AUTORISATION D'ABSENCE", center, y, { align: "center" });
  y += 18;

  // ── Champs formulaire ──
  const labelFont = "times";
  const labelSize = 11;
  const fieldX = margin;
  const fieldW = W - 2 * margin;

  function field(label: string, value: string, yPos: number, lineW?: number): number {
    doc.setFont(labelFont, "bold");
    doc.setFontSize(labelSize);
    doc.setTextColor(10, 10, 10);
    doc.text(label, fieldX, yPos);

    const labelW = doc.getTextWidth(label);
    const lx = fieldX + labelW + 2;
    const lw = lineW ?? (fieldW - labelW - 2);

    // Valeur sur la ligne
    if (value) {
      doc.setFont(labelFont, "normal");
      doc.setFontSize(labelSize);
      doc.text(value, lx + 1, yPos);
    }

    dotLine(doc, lx, yPos + 1, lw);
    return yPos + 12;
  }

  // Ecole
  y = field("Ecole ", ecoleName, y);

  // Prénom et Nom
  y = field("Prénom et Nom", nom, y);

  // Matricule ... Grade ...
  doc.setFont(labelFont, "bold");
  doc.setFontSize(labelSize);
  doc.setTextColor(10, 10, 10);
  doc.text("Matricule", fieldX, y);
  const matLabelW = doc.getTextWidth("Matricule");
  const matLineW = 55;
  if (matricule) {
    doc.setFont(labelFont, "normal");
    doc.text(matricule, fieldX + matLabelW + 3, y);
  }
  dotLine(doc, fieldX + matLabelW + 2, y + 1, matLineW);

  const gradeX = fieldX + matLabelW + matLineW + 10;
  doc.setFont(labelFont, "bold");
  doc.text("Grade", gradeX, y);
  const gradeLabelW = doc.getTextWidth("Grade");
  if (grade) {
    doc.setFont(labelFont, "normal");
    doc.text(grade, gradeX + gradeLabelW + 3, y);
  }
  dotLine(doc, gradeX + gradeLabelW + 2, y + 1, fieldW - (gradeX - fieldX) - gradeLabelW - 2);
  y += 12;

  // Fonction
  y = field("Fonction", fonction, y);
  y += 2; // petit espace supplémentaire

  // Nombre de jours sollicités ... Du ... au ...
  const nbJoursLabel = "Nombre de jours sollicités";
  doc.setFont(labelFont, "bold");
  doc.setFontSize(labelSize);
  doc.text(nbJoursLabel, fieldX, y);
  const njLabelW = doc.getTextWidth(nbJoursLabel);

  // valeur nb jours
  const njVal = jours > 0 ? String(jours) : "";
  const njLineW = 20;
  if (njVal) { doc.setFont(labelFont, "normal"); doc.text(njVal, fieldX + njLabelW + 3, y); }
  dotLine(doc, fieldX + njLabelW + 2, y + 1, njLineW);

  // Du
  let cx = fieldX + njLabelW + njLineW + 6;
  doc.setFont(labelFont, "bold");
  doc.text("Du", cx, y);
  const duW = doc.getTextWidth("Du");
  cx += duW + 2;
  const duLineW = 32;
  if (dateDebut) { doc.setFont(labelFont, "normal"); doc.text(formatDate(dateDebut), cx + 1, y); }
  dotLine(doc, cx, y + 1, duLineW);

  // au
  cx += duLineW + 4;
  doc.setFont(labelFont, "bold");
  doc.text("au", cx, y);
  const auW = doc.getTextWidth("au");
  cx += auW + 2;
  const auLineW = W - cx - margin;
  if (dateFin) { doc.setFont(labelFont, "normal"); doc.text(formatDate(dateFin), cx + 1, y); }
  dotLine(doc, cx, y + 1, auLineW);
  y += 14;

  // Motif
  y = field("Motif", motif, y);

  // Date(s) précise(s) de restitution
  y = field("Date(s) précise(s) de restitution", dateRestit ? formatDate(dateRestit) : "", y);

  // ── Espace avant signatures ──
  y += 16;

  // ── Trois colonnes de signature ──
  const col1X = margin;
  const col2X = center - 20;
  const col3X = W - margin - 35;
  const sigLineW = 45;

  doc.setFont(labelFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 10, 10);

  doc.text("L'Intéressé(e)", col1X, y);
  doc.text("le Directeur", col2X, y);
  doc.text("l'Inspecteur", col3X, y);

  y += 24;

  // Lignes de signature
  dotLine(doc, col1X, y, sigLineW);
  dotLine(doc, col2X, y, sigLineW);
  dotLine(doc, col3X, y, sigLineW);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="demande-absence-${nom.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
