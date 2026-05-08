import { jsPDF } from "jspdf";
import QRCode from "qrcode";

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
    id: string;
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

function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ─── Palette ───────────────────────────────────────────────────────────────
// Inscription  → amber-700 / amber-50
// Mensualité   → indigo-600 / indigo-50
type RGB = [number, number, number];
const SLATE900: RGB  = [15, 23, 42];
const SLATE600: RGB  = [71, 85, 105];
const SLATE400: RGB  = [148, 163, 184];
const SLATE200: RGB  = [226, 232, 240];
const SLATE50: RGB   = [248, 250, 252];
const WHITE: RGB     = [255, 255, 255];
const GREEN600: RGB  = [22, 163, 74];
const GREEN100: RGB  = [220, 252, 231];
const GREEN800: RGB  = [21, 128, 61];

const ACCENT_INS: RGB  = [180, 83, 9];   // amber-700
const ACCENT_MEN: RGB  = [79, 70, 229];  // indigo-600
const ACCENT2_INS: RGB = [253, 230, 138]; // amber-200
const ACCENT2_MEN: RGB = [199, 210, 254]; // indigo-200
const BG_INS: RGB = [255, 251, 235];      // amber-50
const BG_MEN: RGB = [238, 242, 255];      // indigo-50
const HDR_INS: RGB = [120, 53, 15];       // amber-900
const HDR_MEN: RGB = [30, 27, 75];        // indigo-950

function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: jsPDF, c: RGB)  { doc.setTextColor(c[0], c[1], c[2]); }

