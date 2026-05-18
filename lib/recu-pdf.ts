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
type RGB = [number, number, number];
const SLATE900: RGB = [15, 23, 42];
const SLATE600: RGB = [71, 85, 105];
const SLATE400: RGB = [148, 163, 184];
const SLATE200: RGB = [226, 232, 240];
const SLATE50: RGB  = [248, 250, 252];
const WHITE: RGB    = [255, 255, 255];
const GREEN600: RGB = [22, 163, 74];
const GREEN100: RGB = [220, 252, 231];
const GREEN800: RGB = [21, 128, 61];

const ACCENT_INS: RGB  = [180, 83, 9];    // amber-700
const ACCENT_MEN: RGB  = [79, 70, 229];   // indigo-600
const ACCENT2_INS: RGB = [253, 230, 138]; // amber-200
const ACCENT2_MEN: RGB = [199, 210, 254]; // indigo-200
const BG_INS: RGB  = [255, 251, 235];     // amber-50
const BG_MEN: RGB  = [238, 242, 255];     // indigo-50
const HDR_INS: RGB = [120, 53, 15];       // amber-900
const HDR_MEN: RGB = [30, 27, 75];        // indigo-950

function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: jsPDF, c: RGB)  { doc.setTextColor(c[0], c[1], c[2]); }

// Shrink font until text fits within maxW, stopping at minFs
function shrinkToFit(doc: jsPDF, text: string, maxW: number, startFs: number, minFs: number): number {
  let fs = startFs;
  doc.setFontSize(fs);
  while (doc.getTextWidth(text) > maxW && fs > minFs) {
    fs -= 0.3;
    doc.setFontSize(fs);
  }
  return fs;
}

