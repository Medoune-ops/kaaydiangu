import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifierConvocation } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

// POST — envoyer une convocation à un élève
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { eleve_id, motif, date_convocation } = body;

  if (!eleve_id || !motif || !date_convocation) {
    return NextResponse.json(
      { error: "eleve_id, motif et date_convocation requis" },
      { status: 400 }
    );
  }

  const eleve = await prisma.eleve.findUnique({
    where: { id: eleve_id },
    select: {
      nom: true,
      prenom: true,
      matricule: true,
      email_parent: true,
      telephone_parent: true,
      user_id: true,
      user: { select: { email: true } },
      classe: { select: { nom: true, ecole: { select: { nom: true } } } },
    },
  });

  if (!eleve) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  // Notification in-app
  await prisma.notification.create({
    data: {
      titre: "Convocation",
      message: `Vous êtes convoqué(e) le ${date_convocation}. Motif : ${motif}`,
      type: "CONVOCATION",
      destinataire_id: eleve.user_id,
    },
  });

  // Email notifications
  const results = await notifierConvocation(
    eleve.classe.ecole.nom,
    {
      prenom: eleve.prenom,
      nom: eleve.nom,
      matricule: eleve.matricule,
      classe: eleve.classe.nom,
      email_parent: eleve.email_parent,
      telephone_parent: eleve.telephone_parent,
    },
    eleve.user.email,
    motif,
    date_convocation
  );

  await prisma.auditLog.create({
    data: {
      action: "CONVOCATION_ENVOYEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({
        eleve: `${eleve.prenom} ${eleve.nom}`,
        matricule: eleve.matricule,
        motif,
        date_convocation,
      })),
    },
  });

  return NextResponse.json({
    ok: true,
    email_eleve: results.email_eleve?.success || false,
    email_parent: results.email_parent?.success || false,
  });
}
