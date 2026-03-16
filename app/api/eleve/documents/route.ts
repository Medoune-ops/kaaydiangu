import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const eleve = await prisma.eleve.findFirst({
    where: { user_id: session.user.id },
    select: { id: true, classe_id: true },
  });

  if (!eleve) {
    return NextResponse.json({ error: "Profil élève introuvable" }, { status: 404 });
  }

  // Séquences avec des notes (bulletins disponibles)
  const notes = await prisma.note.findMany({
    where: { eleve_id: eleve.id },
    select: { sequence: true },
    distinct: ["sequence"],
    orderBy: { sequence: "asc" },
  });
  const sequences = notes.map((n) => n.sequence);

  // Paiements payés
  const paiements = await prisma.paiement.findMany({
    where: { eleve_id: eleve.id, statut: "PAYE" },
    orderBy: [{ annee: "asc" }, { mois: "asc" }],
    select: {
      id: true,
      mois: true,
      annee: true,
      montant: true,
      mode: true,
      recu_numero: true,
      date_paiement: true,
    },
  });

  // Cours de la classe
  const cours = await prisma.cours.findMany({
    where: { classe_id: eleve.classe_id },
    include: {
      matiere: { select: { nom: true } },
      depose_par: { select: { nom: true, prenom: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ eleveId: eleve.id, sequences, paiements, cours });
}
