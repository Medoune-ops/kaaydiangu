import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "PROFESSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const matieres = await prisma.matiere.findMany({
      where: { professeur_id: session.user.id },
      include: {
        classe: {
          select: { id: true, nom: true, niveau: true },
        },
      },
      orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
    });

    return NextResponse.json(matieres);
  } catch (error) {
    console.error("[PROFESSEUR_MATIERES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
