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
  logoBase64?: string | null;
}

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
const RED: RGB      = [220, 38, 38];

// Thème inscription — amber
const ACCENT: RGB  = [180, 83, 9];    // amber-700
const ACCENT2: RGB = [253, 230, 138]; // amber-200
const BG: RGB      = [255, 251, 235]; // amber-50
const HDR: RGB     = [120, 53, 15];   // amber-900

// Thème identifiants — indigo
const CRED_BG: RGB     = [238, 242, 255]; // indigo-50
const CRED_HDR: RGB    = [30, 27, 75];    // indigo-950
const CRED_ACCENT: RGB = [79, 70, 229];   // indigo-600
const CRED_ACC2: RGB   = [199, 210, 254]; // indigo-200

// Thème avertissement — amber clair
const WARN_BG: RGB  = [254, 243, 199]; // amber-100
const WARN_BDR: RGB = [217, 119, 6];   // amber-600
const WARN_TXT: RGB = [120, 53, 15];   // amber-900

function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: jsPDF, c: RGB)  { doc.setTextColor(c[0], c[1], c[2]); }

function shrinkToFit(doc: jsPDF, text: string, maxW: number, startFs: number, minFs: number): number {
  let fs = startFs;
  doc.setFontSize(fs);
  while (doc.getTextWidth(text) > maxW && fs > minFs) {
    fs -= 0.3;
    doc.setFontSize(fs);
  }
  return fs;
}

