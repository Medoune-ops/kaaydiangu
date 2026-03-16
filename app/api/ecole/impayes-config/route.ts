import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const ecole = await prisma.ecole.findFirst({
    where: { id: session.user.ecoleId },
    select: { impaye_liste_active: true, impaye_seuil_jours: true },
  });

  return NextResponse.json(ecole);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.impaye_liste_active === "boolean") {
    update.impaye_liste_active = body.impaye_liste_active;
  }
  if (typeof body.impaye_seuil_jours === "number" && body.impaye_seuil_jours > 0) {
    update.impaye_seuil_jours = body.impaye_seuil_jours;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide" }, { status: 400 });
  }

  const ecole = await prisma.ecole.update({
    where: { id: session.user.ecoleId },
    data: update,
  });

  await prisma.auditLog.create({
    data: {
      action: "CONFIG_IMPAYES_MODIFIEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify(update)),
    },
  });

  return NextResponse.json({
    impaye_liste_active: ecole.impaye_liste_active,
    impaye_seuil_jours: ecole.impaye_seuil_jours,
  });
}
