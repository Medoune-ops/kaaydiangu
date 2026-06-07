import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDate(d: string | Date): string {
  const date = new Date(d);
  return `${date.getDate()} ${MOIS[date.getMonth() + 1]} ${date.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const eleveId = searchParams.get("eleve_id");
  if (!eleveId) {
    return NextResponse.json({ error: "eleve_id requis" }, { status: 400 });
  }

  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      classe: { include: { ecole: true } },
      user: { select: { email: true } },
    },
  });

  if (!eleve || eleve.classe.ecole_id !== session.user.ecoleId) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const directeur = await prisma.user.findFirst({
    where: { ecole_id: session.user.ecoleId, role: "SUPER_ADMIN" },
    select: { nom: true, prenom: true },
  });

  const ecole = eleve.classe.ecole;
  const dateAujourd = formatDate(new Date());

  // ── Génération PDF ──
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const margin = 20;
  const center = W / 2;

  // ── Fond léger ──
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, 297, "F");

  // ── Bandeau header ──
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, W, 38, "F");

  // Texte header gauche
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DU SÉNÉGAL", margin, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Ministère de l'Éducation Nationale", margin, 16);
  doc.text("Un Peuple – Un But – Une Foi", margin, 22);

  // Texte header droite
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(ecole.nom.toUpperCase(), W - margin, 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  if (ecole.adresse) doc.text(ecole.adresse, W - margin, 16, { align: "right" });
  if (ecole.telephone) doc.text(ecole.telephone, W - margin, 22, { align: "right" });

  // Ligne séparatrice dorée
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(margin, 38, W - margin, 38);

  // ── Titre ──
  doc.setTextColor(15, 52, 96);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CERTIFICAT DE SCOLARITÉ", center, 60, { align: "center" });

  // Filet décoratif sous le titre
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(center - 55, 64, center + 55, 64);

  // ── Corps du texte ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  let y = 85;
  const lineH = 9;

  const dirNom = directeur
    ? `${directeur.prenom} ${directeur.nom}`
    : "Le Directeur";

  // Paragraphe d'ouverture
  doc.setFont("helvetica", "normal");
  doc.text("Je soussigné,", margin, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${dirNom}`, center, y, { align: "center" });
  y += lineH * 0.8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Directeur de l'école ${ecole.nom}`, center, y, { align: "center" });
  y += lineH * 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Certifie que l'élève :", margin, y);
  y += lineH;

  // Nom de l'élève — encadré
  doc.setFillColor(235, 240, 255);
  doc.setDrawColor(15, 52, 96);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y - 5, W - 2 * margin, 12, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 52, 96);
  doc.text(`${eleve.prenom} ${eleve.nom}`, center, y + 3, { align: "center" });
  y += lineH * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  // Filiation
  const parentNom = eleve.nom_parent ?? "...................................";
  doc.text(`Fils / Fille de :`, margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(parentNom, margin + 35, y);
  y += lineH;

  // Date de naissance
  doc.setFont("helvetica", "normal");
  const dn = eleve.date_naissance ? formatDate(eleve.date_naissance) : "..................";
  doc.text(`Né(e) le :`, margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(dn, margin + 20, y);
  y += lineH * 1.5;

  // Corps principal
  doc.setFont("helvetica", "normal");
  const corps = doc.splitTextToSize(
    `Etudie dans notre établissement scolaire et fréquente la classe de :`,
    W - 2 * margin
  );
  doc.text(corps, margin, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 52, 96);
  doc.text(eleve.classe.nom, center, y, { align: "center" });
  y += lineH * 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const conclusion = doc.splitTextToSize(
    "Ce présent certificat est établi pour servir et valoir ce que de droit.",
    W - 2 * margin
  );
  doc.text(conclusion, margin, y);
  y += lineH * 2.5;

  // Date et lieu
  doc.text(`Fait à Dakar, le ${dateAujourd}`, W - margin, y, { align: "right" });
  y += lineH * 2;

  // Signature
  doc.setFont("helvetica", "bold");
  doc.text("Le Directeur", W - margin, y, { align: "right" });
  y += lineH * 0.6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(dirNom, W - margin, y, { align: "right" });

  // Espace signature
  y += lineH * 3.5;
  doc.setDrawColor(15, 52, 96);
  doc.setLineWidth(0.3);
  doc.line(W - margin - 60, y, W - margin, y);

  // ── Filet de bas de page ──
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 283, W, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `${ecole.nom}${ecole.adresse ? " · " + ecole.adresse : ""}${ecole.telephone ? " · " + ecole.telephone : ""}`,
    center, 291, { align: "center" }
  );

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificat-${eleve.nom}-${eleve.prenom}.pdf"`,
    },
  });
}
