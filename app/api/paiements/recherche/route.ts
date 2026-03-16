import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — recherche d'élèves par nom ou matricule (pour le comptable)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const eleves = await prisma.eleve.findMany({
    where: {
      classe: { ecole_id: session.user.ecoleId },
      actif: true,
      OR: [
        { matricule: { contains: q, mode: "insensitive" } },
        { nom: { contains: q, mode: "insensitive" } },
        { prenom: { contains: q, mode: "insensitive" } },
      ],
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
}
