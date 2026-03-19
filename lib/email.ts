import { resend } from "./resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Email de confirmation de paiement
export async function sendPaymentConfirmation(
  to: string,
  data: {
    nomEleve: string;
    montant: number;
    mois: string;
    ecole: string;
  }
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `[${data.ecole}] Confirmation de paiement — ${data.nomEleve}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e40af;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h2 style="margin:0">${data.ecole}</h2>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
          <p>Bonjour,</p>
          <p>Nous confirmons la réception du paiement pour l'élève <strong>${data.nomEleve}</strong>.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0"><strong>Montant :</strong> ${data.montant.toLocaleString("fr-FR")} FCFA</p>
            <p style="margin:8px 0 0"><strong>Mois :</strong> ${data.mois}</p>
          </div>
          <p>Merci pour votre confiance.</p>
          <p>Cordialement,<br>Le service comptabilité</p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">
            Ce message est envoyé automatiquement par ${data.ecole}.
          </p>
        </div>
      </div>
    `,
  });
}

// Email de notification générale
export async function sendNotification(
  to: string,
  subject: string,
  message: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          ${message}
        </div>
      </div>
    `,
  });
}
