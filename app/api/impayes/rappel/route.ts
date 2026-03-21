import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifierRappelPaiement } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

const MOIS_NOMS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// POST — envoyer un rappel de paiement à un ou plusieurs élèves
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const body = await req.json();
  const { eleve_ids } = body as { eleve_ids: string[] };

  if (!eleve_ids || eleve_ids.length === 0) {
    return NextResponse.json({ error: "eleve_ids requis" }, { status: 400 });
  }

  const ecole = await prisma.ecole.findUnique({
    where: { id: session.user.ecoleId },
    select: { nom: true },
  });
  const ecoleNom = ecole?.nom || "IREF";

  const eleves = await prisma.eleve.findMany({
    where: { id: { in: eleve_ids }, actif: true },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      email_parent: true,
      telephone_parent: true,
      user_id: true,
      classe: { select: { nom: true } },
      paiements: {
        where: { statut: "NON_PAYE" },
        select: { mois: true, annee: true },
        orderBy: [{ annee: "asc" }, { mois: "asc" }],
      },
    },
  });

  let notificationsEnvoyees = 0;
  let emailsEnvoyes = 0;
  let emailsEchoues = 0;
  for (const eleve of eleves) {
    const moisList = eleve.paiements.map(
      (p) => `${MOIS_NOMS[p.mois]} ${p.annee}`
    );
    const moisTexte = moisList.join(", ");

    // 1. Notification in-app
    await prisma.notification.create({
      data: {
        titre: "Rappel de paiement",
        message: `Rappel : ${eleve.paiements.length} mois impayé(s) (${moisTexte}). Veuillez régulariser votre situation.`,
        type: "RAPPEL_PAIEMENT",
        destinataire_id: eleve.user_id,
      },
    });
    notificationsEnvoyees++;

    // 2. Email au parent
    const results = await notifierRappelPaiement(ecoleNom, {
      prenom: eleve.prenom,
      nom: eleve.nom,
      matricule: eleve.matricule,
      classe: eleve.classe.nom,
      email_parent: eleve.email_parent,
      telephone_parent: eleve.telephone_parent,
    }, moisList);

    if (results.email?.success) emailsEnvoyes++;
    else if (results.email && !results.email.success && eleve.email_parent) emailsEchoues++;
  }

  await prisma.auditLog.create({
    data: {
      action: "RAPPEL_IMPAYES_ENVOYE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({
        nombre_eleves: eleves.length,
        notifications: notificationsEnvoyees,
        emails_envoyes: emailsEnvoyes,
        emails_echoues: emailsEchoues,
      })),
    },
  });

  return NextResponse.json({
    notifications: notificationsEnvoyees,
    emails_envoyes: emailsEnvoyes,
    emails_echoues: emailsEchoues,
    total: eleves.length,
  });
  } catch (error) {
    console.error("[IMPAYES_RAPPEL_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