export async function genererRecuPDF(data: RecuData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pw = doc.internal.pageSize.getWidth();   // 148 mm
  const ph = doc.internal.pageSize.getHeight();  // 210 mm
  const M = 10; // margin

  const isIns   = data.paiement.mois === 0;
  const ACCENT  = isIns ? ACCENT_INS : ACCENT_MEN;
  const ACCENT2 = isIns ? ACCENT2_INS : ACCENT2_MEN;
  const BG      = isIns ? BG_INS : BG_MEN;
  const HDR     = isIns ? HDR_INS : HDR_MEN;
  const bannerLabel = isIns ? "REÇU D'INSCRIPTION" : "REÇU DE MENSUALITÉ";

  // ─── ACCENT TOP BAR ────────────────────────────────────────────────────────
  setFill(doc, ACCENT);
  doc.rect(0, 0, pw, 2.5, "F");

  // ─── HEADER (dark background) ──────────────────────────────────────────────
  setFill(doc, SLATE900);
  doc.rect(0, 2.5, pw, 40, "F");

  // Subtle secondary color stripe at bottom of header
  setFill(doc, HDR);
  doc.rect(0, 38, pw, 4.5, "F");

  // Logo
  let nameX = pw / 2;
  if (data.logoBase64) {
    try {
      doc.addImage(data.logoBase64, "PNG", M, 7, 22, 22);
      nameX = (M + 22 + pw) / 2;
    } catch { /* continue without logo */ }
  }

  // School name — auto-shrink if too wide
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  const schoolNom = data.ecole.nom.toUpperCase();
  const schoolMaxW = pw - nameX - M + (pw / 2 - nameX); // effective centered width
  let schoolFs = 14;
  doc.setFontSize(schoolFs);
  while (doc.getTextWidth(schoolNom) > schoolMaxW && schoolFs > 8) {
    schoolFs -= 0.5;
    doc.setFontSize(schoolFs);
  }
  doc.text(schoolNom, nameX, 16, { align: "center" });

  // Contact info
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let hy = 23;
  if (data.ecole.adresse) {
    doc.text(data.ecole.adresse, nameX, hy, { align: "center" });
    hy += 4;
  }
  const contacts: string[] = [];
  if (data.ecole.telephone) contacts.push(data.ecole.telephone);
  if (data.ecole.email)     contacts.push(data.ecole.email);
  if (contacts.length) {
    doc.text(contacts.join("  ·  "), nameX, hy, { align: "center" });
    hy += 4;
  }

  // Année scolaire pill
  setFill(doc, HDR);
  const pillW = 52, pillH = 5.5;
  doc.roundedRect(nameX - pillW / 2, hy - 1, pillW, pillH, 1.2, 1.2, "F");
  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(`Année scolaire  ${data.ecole.annee_scolaire}`, nameX, hy + 2.8, { align: "center" });

  // ─── RECEIPT TYPE BANNER ───────────────────────────────────────────────────
  const banY = 45;
  setFill(doc, BG);
  doc.rect(0, banY, pw, 18, "F");

  // Badge pill
  const badgeW = isIns ? 56 : 58;
  setFill(doc, ACCENT);
  doc.roundedRect(pw / 2 - badgeW / 2, banY + 2.5, badgeW, 8, 1.5, 1.5, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(bannerLabel, pw / 2, banY + 7.8, { align: "center" });

  // Date (left) + N° (right)
  const dateStr = new Date(data.paiement.date_paiement).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  setTxt(doc, SLATE600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Date : ${dateStr}`, M, banY + 14.5);
  doc.setFont("helvetica", "bold");
  doc.text(`N° ${data.paiement.recu_numero}`, pw - M, banY + 14.5, { align: "right" });

  // ─── TWO-COLUMN INFO ───────────────────────────────────────────────────────
  const infoY = 66;
  const colW  = (pw - M * 2 - 3) / 2;  // ~62.5 mm each
  const c1    = M;
  const c2    = M + colW + 3;
  const rowH  = 38;

  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.2);
  doc.roundedRect(c1, infoY, colW, rowH, 2, 2, "FD");
  doc.roundedRect(c2, infoY, colW, rowH, 2, 2, "FD");

  // Column headers
  setFill(doc, ACCENT);
  doc.roundedRect(c1 + 2, infoY + 2, colW - 4, 6, 1.2, 1.2, "F");
  doc.roundedRect(c2 + 2, infoY + 2, colW - 4, 6, 1.2, 1.2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("BÉNÉFICIAIRE", c1 + colW / 2, infoY + 5.8, { align: "center" });
  doc.text("DÉTAILS", c2 + colW / 2, infoY + 5.8, { align: "center" });

  // Field helper — auto-shrinks font to prevent overflow
  const field = (x: number, y: number, label: string, value: string) => {
    setTxt(doc, SLATE400);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(label.toUpperCase(), x + 3, y);
    setTxt(doc, SLATE900);
    doc.setFont("helvetica", "bold");
    const maxW = colW - 6;
    let fs = 8.2;
    doc.setFontSize(fs);
    while (doc.getTextWidth(value) > maxW && fs > 6) {
      fs -= 0.3;
      doc.setFontSize(fs);
    }
    const lines = doc.splitTextToSize(value, maxW);
    doc.text(lines[0] as string, x + 3, y + 4.5);
  };

  // Left: student
  let fy = infoY + 12;
  field(c1, fy, "Nom complet", `${data.eleve.prenom} ${data.eleve.nom}`);
  fy += 11;
  field(c1, fy, "Matricule", data.eleve.matricule);
  fy += 11;
  field(c1, fy, "Classe", data.eleve.classe);

  // Right: payment
  fy = infoY + 12;
  field(c2, fy, "Période", `${MOIS_NOMS[data.paiement.mois]} ${data.paiement.annee}`);
  fy += 11;
  field(c2, fy, "Mode de paiement", MODE_LABELS[data.paiement.mode] || data.paiement.mode);
  fy += 11;
  field(c2, fy, "Enregistré par", data.paiement.enregistre_par);

  // ─── AMOUNT BLOCK ──────────────────────────────────────────────────────────
  const amtY = infoY + rowH + 4;
  setFill(doc, ACCENT);
  doc.roundedRect(M, amtY, pw - M * 2, 20, 2.5, 2.5, "F");

  // Inner lighter rect for depth
  setFill(doc, HDR);
  doc.roundedRect(M, amtY, pw - M * 2, 20, 2.5, 2.5, "F");
  setFill(doc, ACCENT);
  doc.roundedRect(M + 0.4, amtY + 0.4, pw - M * 2 - 0.8, 19.2, 2.2, 2.2, "F");

  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("MONTANT RÉGLÉ", M + 5, amtY + 7);

  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text(`${fmt(data.paiement.montant)} FCFA`, pw - M - 4, amtY + 15.5, { align: "right" });

  // ─── BOTTOM ZONE ───────────────────────────────────────────────────────────
  const botY = amtY + 26;

  // Left: PAYÉ circular stamp
  const stX = M + 16;
  const stY = botY + 18;
  setFill(doc, GREEN100);
  setDraw(doc, GREEN600);
  doc.setLineWidth(1.5);
  doc.circle(stX, stY, 15, "FD");
  // Inner circle
  doc.setLineWidth(0.5);
  doc.circle(stX, stY, 12.5, "S");
  setTxt(doc, GREEN800);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAYÉ", stX, stY + 1, { align: "center" });
  setTxt(doc, GREEN600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("✓ VALIDÉ", stX, stY + 6, { align: "center" });

  // Center: QR code
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const qrUrl = `${baseUrl}/eleve/${data.paiement.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 120 });

    const qrS = 26;
    const qrX = pw / 2 - qrS / 2;
    const qrY = botY + 4;

    setFill(doc, WHITE);
    setDraw(doc, SLATE200);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 2.5, qrY - 2.5, qrS + 5, qrS + 9, 1.5, 1.5, "FD");
    doc.addImage(qrDataUrl, "JPEG", qrX, qrY, qrS, qrS);

    setTxt(doc, SLATE400);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(5.5);
    doc.text("Espace Élève", pw / 2, qrY + qrS + 4.5, { align: "center" });
  } catch (e) {
    console.error("Erreur QR:", e);
  }

  // Right: signature block
  const sigX = pw - M - 42;
  const sigY = botY + 4;
  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.roundedRect(sigX, sigY, 42, 30, 2, 2, "FD");
  doc.setLineDashPattern([], 0);
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.text("Cachet et signature", sigX + 21, sigY + 18, { align: "center" });
  doc.text("de l'établissement", sigX + 21, sigY + 23, { align: "center" });

  // ─── FOOTER ────────────────────────────────────────────────────────────────
  const footY = ph - 14;
  setFill(doc, SLATE50);
  doc.rect(0, footY - 1, pw, 15, "F");
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.line(M, footY - 1, pw - M, footY - 1);

  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.text(
    "Ce reçu fait foi de paiement. Veuillez le conserver précieusement.",
    pw / 2, footY + 3, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`,
    pw / 2, footY + 7.5, { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
