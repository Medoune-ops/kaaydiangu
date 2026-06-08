import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profs = await prisma.professeurInfo.findMany({
      select: { id: true, nom: true, prenom: true, fonction: true },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });
    return NextResponse.json(profs);
  } catch (error) {
    console.error("[PUBLIC_PROFESSEURS_GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