export function genererRecuInscriptionPDF(data: RecuInscriptionData): ArrayBuffer {
  // ─── A4 setup ─────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();  // 210 mm
  const ph = doc.internal.pageSize.getHeight(); // 297 mm
  const M  = 15;

  // ─── TOP ACCENT STRIP (y 0–3) ─────────────────────────────────────────────
  setFill(doc, ACCENT);
  doc.rect(0, 0, pw, 3, "F");

  // ─── HEADER (y 3–55, dark bg) ─────────────────────────────────────────────
  setFill(doc, SLATE900);
  doc.rect(0, 3, pw, 52, "F");
  setFill(doc, HDR);
  doc.rect(0, 51, pw, 4, "F");

  // Logo (32×32 mm)
  let nameX = pw / 2;
  if (data.logoBase64) {
    try {
      doc.addImage(data.logoBase64, "PNG", M, 9, 32, 32);
      nameX = (M + 32 + pw) / 2;
    } catch { /* continue without logo */ }
  }

  const rightAvail  = pw - M - nameX;
  const leftAvail   = nameX - (data.logoBase64 ? M + 32 : M);
  const hdrTextMaxW = 2 * Math.min(rightAvail, leftAvail);

  // School name
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  const schoolNom = data.ecole.nom.toUpperCase();
  shrinkToFit(doc, schoolNom, hdrTextMaxW, 18, 9);
  doc.text(schoolNom, nameX, 23, { align: "center" });

  // Contact info
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

  setFill(doc, ACCENT);
  doc.roundedRect(pw / 2 - 37, banY + 3, 74, 11, 2, 2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REÇU D'INSCRIPTION", pw / 2, banY + 10.2, { align: "center" });

  const dateStr = new Date(data.eleve.date_inscription).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  setTxt(doc, SLATE600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Date d'inscription : ${dateStr}`, M, banY + 18);

  // ─── TWO-COLUMN INFO (y 85–140, rowH=55) ──────────────────────────────────
  //
  // Layout inside each 55mm-tall box (fieldStep=13mm):
  //   ├─ infoY+3   : column header pill top
  //   ├─ infoY+12  : column header pill bottom
  //   ├─ infoY+16  : field 1 label  | value at +6 → bottom ~+9.5mm
  //   ├─ infoY+29  : field 2 label  | value at +6 → bottom ~+9.5mm
  //   ├─ infoY+42  : field 3 label  | value at +6 → bottom ~+9.5mm
  //   (line-2 suppressed — step 13mm too tight: visual bottom y+14.5 > next label y+13)
  //
  const infoY  = 85;
  const colW   = (pw - M * 2 - 6) / 2; // 87 mm each column
  const c1     = M;
  const c2     = M + colW + 6;
  const rowH   = 55;

  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.25);
  doc.roundedRect(c1, infoY, colW, rowH, 3, 3, "FD");
  doc.roundedRect(c2, infoY, colW, rowH, 3, 3, "FD");

  setFill(doc, ACCENT);
  doc.roundedRect(c1 + 3, infoY + 3, colW - 6, 9, 2, 2, "F");
  doc.roundedRect(c2 + 3, infoY + 3, colW - 6, 9, 2, 2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BÉNÉFICIAIRE", c1 + colW / 2, infoY + 8.8, { align: "center" });
  doc.text("INSCRIPTION",  c2 + colW / 2, infoY + 8.8, { align: "center" });

  // line-2 intentionally suppressed: 13mm field step leaves only 2mm between
  // the value text bottom (~y+9.5) and the next label (y+13) — not enough for a second line
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
  };

  // Left — student
  let fy = infoY + 16;
  field(c1, fy, "Nom complet", `${data.eleve.prenom} ${data.eleve.nom}`);
  fy += 13;
  field(c1, fy, "Matricule", data.eleve.matricule);
  fy += 13;
  field(c1, fy, "Classe", data.eleve.classe);

  // Right — inscription details
  fy = infoY + 16;
  field(c2, fy, "Année scolaire", data.ecole.annee_scolaire);
  fy += 13;
  field(c2, fy, "Type de frais", "Inscription");
  fy += 13;
  field(c2, fy, "Mode de paiement", "Espèces");

  // ─── AMOUNT BLOCK (y 148–176) ─────────────────────────────────────────────
  const amtY = infoY + rowH + 8; // 148
  setFill(doc, HDR);
  doc.roundedRect(M, amtY, pw - M * 2, 28, 3.5, 3.5, "F");
  setFill(doc, ACCENT);
  doc.roundedRect(M + 0.5, amtY + 0.5, pw - M * 2 - 1, 27, 3.2, 3.2, "F");

  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("FRAIS D'INSCRIPTION RÉGLÉS", M + 9, amtY + 11);

  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`${fmt(data.montant_inscription)} FCFA`, pw - M - 9, amtY + 22, { align: "right" });

  // ─── CREDENTIALS BLOCK (y 183–245) ────────────────────────────────────────
  //
  //  credY+0  : rounded box start
  //  credY+9  : dark header end
  //  credY+14 : email label
  //  credY+22 : email value
  //  credY+30 : password label
  //  credY+39 : password value
  //  credY+47 : warning box top   (height 18mm)
  //  credY+65 : warning box bottom / credentials box end
  //
  const credY = amtY + 28 + 7; // 183
  setFill(doc, CRED_BG);
  setDraw(doc, CRED_ACCENT);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, credY, pw - M * 2, 62, 3, 3, "FD");

  // Credentials header bar
  setFill(doc, CRED_HDR);
  doc.roundedRect(M, credY, pw - M * 2, 10, 3, 3, "F");
  doc.rect(M, credY + 5, pw - M * 2, 5, "F"); // square bottom corners
  setTxt(doc, CRED_ACC2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(
    "IDENTIFIANTS DE CONNEXION — ESPACE ÉLÈVE",
    pw / 2, credY + 7, { align: "center" }
  );

  const credLX  = M + 6;
  const credVX  = M + 40;
  const credMaxW = pw - M - 6 - credVX; // ~149mm

  // Email
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("EMAIL :", credLX, credY + 18);
  setTxt(doc, SLATE900);
  doc.setFont("helvetica", "bold");
  shrinkToFit(doc, data.credentials.email, credMaxW, 9.5, 6);
  doc.text(data.credentials.email, credVX, credY + 18);

  // Password
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("MOT DE PASSE :", credLX, credY + 30);
  setTxt(doc, RED);
  doc.setFont("helvetica", "bold");
  shrinkToFit(doc, data.credentials.mot_de_passe, credMaxW, 12, 7);
  doc.text(data.credentials.mot_de_passe, credVX, credY + 30);

  // Warning box
  const warnY = credY + 40;
  setFill(doc, WARN_BG);
  setDraw(doc, WARN_BDR);
  doc.setLineWidth(0.4);
  doc.roundedRect(M + 4, warnY, pw - M * 2 - 8, 20, 2, 2, "FD");
  setTxt(doc, WARN_TXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    "⚠  MOT DE PASSE PROVISOIRE — À changer à la première connexion.",
    pw / 2, warnY + 8, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    "Conservez ce document en lieu sûr et ne le partagez pas.",
    pw / 2, warnY + 15, { align: "center" }
  );

  // ─── BOTTOM ZONE (y 252–277) ──────────────────────────────────────────────
  //
  //  Stamp  : center (33, 266)  r=11  → top 255 / bottom 277 < footY=279 ✓
  //  Signature : top-left (141, 255)  size (54×20)  → bottom 275 < footY=279 ✓
  //
  const botY = credY + 62 + 7; // 252

  // INSCRIT stamp
  const stX = M + 18; // 33
  const stY = botY + 14; // 266
  setFill(doc, GREEN100);
  setDraw(doc, GREEN600);
  doc.setLineWidth(2);
  doc.circle(stX, stY, 11, "FD");
  doc.setLineWidth(0.6);
  doc.circle(stX, stY, 8.5, "S");
  setTxt(doc, GREEN800);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("INSCRIT", stX, stY + 1, { align: "center" });
  setTxt(doc, GREEN600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text("✓ VALIDÉ", stX, stY + 5.5, { align: "center" });

  // Signature block
  const sigX = pw - M - 54; // 141
  const sigY = botY + 3;    // 255
  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.roundedRect(sigX, sigY, 54, 20, 2.5, 2.5, "FD"); // bottom 275<279 ✓
  doc.setLineDashPattern([], 0);
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("Cachet et signature",  sigX + 27, sigY + 10, { align: "center" });
  doc.text("de l'établissement",   sigX + 27, sigY + 16, { align: "center" });

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
    "Ce reçu fait foi d'inscription. Veuillez le conserver précieusement.",
    pw / 2, footY + 4, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  const footLine2 = `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`;
  shrinkToFit(doc, footLine2, pw - M * 2, 7.5, 6);
  doc.text(footLine2, pw / 2, footY + 10.5, { align: "center" });

  return doc.output("arraybuffer");
}
