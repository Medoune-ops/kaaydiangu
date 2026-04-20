import { jsPDF } from "jspdf";


export interface RecuData {
  ecole: {
    nom: string;
    logo?: string | null;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    annee_scolaire: string;
  };
  eleve: {
    nom: string;
    prenom: string;
    matricule: string;
    classe: string;
  };
  paiement: {
    recu_numero: string;
    mois: number;
    annee: number;
    montant: number;
    mode: string;
    date_paiement: string;
    enregistre_par: string;
  };
  logoBase64?: string | null;
}

const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement bancaire",
};

function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export async function genererRecuPDF(data: RecuData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pw = doc.internal.pageSize.getWidth(); // 148mm
  const ph = doc.internal.pageSize.getHeight(); // 210mm

  // ─── BORDURE DECORATIVE ───
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, pw - 10, ph - 10);
  doc.setLineWidth(0.3);
  doc.rect(7, 7, pw - 14, ph - 14);

  // ─── EN-TÊTE AVEC LOGO ───
  doc.setFillColor(30, 64, 175);
  doc.rect(7, 7, pw - 14, 32, "F");

  let headerTextX = pw / 2;

  // Logo (si disponible en base64)
  if (data.logoBase64) {
    try {
      doc.addImage(data.logoBase64, "PNG", 12, 10, 20, 20);
      headerTextX = pw / 2 + 8;
    } catch {
      // Logo invalide, on continue sans
    }
  }

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
  headerLines.push(`Année scolaire : ${data.ecole.annee_scolaire}`);

  let hy = 22;
  for (const line of headerLines) {
    doc.text(line, headerTextX, hy, { align: "center" });
    hy += 4;
  }

  // ─── TITRE REÇU ───
  const ty = 47;
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(20, ty - 5, pw - 40, 14, 3, 3, "F");
  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(20, ty - 5, pw - 40, 14, 3, 3, "S");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("RECU DE PAIEMENT", pw / 2, ty + 3, { align: "center" });

  // Numéro de reçu
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.text(`N\u00b0 ${data.paiement.recu_numero}`, pw / 2, ty + 12, { align: "center" });

  // ─── INFORMATIONS ÉLÈVE ───
  const iy = 70;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(12, iy, pw - 24, 30, 2, 2, "FD");

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

  // ─── DÉTAILS DU PAIEMENT ───
  const py = ly + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(12, py, pw - 24, 30, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("DETAILS DU PAIEMENT", 16, py + 6);

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  ly = py + 13;

  row("Mois :", `${MOIS_NOMS[data.paiement.mois]} ${data.paiement.annee}`);
  row("Mode :", MODE_LABELS[data.paiement.mode] || data.paiement.mode);
  row("Date :", new Date(data.paiement.date_paiement).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }));

  // ─── MONTANT (bande verte) ───
  const my = ly + 4;
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(12, my, pw - 24, 16, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MONTANT PAYE", 16, my + 6);

  doc.setFontSize(18);
  doc.text(
    `${formatMontant(data.paiement.montant)} FCFA`,
    pw - 16,
    my + 12,
    { align: "right" }
  );

  // ─── ZONE SIGNATURE / CACHET / QR CODE ───
  const sy = my + 24;

  // Colonne gauche : enregistré par
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Enregistré par :", lx, sy);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(data.paiement.enregistre_par, lx, sy + 5);

  // QR Code pour accès rapide (Position test en haut à droite)
  try {
    const QRCode = require("qrcode");
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const matricule = data.eleve.matricule || "ELEVE";
    const loginUrl = `${baseUrl}/login?m=${matricule}`;
    
    // Position en haut à droite, sous l'en-tête bleu
    const qrx = pw - 35;
    const qry = 42;
    
    const qrDataUrl = await QRCode.toDataURL(loginUrl, { 
      margin: 1, 
      width: 100 
    });
    
    // Utilisation de JPEG pour compatibilité maximale
    doc.addImage(qrDataUrl, "JPEG", qrx, qry, 22, 22);
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Espace Élève", qrx + 11, qry + 25, { align: "center" });
  } catch (e: any) {
    console.error("Erreur génération QR Code:", e);
    // Fallback visuel très visible en haut
    const qrx = pw - 35;
    const qry = 42;
    doc.setDrawColor(255, 0, 0);
    doc.rect(qrx, qry, 22, 22);
    doc.text("QR-ERR", qrx + 2, qry + 5);
  }

  // Colonne droite : cachet + signature
  const sx = pw - 55;
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.roundedRect(sx, sy - 3, 43, 25, 2, 2, "S");
  doc.setLineDashPattern([], 0);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("Cachet et signature", sx + 21.5, sy + 10, { align: "center" });
  doc.text("de l'établissement", sx + 21.5, sy + 14, { align: "center" });

  // ─── PIED DE PAGE ───
  const fy = ph - 18;
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(12, fy, pw - 12, fy);

  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Ce reçu fait foi de paiement. Veuillez le conserver précieusement.",
    pw / 2,
    fy + 4,
    { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`,
    pw / 2,
    fy + 8,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

