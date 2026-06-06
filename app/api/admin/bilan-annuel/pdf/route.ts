import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const C_BLUE   = [30, 64, 175]   as [number, number, number];
const C_GREEN  = [22, 163, 74]   as [number, number, number];
const C_RED    = [220, 38, 38]   as [number, number, number];
const C_ORANGE = [234, 88, 12]   as [number, number, number];
const C_PURPLE = [124, 58, 237]  as [number, number, number];
const C_GRAY   = [100, 116, 139] as [number, number, number];
const C_WHITE  = [255, 255, 255] as [number, number, number];
const C_BG     = [248, 250, 252] as [number, number, number];

function getMention(avg: number): string {
  if (avg >= 18) return "Très Bien";
  if (avg >= 16) return "Bien";
  if (avg >= 14) return "Assez Bien";
  if (avg >= 12) return "Passable";
  if (avg >= 10) return "Insuff.";
  return "Faible";
}

function getDecision(avg: number): string {
  return avg >= 10 ? "Admis(e)" : "Redoublant(e)";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function kpiCard(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string,
  accent: [number, number, number]
) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_GRAY);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  doc.setFillColor(...accent);
  doc.roundedRect(x, y, 3, h, 1, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C_GRAY);
  doc.text(label.toUpperCase(), x + 6, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accent);
  doc.text(doc.splitTextToSize(value, w - 8)[0] as string, x + 6, y + 14);
}

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
            notes: true,
            absences: true,
            paiements: { where: { statut: "PAYE" } },
          },
          orderBy: [{ nom: "asc" }, { prenom: "asc" }],
        },
        ecole: {
          select: { nom: true, adresse: true, telephone: true, annee_scolaire: true },
        },
      },
    });

    if (!classe) {
      return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
    }

    const ecole = classe.ecole;

    // ─── Calcul des bilans élèves ───
    const studentBilans = classe.eleves.map((eleve) => {
      const subjectAvgs = new Map<string, number | null>();
      for (const matiere of classe.matieres) {
        const notes = eleve.notes.filter((n) => n.matiere_id === matiere.id);
        subjectAvgs.set(
          matiere.id,
          notes.length > 0 ? round2(notes.reduce((s, n) => s + n.valeur, 0) / notes.length) : null
        );
      }

      let sumW = 0, sumC = 0;
      for (const matiere of classe.matieres) {
        const avg = subjectAvgs.get(matiere.id);
        if (avg !== null && avg !== undefined) {
          sumW += avg * matiere.coefficient;
          sumC += matiere.coefficient;
        }
      }
      const moyGén = sumC > 0 ? round2(sumW / sumC) : null;
      const totalAbs = round2(eleve.absences.reduce((s, a) => s + a.duree_heures, 0));
      const totalPayé = eleve.paiements.reduce((s, p) => s + p.montant, 0);

      return {
        id: eleve.id,
        matricule: eleve.matricule,
        nom: eleve.nom,
        prenom: eleve.prenom,
        moyGén,
        totalAbs,
        totalPayé,
        mention: moyGén !== null ? getMention(moyGén) : "—",
        decision: moyGén !== null ? getDecision(moyGén) : "—",
      };
    });

    // Tri par moyenne décroissante + rang
    const sorted = [...studentBilans].sort((a, b) => {
      if (a.moyGén === null) return 1;
      if (b.moyGén === null) return -1;
      return b.moyGén - a.moyGén;
    });
    const rankMap = new Map<string, number>();
    sorted.forEach((s, i) => rankMap.set(s.id, i + 1));

    // Stats de classe
    const withGrade = studentBilans.filter((s) => s.moyGén !== null);
    const admitted  = withGrade.filter((s) => s.moyGén! >= 10);
    const classAvg  = withGrade.length > 0
      ? round2(withGrade.reduce((s, b) => s + b.moyGén!, 0) / withGrade.length)
      : null;
    const successRate = withGrade.length > 0
      ? Math.round((admitted.length / withGrade.length) * 100)
      : 0;

    // ─── Génération PDF ───
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const MARGIN = 14;

    // En-tête
    doc.setFillColor(...C_BLUE);
    doc.rect(0, 0, pw, 38, "F");
    doc.setFillColor(37, 99, 235);
    doc.triangle(pw - 40, 0, pw, 0, pw, 40, "F");

    doc.setTextColor(...C_WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text((ecole.nom || "ÉTABLISSEMENT").toUpperCase(), MARGIN, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    if (ecole.adresse) doc.text(ecole.adresse, MARGIN, 20);
    const infos = [
      ecole.telephone ? `Tél : ${ecole.telephone}` : "",
      ecole.annee_scolaire ? `Année scolaire : ${ecole.annee_scolaire}` : "",
    ].filter(Boolean).join("   |   ");
    if (infos) doc.text(infos, MARGIN, 26);

    doc.setFillColor(59, 130, 246);
    doc.roundedRect(MARGIN, 31, 58, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_WHITE);
    doc.text("BILAN ANNUEL DE CLASSE", MARGIN + 2, 35.2);

    // Titre
    let cy = 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C_BLUE);
    doc.text(`CLASSE : ${classe.nom.toUpperCase()}`, pw / 2, cy, { align: "center" });

    cy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_GRAY);
    const sousTitre = [
      `Niveau : ${classe.niveau}`,
      classe.filiere ? `Filière : ${classe.filiere}` : null,
      ecole.annee_scolaire ? `Année scolaire : ${ecole.annee_scolaire}` : null,
    ].filter(Boolean).join("   —   ");
    // Truncate to one line so it never overflows
    const sousTitreLines = doc.splitTextToSize(sousTitre, pw - MARGIN * 2 - 10) as string[];
    doc.text(sousTitreLines[0], pw / 2, cy, { align: "center" });

    cy += 4;
    doc.setDrawColor(...C_BLUE);
    doc.setLineWidth(0.8);
    doc.line(pw / 2 - 45, cy, pw / 2 + 45, cy);
    cy += 10;

    // KPI cards
    const cardW = (pw - MARGIN * 2 - 9) / 4;
    const cardH = 22;
    kpiCard(doc, MARGIN,                   cy, cardW, cardH, "Effectif", `${studentBilans.length} élève(s)`, C_BLUE);
    kpiCard(doc, MARGIN + cardW + 3,       cy, cardW, cardH, "Admis(es)", `${admitted.length} / ${withGrade.length}`, C_GREEN);
    kpiCard(doc, MARGIN + (cardW + 3) * 2, cy, cardW, cardH, "Taux de réussite", `${successRate} %`, successRate >= 50 ? C_GREEN : C_RED);
    kpiCard(doc, MARGIN + (cardW + 3) * 3, cy, cardW, cardH, "Moyenne de classe", classAvg !== null ? `${classAvg}/20` : "—", C_PURPLE);
    cy += cardH + 10;

    // Titre section
    doc.setFillColor(...C_BG);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(MARGIN, cy - 1, pw - MARGIN * 2, 7, 1, 1, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C_BLUE);
    doc.text("Tableau de classement annuel", MARGIN + 3, cy + 4);
    cy += 10;

    // Tableau classement
    const tableBody = sorted.map((s) => [
      String(rankMap.get(s.id) ?? "—"),
      s.matricule,
      `${s.prenom} ${s.nom}`,
      s.moyGén !== null ? `${s.moyGén}/20` : "—",
      s.mention,
      `${s.totalAbs}h`,
      s.totalPayé > 0 ? `${s.totalPayé.toLocaleString("fr-FR")} FCFA` : "0 FCFA",
      s.decision,
    ]);

    autoTable(doc, {
      startY: cy,
      head: [["Rang", "Matricule", "Nom & Prénom", "Moy. Gén.", "Mention", "Absences", "Scolarité payée", "Décision"]],
      body: tableBody,
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
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 40, halign: "left" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: 14, halign: "center" },
        6: { cellWidth: 32, halign: "right" },
        7: { cellWidth: 24, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const s = sorted[data.row.index];
        if (!s) return;
        if (data.column.index === 7) {
          data.cell.styles.textColor = s.decision.includes("Admis") ? C_GREEN : C_RED;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 3 || data.column.index === 4) {
          const avg = s.moyGén ?? 0;
          data.cell.styles.textColor = avg >= 14 ? C_GREEN : avg >= 10 ? C_ORANGE : C_RED;
          if (data.column.index === 3) data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 0) {
          const rank = rankMap.get(s.id) ?? 99;
          if (rank <= 3) {
            data.cell.styles.fontStyle = "bold";
            const gold = [180, 130, 20] as [number, number, number];
            const silver = [100, 100, 120] as [number, number, number];
            const bronze = [160, 90, 40] as [number, number, number];
            data.cell.styles.textColor = rank === 1 ? gold : rank === 2 ? silver : bronze;
          }
        }
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    cy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? cy + 120;
    cy += 15;

    // Zone de signatures
    if (cy < doc.internal.pageSize.getHeight() - 52) {
      const sigW = (pw - MARGIN * 2 - 20) / 3;
      const sigLabels = ["Le Censeur", "Le Directeur", "Cachet de l'École"];
      for (let i = 0; i < 3; i++) {
        const sigX = MARGIN + i * (sigW + 10);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(sigX, cy, sigW, 32, "D");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_GRAY);
        doc.text(sigLabels[i], sigX + sigW / 2, cy + 7, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.text("Signature & Cachet :", sigX + 3, cy + 28);
      }
    }

    addFooter(doc, ecole.nom || "");

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const safeName = classe.nom.replace(/\s+/g, "_").toLowerCase();
    const safeAnnee = (ecole.annee_scolaire || "annee").replace(/\//g, "-");
    const filename = `bilan_annuel_${safeName}_${safeAnnee}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[BILAN_ANNUEL_PDF] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
