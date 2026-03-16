import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface BulletinData {
  ecole: {
    nom: string;
    adresse?: string | null;
    telephone?: string | null;
    annee_scolaire: string;
  };
  eleve: {
    nom: string;
    prenom: string;
    matricule: string;
    date_naissance?: string | null;
    sexe?: string | null;
  };
  classe: {
    nom: string;
    niveau: string;
  };
  sequence: number;
  matieres: {
    nom: string;
    coefficient: number;
    notes: { valeur: number; type: string }[];
    moyenne: number | null;
    appreciation?: string | null;
  }[];
  moyenneGenerale: number | null;
  rang: number;
  totalEleves: number;
  appreciationGenerale?: string | null;
  totalAbsences: number;
  totalHeuresAbsences: number;
}

export function genererBulletinPDF(data: BulletinData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── EN-TÊTE ───
  doc.setFillColor(30, 64, 175); // blue-800
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.ecole.nom.toUpperCase(), pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.ecole.adresse) {
    doc.text(data.ecole.adresse, pageWidth / 2, 21, { align: "center" });
  }
  if (data.ecole.telephone) {
    doc.text(`Tél : ${data.ecole.telephone}`, pageWidth / 2, 26, { align: "center" });
  }
  doc.text(`Année scolaire : ${data.ecole.annee_scolaire}`, pageWidth / 2, 31, {
    align: "center",
  });

  // ─── TITRE ───
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`BULLETIN DE NOTES — SÉQUENCE ${data.sequence}`, pageWidth / 2, 48, {
    align: "center",
  });

  // ─── INFOS ÉLÈVE ───
  const startY = 56;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY - 4, pageWidth - 28, 22, 2, 2, "F");

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");

  const col1 = 18;
  const col2 = pageWidth / 2 + 5;

  doc.text("Nom :", col1, startY + 2);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.eleve.prenom} ${data.eleve.nom}`, col1 + 20, startY + 2);

  doc.setFont("helvetica", "bold");
  doc.text("Matricule :", col2, startY + 2);
  doc.setFont("helvetica", "normal");
  doc.text(data.eleve.matricule, col2 + 28, startY + 2);

  doc.setFont("helvetica", "bold");
  doc.text("Classe :", col1, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(data.classe.nom, col1 + 20, startY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Né(e) le :", col2, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(
    data.eleve.date_naissance
      ? new Date(data.eleve.date_naissance).toLocaleDateString("fr-FR")
      : "—",
    col2 + 28,
    startY + 8
  );

  doc.setFont("helvetica", "bold");
  doc.text("Sexe :", col1, startY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.eleve.sexe === "M" ? "Masculin" : data.eleve.sexe === "F" ? "Féminin" : "—", col1 + 20, startY + 14);

  // ─── TABLEAU DES NOTES ───
  const tableHead = [["Matière", "Coef.", "Notes", "Moy.", "Appréciation"]];
  const tableBody = data.matieres.map((m) => [
    m.nom,
    String(m.coefficient),
    m.notes.length > 0 ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ") : "—",
    m.moyenne !== null ? m.moyenne.toFixed(2) : "—",
    m.appreciation || "",
  ]);

  autoTable(doc, {
    startY: startY + 22,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 45 },
      1: { halign: "center", cellWidth: 15 },
      2: { halign: "center", cellWidth: 40 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "left", cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable?.finalY ?? 180;
  finalY += 6;

  // ─── RÉSUMÉ ───
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, pageWidth - 28, 28, 2, 2, "F");
  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(14, finalY, pageWidth - 28, 28, 2, 2, "S");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);

  doc.text("MOYENNE GÉNÉRALE :", col1, finalY + 7);
  doc.setFontSize(14);
  doc.text(
    data.moyenneGenerale !== null ? `${data.moyenneGenerale.toFixed(2)} / 20` : "—",
    col1 + 58,
    finalY + 7
  );

  doc.setFontSize(10);
  doc.text("RANG :", col2, finalY + 7);
  doc.setFontSize(14);
  doc.text(`${data.rang}${data.rang === 1 ? "er" : "ème"} / ${data.totalEleves}`, col2 + 22, finalY + 7);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Absences : ${data.totalAbsences} (${data.totalHeuresAbsences}h)`, col1, finalY + 15);

  // Appréciation générale
  if (data.appreciationGenerale) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Appréciation générale :", col1, finalY + 22);
    doc.setFont("helvetica", "normal");
    doc.text(data.appreciationGenerale, col1 + 48, finalY + 22);
  }

  // ─── PIED DE PAGE ───
  const footY = finalY + 36;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, footY, pageWidth - 14, footY);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`,
    pageWidth / 2,
    footY + 6,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
