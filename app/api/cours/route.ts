import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des cours (pour professeur : ses cours, pour élève : cours de sa classe)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const classeId = searchParams.get("classe_id");

  if (session.user.role === "PROFESSEUR") {
    const cours = await prisma.cours.findMany({
      where: { depose_par_id: session.user.id },
      include: {
        matiere: { select: { nom: true } },
        classe: { select: { nom: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(cours);
  }

  if (session.user.role === "ELEVE") {
    const eleve = await prisma.eleve.findFirst({
      where: { user_id: session.user.id },
      select: { classe_id: true },
    });
    if (!eleve) {
      return NextResponse.json({ error: "Profil élève introuvable" }, { status: 404 });
    }
    const cours = await prisma.cours.findMany({
      where: { classe_id: eleve.classe_id },
      include: {
        matiere: { select: { nom: true } },
        classe: { select: { nom: true } },
        depose_par: { select: { nom: true, prenom: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(cours);
  }

  // Admin/Censeur : filtrable par classe
  const where: Record<string, unknown> = {};
  if (classeId) where.classe_id = classeId;

  const cours = await prisma.cours.findMany({
    where,
    include: {
      matiere: { select: { nom: true } },
      classe: { select: { nom: true } },
      depose_par: { select: { nom: true, prenom: true } },
    },
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json(cours);
}

// POST — déposer un nouveau cours
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "PROFESSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { titre, description, fichier_url, matiere_id, classe_id } = body;

  if (!titre || !fichier_url || !matiere_id || !classe_id) {
    return NextResponse.json(
      { error: "titre, fichier_url, matiere_id et classe_id requis" },
      { status: 400 }
    );
  }

  // Vérifier que le professeur enseigne bien cette matière dans cette classe
  if (session.user.role === "PROFESSEUR") {
    const matiere = await prisma.matiere.findFirst({
      where: { id: matiere_id, professeur_id: session.user.id, classe_id },
    });
    if (!matiere) {
      return NextResponse.json(
        { error: "Vous n'enseignez pas cette matière dans cette classe" },
        { status: 403 }
      );
    }
  }

  const cours = await prisma.cours.create({
    data: {
      titre,
      description: description || null,
      fichier_url,
      matiere_id,
      classe_id,
      depose_par_id: session.user.id,
    },
  });

  return NextResponse.json(cours, { status: 201 });
}

// DELETE — supprimer un cours
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "PROFESSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const coursId = searchParams.get("id");
  if (!coursId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const cours = await prisma.cours.findUnique({ where: { id: coursId } });
  if (!cours) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  // Un prof ne peut supprimer que ses propres cours
  if (session.user.role === "PROFESSEUR" && cours.depose_par_id !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.cours.delete({ where: { id: coursId } });
  return NextResponse.json({ ok: true });
}
