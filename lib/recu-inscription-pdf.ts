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

// ─── Palette (même que recu-pdf.ts) ───────────────────────────────────────────
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

// Thème inscription — amber (identique à recu-pdf.ts isIns=true)
const ACCENT: RGB  = [180, 83, 9];    // amber-700
const ACCENT2: RGB = [253, 230, 138]; // amber-200
const BG: RGB      = [255, 251, 235]; // amber-50
const HDR: RGB     = [120, 53, 15];   // amber-900

// Thème identifiants — indigo
const CRED_BG: RGB     = [238, 242, 255]; // indigo-50
const CRED_ACCENT: RGB = [79, 70, 229];   // indigo-600
const CRED_HDR: RGB    = [30, 27, 75];    // indigo-950
const CRED_ACCENT2: RGB = [199, 210, 254]; // indigo-200
const RED: RGB = [220, 38, 38];

// Thème avertissement — amber clair
const WARN_BG: RGB     = [254, 243, 199]; // amber-100
const WARN_BORDER: RGB = [217, 119, 6];   // amber-600
const WARN_TEXT: RGB   = [120, 53, 15];   // amber-900

function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: jsPDF, c: RGB)  { doc.setTextColor(c[0], c[1], c[2]); }

export function genererRecuInscriptionPDF(data: RecuInscriptionData): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pw = doc.internal.pageSize.getWidth();   // 148 mm
  const ph = doc.internal.pageSize.getHeight();  // 210 mm
  const M = 10;

  // ─── ACCENT TOP BAR ────────────────────────────────────────────────────────
  setFill(doc, ACCENT);
  doc.rect(0, 0, pw, 2.5, "F");

  // ─── HEADER (dark background) ──────────────────────────────────────────────
  setFill(doc, SLATE900);
  doc.rect(0, 2.5, pw, 40, "F");

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

  // Nom de l'école — auto-shrink si trop long
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  const schoolNom = data.ecole.nom.toUpperCase();
  const schoolMaxW = pw - nameX - M + (pw / 2 - nameX);
  let schoolFs = 14;
  doc.setFontSize(schoolFs);
  while (doc.getTextWidth(schoolNom) > schoolMaxW && schoolFs > 8) {
    schoolFs -= 0.5;
    doc.setFontSize(schoolFs);
  }
  doc.text(schoolNom, nameX, 16, { align: "center" });

  // Infos contact
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

  // Pill année scolaire
  setFill(doc, HDR);
  const pillW = 52, pillH = 5.5;
  doc.roundedRect(nameX - pillW / 2, hy - 1, pillW, pillH, 1.2, 1.2, "F");
  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(`Année scolaire  ${data.ecole.annee_scolaire}`, nameX, hy + 2.8, { align: "center" });

  // ─── BANNER TYPE REÇU ──────────────────────────────────────────────────────
  const banY = 45;
  setFill(doc, BG);
  doc.rect(0, banY, pw, 18, "F");

  const badgeW = 56;
  setFill(doc, ACCENT);
  doc.roundedRect(pw / 2 - badgeW / 2, banY + 2.5, badgeW, 8, 1.5, 1.5, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("REÇU D'INSCRIPTION", pw / 2, banY + 7.8, { align: "center" });

  const dateStr = new Date(data.eleve.date_inscription).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  setTxt(doc, SLATE600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Date : ${dateStr}`, M, banY + 14.5);

  // ─── DEUX COLONNES INFO ────────────────────────────────────────────────────
  const infoY = 66;
  const colW  = (pw - M * 2 - 3) / 2; // ~62.5 mm
  const c1    = M;
  const c2    = M + colW + 3;
  const rowH  = 38;

  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.2);
  doc.roundedRect(c1, infoY, colW, rowH, 2, 2, "FD");
  doc.roundedRect(c2, infoY, colW, rowH, 2, 2, "FD");

  // En-têtes colonnes
  setFill(doc, ACCENT);
  doc.roundedRect(c1 + 2, infoY + 2, colW - 4, 6, 1.2, 1.2, "F");
  doc.roundedRect(c2 + 2, infoY + 2, colW - 4, 6, 1.2, 1.2, "F");
  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("BÉNÉFICIAIRE", c1 + colW / 2, infoY + 5.8, { align: "center" });
  doc.text("INSCRIPTION", c2 + colW / 2, infoY + 5.8, { align: "center" });

  // Helper champ — auto-shrink + 2e ligne si le texte déborde
  const field = (x: number, y: number, label: string, value: string) => {
    const safeValue = String(value ?? "");
    setTxt(doc, SLATE400);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(label.toUpperCase(), x + 3, y);
    setTxt(doc, SLATE900);
    doc.setFont("helvetica", "bold");
    const maxW = colW - 6;
    let fs = 8.2;
    doc.setFontSize(fs);
    while (doc.getTextWidth(safeValue) > maxW && fs > 6) {
      fs -= 0.3;
      doc.setFontSize(fs);
    }
    const lines = doc.splitTextToSize(safeValue, maxW) as string[];
    doc.text(lines[0], x + 3, y + 4.5);
    if (lines.length > 1) {
      doc.setFontSize(Math.min(fs, 7));
      doc.text(lines[1], x + 3, y + 8.2);
    }
  };

  // Colonne gauche : élève
  let fy = infoY + 10;
  field(c1, fy, "Nom complet", `${data.eleve.prenom} ${data.eleve.nom}`);
  fy += 9;
  field(c1, fy, "Matricule", data.eleve.matricule);
  fy += 9;
  field(c1, fy, "Classe", data.eleve.classe);

  // Colonne droite : détails inscription
  fy = infoY + 10;
  field(c2, fy, "Année scolaire", data.ecole.annee_scolaire);
  fy += 9;
  field(c2, fy, "Type de frais", "Inscription");
  fy += 9;
  field(c2, fy, "Mode de paiement", "Espèces");

  // ─── BLOC MONTANT ──────────────────────────────────────────────────────────
  const amtY = infoY + rowH + 4; // 108
  setFill(doc, HDR);
  doc.roundedRect(M, amtY, pw - M * 2, 20, 2.5, 2.5, "F");
  setFill(doc, ACCENT);
  doc.roundedRect(M + 0.4, amtY + 0.4, pw - M * 2 - 0.8, 19.2, 2.2, 2.2, "F");

  setTxt(doc, ACCENT2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("FRAIS D'INSCRIPTION RÉGLÉS", M + 5, amtY + 7);

  setTxt(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text(`${fmt(data.montant_inscription)} FCFA`, pw - M - 4, amtY + 15.5, { align: "right" });

  // ─── BLOC IDENTIFIANTS ─────────────────────────────────────────────────────
  const credY = amtY + 26; // 134
  setFill(doc, CRED_BG);
  setDraw(doc, CRED_ACCENT);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, credY, pw - M * 2, 40, 2, 2, "FD");

  // En-tête identifiants
  setFill(doc, CRED_HDR);
  doc.roundedRect(M, credY, pw - M * 2, 8, 2, 2, "F");
  setFill(doc, CRED_HDR);
  doc.rect(M, credY + 4, pw - M * 2, 4, "F");
  setTxt(doc, CRED_ACCENT2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("IDENTIFIANTS DE CONNEXION — ESPACE ÉLÈVE", pw / 2, credY + 5.5, { align: "center" });

  // Champ email
  const credLX = M + 4;
  const credVX = M + 28;
  const credMaxW = pw - M - 4 - credVX;
  let cy2 = credY + 13;

  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("EMAIL :", credLX, cy2);
  setTxt(doc, SLATE900);
  doc.setFont("helvetica", "bold");
  let emailFs = 8;
  doc.setFontSize(emailFs);
  while (doc.getTextWidth(data.credentials.email) > credMaxW && emailFs > 5.5) {
    emailFs -= 0.3;
    doc.setFontSize(emailFs);
  }
  doc.text(data.credentials.email, credVX, cy2);

  // Champ mot de passe — auto-shrink identique au champ email
  cy2 += 8;
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("MOT DE PASSE :", credLX, cy2);
  setTxt(doc, RED);
  doc.setFont("helvetica", "bold");
  let pwdFs = 10;
  doc.setFontSize(pwdFs);
  while (doc.getTextWidth(data.credentials.mot_de_passe) > credMaxW && pwdFs > 6) {
    pwdFs -= 0.3;
    doc.setFontSize(pwdFs);
  }
  doc.text(data.credentials.mot_de_passe, credVX, cy2);

  // Avertissement mot de passe provisoire
  cy2 += 9;
  setFill(doc, WARN_BG);
  setDraw(doc, WARN_BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(M + 2, cy2, pw - M * 2 - 4, 10, 1, 1, "FD");
  setTxt(doc, WARN_TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("⚠  MOT DE PASSE PROVISOIRE — À changer à la première connexion.", pw / 2, cy2 + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Conservez ce document en lieu sûr.", pw / 2, cy2 + 8.5, { align: "center" });

  // ─── ZONE BAS (tampon + signature) ────────────────────────────────────────
  const botY = credY + 40; // 174

  // Tampon INSCRIT
  const stX = M + 14;
  const stY = botY + 11;
  setFill(doc, GREEN100);
  setDraw(doc, GREEN600);
  doc.setLineWidth(1.5);
  doc.circle(stX, stY, 10, "FD");
  doc.setLineWidth(0.5);
  doc.circle(stX, stY, 7.8, "S");
  setTxt(doc, GREEN800);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INSCRIT", stX, stY + 1, { align: "center" });
  setTxt(doc, GREEN600);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text("✓ VALIDÉ", stX, stY + 5, { align: "center" });

  // Bloc signature
  const sigX = pw - M - 42;
  const sigY = botY + 2;
  setFill(doc, SLATE50);
  setDraw(doc, SLATE200);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.roundedRect(sigX, sigY, 42, 18, 2, 2, "FD");
  doc.setLineDashPattern([], 0);
  setTxt(doc, SLATE400);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.text("Cachet et signature", sigX + 21, sigY + 9, { align: "center" });
  doc.text("de l'établissement", sigX + 21, sigY + 14, { align: "center" });

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
    "Ce reçu fait foi d'inscription. Veuillez le conserver précieusement.",
    pw / 2, footY + 3, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${data.ecole.nom}`,
    pw / 2, footY + 7.5, { align: "center" }
  );

  return doc.output("arraybuffer");
}
