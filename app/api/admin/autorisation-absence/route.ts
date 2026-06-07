import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDate(d: string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return `${date.getDate()} ${MOIS[date.getMonth() + 1]} ${date.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const p = req.nextUrl.searchParams;
  const nom       = p.get("nom")        ?? "";
  const poste     = p.get("poste")      ?? "";
  const dateDebut = p.get("date_debut") ?? "";
  const dateFin   = p.get("date_fin")   ?? "";
  const motif     = p.get("motif")      ?? "";

  if (!nom || !poste || !dateDebut || !dateFin) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const ecole = await prisma.ecole.findUnique({ where: { id: session.user.ecoleId } });
  const directeur = await prisma.user.findFirst({
    where: { ecole_id: session.user.ecoleId, role: "SUPER_ADMIN" },
    select: { nom: true, prenom: true },
  });

  const ecoleName = ecole?.nom ?? "École";
  const dirNom = directeur ? `${directeur.prenom} ${directeur.nom}` : "Le Directeur";
  const dateAujourd = formatDate(new Date().toISOString().split("T")[0]);

  // ── Génération PDF ──
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const margin = 20;
  const center = W / 2;

  // Fond
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, 297, "F");

  // Bandeau header
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DU SÉNÉGAL", margin, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Ministère de l'Éducation Nationale", margin, 16);
  doc.text("Un Peuple – Un But – Une Foi", margin, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(ecoleName.toUpperCase(), W - margin, 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  if (ecole?.adresse) doc.text(ecole.adresse, W - margin, 16, { align: "right" });
  if (ecole?.telephone) doc.text(ecole.telephone, W - margin, 22, { align: "right" });

  // Ligne dorée
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(margin, 38, W - margin, 38);

  // Titre
  doc.setTextColor(15, 52, 96);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("AUTORISATION D'ABSENCE", center, 60, { align: "center" });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(center - 55, 64, center + 55, 64);

  // Corps
  let y = 85;
  const lineH = 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  doc.text("Je soussigné,", margin, y); y += lineH;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(dirNom, center, y, { align: "center" }); y += lineH * 0.8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Directeur de l'école ${ecoleName}`, center, y, { align: "center" }); y += lineH * 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Autorise l'absence de :", margin, y); y += lineH;

  // Nom encadré
  doc.setFillColor(235, 240, 255);
  doc.setDrawColor(15, 52, 96);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y - 5, W - 2 * margin, 12, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 52, 96);
  doc.text(nom.toUpperCase(), center, y + 3, { align: "center" }); y += lineH * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  // Poste
  doc.text("Poste / Fonction :", margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(poste, margin + 42, y); y += lineH;

  // Période
  doc.setFont("helvetica", "normal");
  doc.text("Période d'absence :", margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Du ${formatDate(dateDebut)} au ${formatDate(dateFin)}`, margin + 44, y); y += lineH;

  // Motif
  if (motif) {
    doc.setFont("helvetica", "normal");
    doc.text("Motif :", margin, y); y += lineH * 0.5;
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    const motifLines = doc.splitTextToSize(motif, W - 2 * margin - 4);
    const boxH = Math.max(motifLines.length * 7 + 8, 20);
    doc.roundedRect(margin, y - 3, W - 2 * margin, boxH, 2, 2, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(motifLines, margin + 4, y + 3);
    y += boxH + 5;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
  } else {
    y += lineH;
  }

  y += lineH;
  doc.setFont("helvetica", "normal");
  const clause = doc.splitTextToSize(
    "Cette autorisation est accordée à titre exceptionnel et l'intéressé(e) devra reprendre ses fonctions à la date prévue.",
    W - 2 * margin
  );
  doc.text(clause, margin, y); y += clause.length * 7 + lineH;

  // Date et signature
  doc.text(`Fait à Dakar, le ${dateAujourd}`, W - margin, y, { align: "right" }); y += lineH * 2;
  doc.setFont("helvetica", "bold");
  doc.text("Le Directeur", W - margin, y, { align: "right" }); y += lineH * 0.6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(dirNom, W - margin, y, { align: "right" }); y += lineH * 3.5;

  // Ligne de signature
  doc.setDrawColor(15, 52, 96);
  doc.setLineWidth(0.3);
  doc.line(W - margin - 60, y, W - margin, y);

  // Footer
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 283, W, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `${ecoleName}${ecole?.adresse ? " · " + ecole.adresse : ""}${ecole?.telephone ? " · " + ecole.telephone : ""}`,
    center, 291, { align: "center" }
  );

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="autorisation-absence-${nom.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
