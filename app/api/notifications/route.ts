import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des notifications de l'utilisateur connecté
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
    where: { destinataire_id: session.user.id },
    orderBy: { date_envoi: "desc" },
    take: 30,
  });

  const nonLues = await prisma.notification.count({
    where: { destinataire_id: session.user.id, lu: false },
  });

    return NextResponse.json({ notifications, nonLues });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// PATCH — marquer une ou toutes les notifications comme lues
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
  const { id, tout_lu } = body;

  if (tout_lu) {
    await prisma.notification.updateMany({
      where: { destinataire_id: session.user.id, lu: false },
      data: { lu: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (!id) {
    return NextResponse.json({ error: "id ou tout_lu requis" }, { status: 400 });
  }

  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.destinataire_id !== session.user.id) {
    return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  }

    await prisma.notification.update({
      where: { id },
      data: { lu: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
