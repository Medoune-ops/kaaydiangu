import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST — envoyer un message de la direction à des destinataires
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { titre, message, cible } = body as {
    titre: string;
    message: string;
    cible: "tous" | "eleves" | "professeurs" | "classe";
    classe_id?: string;
  };

  if (!titre || !message || !cible) {
    return NextResponse.json({ error: "titre, message et cible requis" }, { status: 400 });
  }

  let destinataires: { id: string }[] = [];

  if (cible === "tous") {
    destinataires = await prisma.user.findMany({
      where: { ecole_id: session.user.ecoleId, actif: true },
      select: { id: true },
    });
  } else if (cible === "eleves") {
    destinataires = await prisma.user.findMany({
      where: { ecole_id: session.user.ecoleId, role: "ELEVE", actif: true },
      select: { id: true },
    });
  } else if (cible === "professeurs") {
    destinataires = await prisma.user.findMany({
      where: { ecole_id: session.user.ecoleId, role: "PROFESSEUR", actif: true },
      select: { id: true },
    });
  } else if (cible === "classe" && body.classe_id) {
    const eleves = await prisma.eleve.findMany({
      where: { classe_id: body.classe_id, actif: true },
      select: { user_id: true },
    });
    destinataires = eleves.map((e) => ({ id: e.user_id }));
  }

  if (destinataires.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire trouvé" }, { status: 400 });
  }

  await prisma.notification.createMany({
    data: destinataires.map((d) => ({
      titre,
      message,
      type: "MESSAGE",
      destinataire_id: d.id,
    })),
  });

  await prisma.auditLog.create({
    data: {
      action: "MESSAGE_DIRECTION_ENVOYE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({ titre, cible, nb_destinataires: destinataires.length })),
    },
  });

  return NextResponse.json({ envoyes: destinataires.length });
}
