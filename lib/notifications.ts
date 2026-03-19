import { resend } from "./resend";

// ─── CONFIG ───

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// ─── TYPES ───

export interface NotifResult {
  success: boolean;
  error?: string;
}

// ─── EMAIL ───

export async function sendEmailNotification(
  destinataire: string,
  sujet: string,
  contenu: string
): Promise<NotifResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY non configurée" };
  }
  if (!destinataire) {
    return { success: false, error: "Pas d'adresse email" };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: destinataire,
      subject: sujet,
      html: contenu,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur email" };
  }
}

// ─── TEMPLATES EMAIL ───

function emailWrapper(ecoleNom: string, body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h2 style="margin:0">${ecoleNom}</h2>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
        ${body}
        <p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">
          Ce message est envoyé automatiquement par ${ecoleNom}.
        </p>
      </div>
    </div>
  `;
}

// ─── ÉVÉNEMENTS MÉTIER ───

interface EleveInfo {
  prenom: string;
  nom: string;
  matricule: string;
  classe: string;
  email_parent?: string | null;
  telephone_parent?: string | null;
}

/**
 * Rappel de paiement — vers le parent (email)
 */
export async function notifierRappelPaiement(
  ecoleNom: string,
  eleve: EleveInfo,
  moisImpayes: string[]
) {
  const moisListe = moisImpayes.join(", ");
  const results: { email?: NotifResult } = {};

  if (eleve.email_parent) {
    results.email = await sendEmailNotification(
      eleve.email_parent,
      `[${ecoleNom}] Rappel de paiement — ${eleve.prenom} ${eleve.nom}`,
      emailWrapper(
        ecoleNom,
        `<p>Cher(e) parent/tuteur,</p>
        <p>Nous vous rappelons que l'élève <strong>${eleve.prenom} ${eleve.nom}</strong>
        (${eleve.matricule}, classe ${eleve.classe}) présente un retard de paiement.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;font-weight:bold;color:#dc2626">Mois impayé(s) : ${moisListe}</p>
        </div>
        <p>Nous vous prions de bien vouloir régulariser cette situation dans les meilleurs délais.</p>
        <p>Cordialement,<br>Le service comptabilité</p>`
      )
    );
  }

  return results;
}

/**
 * Nouvelle note publiée — vers l'élève (email)
 */
export async function notifierNouvelleNote(
  ecoleNom: string,
  eleveEmail: string | null,
  elevePrenom: string,
  matiere: string,
  typeNote: string,
  sequence: number
) {
  if (!eleveEmail) return { email: { success: false, error: "Pas d'email" } as NotifResult };

  const typeLabel: Record<string, string> = {
    CONTROLE: "contrôle",
    DEVOIR: "devoir",
    EXAMEN: "examen",
  };

  const email = await sendEmailNotification(
    eleveEmail,
    `[${ecoleNom}] Nouvelle note en ${matiere}`,
    emailWrapper(
      ecoleNom,
      `<p>Bonjour ${elevePrenom},</p>
      <p>Une note de <strong>${typeLabel[typeNote] || typeNote}</strong> en
      <strong>${matiere}</strong> (séquence ${sequence}) a été publiée.</p>
      <p>Connectez-vous à votre espace élève pour la consulter.</p>`
    )
  );

  return { email };
}

/**
 * Bulletin disponible — vers l'élève et le parent (email)
 */
export async function notifierBulletinDisponible(
  ecoleNom: string,
  eleve: EleveInfo,
  eleveEmail: string | null,
  sequence: number
) {
  const results: { email_eleve?: NotifResult; email_parent?: NotifResult } = {};

  // Email à l'élève
  if (eleveEmail) {
    results.email_eleve = await sendEmailNotification(
      eleveEmail,
      `[${ecoleNom}] Bulletin séquence ${sequence} disponible`,
      emailWrapper(
        ecoleNom,
        `<p>Bonjour ${eleve.prenom},</p>
        <p>Votre bulletin de notes pour la <strong>séquence ${sequence}</strong> est maintenant disponible.</p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="margin:0;font-weight:bold;color:#1e40af">Connectez-vous à votre espace élève pour le consulter.</p>
        </div>`
      )
    );
  }

  // Email au parent
  if (eleve.email_parent) {
    results.email_parent = await sendEmailNotification(
      eleve.email_parent,
      `[${ecoleNom}] Bulletin de ${eleve.prenom} ${eleve.nom} — Séquence ${sequence}`,
      emailWrapper(
        ecoleNom,
        `<p>Cher(e) parent/tuteur,</p>
        <p>Le bulletin de notes de <strong>${eleve.prenom} ${eleve.nom}</strong>
        (${eleve.matricule}, classe ${eleve.classe}) pour la <strong>séquence ${sequence}</strong>
        est maintenant disponible.</p>
        <p>Pour le consulter, veuillez vous adresser au secrétariat de l'établissement ou
        demander à votre enfant de se connecter à son espace élève.</p>`
      )
    );
  }

  return results;
}

/**
 * Convocation — vers l'élève et le parent (email)
 */
export async function notifierConvocation(
  ecoleNom: string,
  eleve: EleveInfo,
  eleveEmail: string | null,
  motif: string,
  dateConvocation: string
) {
  const results: { email_eleve?: NotifResult; email_parent?: NotifResult } = {};

  // Email à l'élève
  if (eleveEmail) {
    results.email_eleve = await sendEmailNotification(
      eleveEmail,
      `[${ecoleNom}] Convocation`,
      emailWrapper(
        ecoleNom,
        `<p>Bonjour ${eleve.prenom},</p>
        <p>Vous êtes convoqué(e) à l'établissement.</p>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0"><strong>Motif :</strong> ${motif}</p>
          <p style="margin:8px 0 0"><strong>Date :</strong> ${dateConvocation}</p>
        </div>
        <p>Merci de vous présenter à la date indiquée.</p>`
      )
    );
  }

  // Email au parent
  if (eleve.email_parent) {
    results.email_parent = await sendEmailNotification(
      eleve.email_parent,
      `[${ecoleNom}] Convocation — ${eleve.prenom} ${eleve.nom}`,
      emailWrapper(
        ecoleNom,
        `<p>Cher(e) parent/tuteur,</p>
        <p>Votre enfant <strong>${eleve.prenom} ${eleve.nom}</strong> (${eleve.matricule}, classe ${eleve.classe})
        est convoqué(e) à l'établissement.</p>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0"><strong>Motif :</strong> ${motif}</p>
          <p style="margin:8px 0 0"><strong>Date :</strong> ${dateConvocation}</p>
        </div>
        <p>Votre présence est vivement souhaitée.</p>`
      )
    );
  }

  return results;
}
