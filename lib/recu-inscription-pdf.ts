import { jsPDF } from "jspdf";

export interface RecuInscriptionData {
  ecole: {
    nom: string;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    annee_scolaire: string;
    logo?: string | null;
  };
  eleve: {
    nom: string;
    prenom: string;
    matricule: string;
    classe: string;
    date_inscription: string;
  };
  credentials: {
    email: string;
    mot_de_passe: string;
  };
  montant_inscription: number;
}

export function genererRecuInscriptionPDF(data: RecuInscriptionData): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pw = doc.internal.pageSize.getWidth();  // 148mm
  const ph = doc.internal.pageSize.getHeight(); // 210mm

  // ─── BORDURE DECORATIVE ───
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, pw - 10, ph - 10);
  doc.setLineWidth(0.3);
  doc.rect(7, 7, pw - 14, ph - 14);

  // ─── EN-TETE ───
  doc.setFillColor(30, 64, 175);
  doc.rect(7, 7, pw - 14, 32, "F");

  const headerTextX = pw / 2;

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.ecole.nom.toUpperCase(), headerTextX, 17, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const headerLines: string[] = [];
  if (data.ecole.adresse) headerLines.push(data.ecole.adresse);
  const contacts: string[] = [];
  if (data.ecole.telephone) contacts.push(`Tel: ${data.ecole.telephone}`);
  if (data.ecole.email) contacts.push(data.ecole.email);
  if (contacts.length) headerLines.push(contacts.join(" | "));
  headerLines.push(`Annee scolaire : ${data.ecole.annee_scolaire}`);

  let hy = 22;
  for (const line of headerLines) {
    doc.text(line, headerTextX, hy, { align: "center" });
    hy += 4;
  }

  // ─── TITRE ───
  const ty = 47;
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(20, ty - 5, pw - 40, 14, 3, 3, "F");
  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(20, ty - 5, pw - 40, 14, 3, 3, "S");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("RECU D'INSCRIPTION", pw / 2, ty + 3, { align: "center" });

  // Date d'inscription
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const dateInscr = new Date(data.eleve.date_inscription).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Date : ${dateInscr}`, pw / 2, ty + 12, { align: "center" });

  // ─── INFORMATIONS ELEVE ───
  const iy = 70;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(12, iy, pw - 24, 36, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("INFORMATIONS DE L'ELEVE", 16, iy + 6);

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  const lx = 16;
  const vx = 50;
  let ly = iy + 13;

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, lx, ly);
    doc.setFont("helvetica", "normal");
    doc.text(value, vx, ly);
    ly += 6;
  };

  row("Nom :", `${data.eleve.prenom} ${data.eleve.nom}`);
  row("Matricule :", data.eleve.matricule);
  row("Classe :", data.eleve.classe);
  row("Frais d'inscription :", `${data.montant_inscription.toLocaleString("fr-FR")} FCFA`);

  // ─── IDENTIFIANTS DE CONNEXION (bande indigo) ───
  const cy = ly + 6;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, cy, pw - 24, 38, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("IDENTIFIANTS DE CONNEXION", 16, cy + 6);

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  ly = cy + 14;

  row("Matricule :", data.credentials.mot_de_passe.replace("MP-", ""));

  doc.setFont("helvetica", "bold");
  doc.text("Email :", lx, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.credentials.email, vx, ly);
  doc.setFontSize(9);
  ly += 6;

  // Mot de passe en rouge gras pour attirer l'attention
  doc.setFont("helvetica", "bold");
  doc.text("Mot de passe :", lx, ly);
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(11);
  doc.text(data.credentials.mot_de_passe, vx, ly);
  ly += 6;

  // ─── AVERTISSEMENT MOT DE PASSE ───
  const wy = ly + 4;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, wy, pw - 24, 16, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT", 16, wy + 5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Ce mot de passe est provisoire. Veuillez le changer lors de",
    16,
    wy + 10
  );
  doc.text(
    "votre premiere connexion. Conservez ce document en lieu sur.",
    16,
    wy + 14
  );

  // ─── ZONE SIGNATURE / CACHET ───
  const sy = wy + 24;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("L'administration", lx, sy);

  // Cadre cachet
  const sx = pw - 55;
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.roundedRect(sx, sy - 3, 43, 25, 2, 2, "S");
  doc.setLineDashPattern([], 0);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("Cachet et signature", sx + 21.5, sy + 10, { align: "center" });
  doc.text("de l'etablissement", sx + 21.5, sy + 14, { align: "center" });

  // ─── PIED DE PAGE ───
  const fy = ph - 18;
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(12, fy, pw - 12, fy);

  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Ce recu fait foi d'inscription. Veuillez le conserver precieusement.",
    pw / 2,
    fy + 4,
    { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document genere le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`,
    pw / 2,
    fy + 8,
    { align: "center" }
  );

  return doc.output("arraybuffer");
}
