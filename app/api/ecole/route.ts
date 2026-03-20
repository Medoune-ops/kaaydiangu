import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — infos complètes de l'école
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const ecole = await prisma.ecole.findUnique({
    where: { id: session.user.ecoleId },
  });

  if (!ecole) {
    return NextResponse.json({ error: "École introuvable" }, { status: 404 });
  }

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("[ECOLE_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// PATCH — mise à jour des infos de l'école
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
  const allowedFields = [
    "nom",
    "logo",
    "slogan",
    "adresse",
    "telephone",
    "email",
    "annee_scolaire",
    "frais_inscription",
    "impaye_seuil_jours",
    "impaye_liste_active",
  ];

  const update: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      update[key] = body[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
  }

  const ecole = await prisma.ecole.update({
    where: { id: session.user.ecoleId },
    data: update,
  });

  await prisma.auditLog.create({
    data: {
      action: "CONFIG_ECOLE_MODIFIEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify(update)),
    },
  });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("[ECOLE_PATCH] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
