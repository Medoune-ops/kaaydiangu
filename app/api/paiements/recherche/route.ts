import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — recherche d'élèves par nom ou matricule (pour le comptable)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const words = q.split(/\s+/).filter(Boolean);

    const eleves = await prisma.eleve.findMany({
      where: {
        classe: { ecole_id: session.user.ecoleId },
        actif: true,
        AND: words.map((word) => ({
          OR: [
            { matricule: { contains: word, mode: "insensitive" } },
            { nom: { contains: word, mode: "insensitive" } },
            { prenom: { contains: word, mode: "insensitive" } },
          ],
        })),
      },
      select: {
        id: true,
        matricule: true,
        nom: true,
        prenom: true,
        classe: { select: { nom: true } },
      },
      take: 10,
      orderBy: { nom: "asc" },
    });

    return NextResponse.json(eleves);
  } catch (error) {
    console.error("[PAIEMENTS_RECHERCHE_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
