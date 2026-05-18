import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const ecoleId = session.user.ecoleId;

    const [nbClasses, nbEleves, nbAbsencesNJ, derniereNote] = await Promise.all([
      prisma.classe.count({ where: { ecole_id: ecoleId } }),
      prisma.eleve.count({ where: { classe: { ecole_id: ecoleId }, actif: true } }),
      prisma.absence.count({
        where: { eleve: { classe: { ecole_id: ecoleId }, actif: true }, justifiee: false },
      }),
      prisma.note.findFirst({
        where: { eleve: { classe: { ecole_id: ecoleId }, actif: true } },
        orderBy: { sequence: "desc" },
        select: { sequence: true },
      }),
    ]);

    const lastSeq = derniereNote?.sequence ?? 1;

    const elevesAvecNotes = await prisma.eleve.findMany({
      where: { classe: { ecole_id: ecoleId }, actif: true },
      select: {
        notes: {
          where: { sequence: lastSeq },
          select: { valeur: true, matiere: { select: { coefficient: true } } },
        },
      },
    });

    let moyenneEcole: number | null = null;
    const moyennes: number[] = [];
    for (const e of elevesAvecNotes) {
      if (!e.notes.length) continue;
      const totalP = e.notes.reduce((s, n) => s + n.valeur * n.matiere.coefficient, 0);
      const totalC = e.notes.reduce((s, n) => s + n.matiere.coefficient, 0);
      if (totalC > 0) moyennes.push(totalP / totalC);
    }
    if (moyennes.length > 0) {
      moyenneEcole =
        Math.round((moyennes.reduce((s, m) => s + m, 0) / moyennes.length) * 100) / 100;
    }

    return NextResponse.json({ nbClasses, nbEleves, nbAbsencesNJ, moyenneEcole, sequenceRef: lastSeq });
  } catch (error) {
    console.error("[CENSEUR_STATS_GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