export async function genererRecuPDF(data: RecuData): Promise<Buffer> {
  // ─── A4 setup ─────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();  // 210 mm
  const ph = doc.internal.pageSize.getHeight(); // 297 mm
  const M  = 15; // margin

  const isIns = data.paiement.mois === 0;
  const ACCENT  = isIns ? ACCENT_INS : ACCENT_MEN;
  const ACCENT2 = isIns ? ACCENT2_INS : ACCENT2_MEN;
  const BG      = isIns ? BG_INS  : BG_MEN;
  const HDR     = isIns ? HDR_INS : HDR_MEN;
  const bannerLabel = isIns ? "REÇU D'INSCRIPTION" : "REÇU DE MENSUALITÉ";

  // ─── TOP ACCENT STRIP  (y 0–3) ────────────────────────────────────────────
  setFill(doc, ACCENT);
  doc.rect(0, 0, pw, 3, "F");

  // ─── HEADER (y 3–55, dark bg) ─────────────────────────────────────────────
  setFill(doc, SLATE900);
  doc.rect(0, 3, pw, 52, "F");
  // sub-accent strip at bottom of header
  setFill(doc, HDR);
  doc.rect(0, 51, pw, 4, "F");

  // Logo (32×32 mm)
  let nameX = pw / 2;
  if (data.logoBase64) {
    try {
      doc.addImage(data.logoBase64, "PNG", M, 9, 32, 32);
      nameX = (M + 32 + pw) / 2; // shift text center to the right of the logo
    } catch { /* continue without logo */ }
  }

  // Available width for centered header text
  const rightAvail = pw - M - nameX;
  const leftAvail  = nameX - (data.logoBase64 ? M + 32 : M);
  const hdrTextMaxW = 2 * Math.min(rightAvail, leftAvail);

  // School name
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  const schoolNom = data.ecole.nom.toUpperCase();
  shrinkToFit(doc, schoolNom, hdrTextMaxW, 18, 9);
  doc.text(schoolNom, nameX, 23, { align: "center" });

  // Contact info — each line auto-shrinks
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  let hy = 31;
  if (data.ecole.adresse) {
    shrinkToFit(doc, data.ecole.adresse, hdrTextMaxW, 8, 6);
    doc.text(data.ecole.adresse, nameX, hy, { align: "center" });
    hy += 5.5;
  }
  const contacts: string[] = [];
  if (data.ecole.telephone) contacts.push(data.ecole.telephone);
  if (data.ecole.email)     contacts.push(data.ecole.email);
  if (contacts.length) {
    const ctLine = contacts.join("  ·  ");
    shrinkToFit(doc, ctLine, hdrTextMaxW, 8, 6);
    doc.text(ctLine, nameX, hy, { align: "center" });
    hy += 5.5;
  }

  // Year pill
  setFill(doc, HDR);
  const pillW = 68, pillH = 7;
  doc.roundedRect(nameX - pillW / 2, hy - 1, pillW, pillH, 1.5, 1.5, "F");
  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Année scolaire  ${data.ecole.annee_scolaire}`, nameX, hy + 4, { align: "center" });

  // ─── BANNER (y 57–79) ─────────────────────────────────────────────────────
  const banY = 57;
  setFill(doc, BG);
  doc.rect(0, banY, pw, 22, "F");

  const badgeW = isIns ? 74 : 80;
  setFill(doc, ACCENT);
  doc.roundedRect(pw / 2 - badgeW / 2, banY + 3, badgeW, 11, 2, 2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(bannerLabel, pw / 2, banY + 10.2, { align: "center" });

  const dateStr = new Date(data.paiement.date_paiement).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  setTxt(doc, SLATE600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Date : ${dateStr}`, M, banY + 18);
  doc.setFont("helvetica", "bold");
  doc.text(`N° ${data.paiement.recu_numero}`, pw - M, banY + 18, { align: "right" });

  // ─── TWO-COLUMN INFO (y 85–153, rowH=68) ──────────────────────────────────
  //
  // Layout inside each 68mm-tall box:
  //   ├─ infoY+3   : column header pill top
  //   ├─ infoY+12  : column header pill bottom
  //   ├─ infoY+16  : field 1 label baseline
  //   ├─ infoY+22  : field 1 value line-1 baseline
  //   ├─ infoY+27  : field 1 value line-2 baseline  (if needed)
  //   ├─ infoY+33  : field 2 label baseline
  //   ├─ infoY+39  : field 2 value line-1 baseline
  //   ├─ infoY+44  : field 2 value line-2 baseline  (if needed)
  //   ├─ infoY+50  : field 3 label baseline
  //   ├─ infoY+56  : field 3 value line-1 baseline
  //   └─ infoY+61  : field 3 value line-2 baseline  (colBoxBottom = infoY+64)
  //
  const infoY  = 85;
  const colW   = (pw - M * 2 - 6) / 2; // 87 mm each column
  const c1     = M;
  const c2     = M + colW + 6;
  const rowH   = 68;
  const colBoxBottom = infoY + rowH - 4; // = infoY+64 — hard stop for line-2

  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.25);
  doc.roundedRect(c1, infoY, colW, rowH, 3, 3, "FD");
  doc.roundedRect(c2, infoY, colW, rowH, 3, 3, "FD");

  // Column header pills
  setFill(doc, ACCENT);
  doc.roundedRect(c1 + 3, infoY + 3, colW - 6, 9, 2, 2, "F");
  doc.roundedRect(c2 + 3, infoY + 3, colW - 6, 9, 2, 2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BÉNÉFICIAIRE",       c1 + colW / 2, infoY + 8.8, { align: "center" });
  doc.text("DÉTAILS DU PAIEMENT", c2 + colW / 2, infoY + 8.8, { align: "center" });

  // Field renderer — value never overflows the box
  const field = (x: number, y: number, label: string, value: string) => {
    const safe = String(value ?? "");
    setTxt(doc, SLATE400);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + 4, y);

    setTxt(doc, SLATE900);
    doc.setFont("helvetica", "bold");
    const maxW = colW - 8;
    shrinkToFit(doc, safe, maxW, 10, 7);
    const lines = doc.splitTextToSize(safe, maxW) as string[];
    doc.text(lines[0], x + 4, y + 6);
    if (lines.length > 1 && y + 11 < colBoxBottom) {
      doc.setFontSize(8.5);
      doc.text(lines[1], x + 4, y + 11);
    }
  };

  // Left column — student
  let fy = infoY + 16;
  field(c1, fy, "Nom complet", `${data.eleve.prenom} ${data.eleve.nom}`);
  fy += 17;
  field(c1, fy, "Matricule", data.eleve.matricule);
  fy += 17;
  field(c1, fy, "Classe", data.eleve.classe);

  // Right column — payment details
  fy = infoY + 16;
  field(c2, fy, "Période", `${MOIS_NOMS[data.paiement.mois]} ${data.paiement.annee}`);
  fy += 17;
  field(c2, fy, "Mode de paiement", MODE_LABELS[data.paiement.mode] || data.paiement.mode);
  fy += 17;
  field(c2, fy, "Enregistré par", data.paiement.enregistre_par);

  // ─── AMOUNT BLOCK (y 163–197) ─────────────────────────────────────────────
  const amtY = infoY + rowH + 10; // 163
  setFill(doc, HDR);
  doc.roundedRect(M, amtY, pw - M * 2, 34, 3.5, 3.5, "F");
  setFill(doc, ACCENT);
  doc.roundedRect(M + 0.5, amtY + 0.5, pw - M * 2 - 1, 33, 3.2, 3.2, "F");

  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("MONTANT RÉGLÉ", M + 9, amtY + 13);

  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(`${fmt(data.paiement.montant)} FCFA`, pw - M - 9, amtY + 26, { align: "right" });

  // ─── BOTTOM ZONE (y 211–269) ──────────────────────────────────────────────
  //
  //  Stamp circle : center (43, 241)  r=23  → top 218 / bottom 264
  //  QR box       : top-left (81, 215)  size (50, 54) → bottom 269
  //  Signature    : top-left (137, 219) size (58, 44)  → bottom 263
  //  Footer start : y 279   → all elements clear footer ✓
  //
  const botY = amtY + 34 + 14; // 211

  // PAYÉ stamp
  const stX = M + 28; // 43
  const stY = botY + 30; // 241
  setFill(doc, GREEN100);
  setDraw(doc, GREEN600);
  doc.setLineWidth(2.5);
  doc.circle(stX, stY, 23, "FD");
  doc.setLineWidth(1);
  doc.circle(stX, stY, 19.5, "S");
  setTxt(doc, GREEN800);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("PAYÉ", stX, stY + 1.5, { align: "center" });
  setTxt(doc, GREEN600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("✓ VALIDÉ", stX, stY + 9, { align: "center" });

  // QR code
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const qrUrl     = `${baseUrl}/eleve/${data.paiement.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 180 });

    const qrS = 42;
    const qrX = pw / 2 - qrS / 2; // 84
    const qrY = botY + 8;          // 219

    setFill(doc, WHITE);
    setDraw(doc, SLATE200);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 4, qrY - 4, qrS + 8, qrS + 13, 2.5, 2.5, "FD"); // bottom 219-4+42+13=270<279 ✓
    doc.addImage(qrDataUrl, "JPEG", qrX, qrY, qrS, qrS);

    setTxt(doc, SLATE400);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("Espace Élève", pw / 2, qrY + qrS + 7, { align: "center" }); // 268<279 ✓
  } catch (e) {
    console.error("Erreur QR:", e);
  }

  // Signature block
  const sigX = pw - M - 58; // 137
  const sigY = botY + 8;    // 219
  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.roundedRect(sigX, sigY, 58, 44, 3, 3, "FD"); // bottom 263<279 ✓
  doc.setLineDashPattern([], 0);
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Cachet et signature",  sigX + 29, sigY + 25, { align: "center" });
  doc.text("de l'établissement",   sigX + 29, sigY + 33, { align: "center" });

  // ─── FOOTER (y 279–297) ───────────────────────────────────────────────────
  const footY = ph - 18; // 279
  setFill(doc, SLATE50);
  doc.rect(0, footY - 2, pw, 20, "F");
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.line(M, footY - 2, pw - M, footY - 2);

  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text(
    "Ce reçu fait foi de paiement. Veuillez le conserver précieusement.",
    pw / 2, footY + 4, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  const footLine2 = `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`;
  shrinkToFit(doc, footLine2, pw - M * 2, 7.5, 6);
  doc.text(footLine2, pw / 2, footY + 10.5, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}
