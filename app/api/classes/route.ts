import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — lister les classes de l'école
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const classes = await prisma.classe.findMany({
    where: { ecole_id: session.user.ecoleId },
    select: {
      id: true,
      nom: true,
      niveau: true,
      filiere: true,
      annee_scolaire: true,
      montant_scolarite: true,
      matieres: {
        select: {
          id: true,
          nom: true,
          coefficient: true,
          professeur_id: true,
          professeur: { select: { nom: true, prenom: true } },
        },
        orderBy: { nom: "asc" },
      },
      _count: { select: { eleves: { where: { actif: true } } } },
    },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  return NextResponse.json(classes);
}

// POST — créer une classe
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { nom, niveau, filiere, montant_scolarite } = body;

  if (!nom || !niveau) {
    return NextResponse.json({ error: "Nom et niveau requis" }, { status: 400 });
  }

  const ecole = await prisma.ecole.findUnique({
    where: { id: session.user.ecoleId },
    select: { annee_scolaire: true },
  });

  const classe = await prisma.classe.create({
    data: {
      nom,
      niveau,
      filiere: filiere || null,
      annee_scolaire: ecole?.annee_scolaire || new Date().getFullYear().toString(),
      montant_scolarite: montant_scolarite || 0,
      ecole_id: session.user.ecoleId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CLASSE_CREEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({ classe_id: classe.id, nom, niveau })),
    },
  });

  return NextResponse.json(classe);
}

// PATCH — modifier une classe
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { id, nom, niveau, filiere, montant_scolarite } = body;

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const existing = await prisma.classe.findFirst({
    where: { id, ecole_id: session.user.ecoleId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  if (nom !== undefined) update.nom = nom;
  if (niveau !== undefined) update.niveau = niveau;
  if (filiere !== undefined) update.filiere = filiere || null;
  if (montant_scolarite !== undefined) update.montant_scolarite = montant_scolarite;

  const classe = await prisma.classe.update({
    where: { id },
    data: update,
  });

  await prisma.auditLog.create({
    data: {
      action: "CLASSE_MODIFIEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({ classe_id: id, ...update })),
    },
  });

  return NextResponse.json(classe);
}

// DELETE — supprimer une classe (seulement si vide)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const classe = await prisma.classe.findFirst({
    where: { id, ecole_id: session.user.ecoleId },
    include: { _count: { select: { eleves: true } } },
  });

  if (!classe) {
    return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
  }

  if (classe._count.eleves > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${classe._count.eleves} élève(s) inscrit(s)` },
      { status: 400 }
    );
  }

  // Supprimer les matières, emplois du temps, etc. liés
  await prisma.$transaction([
    prisma.emploiDuTemps.deleteMany({ where: { classe_id: id } }),
    prisma.cours.deleteMany({ where: { classe_id: id } }),
    prisma.matiere.deleteMany({ where: { classe_id: id } }),
    prisma.classe.delete({ where: { id } }),
  ]);

  await prisma.auditLog.create({
    data: {
      action: "CLASSE_SUPPRIMEE",
      auteur_id: session.user.id,
      details: JSON.parse(JSON.stringify({ classe_id: id, nom: classe.nom })),
    },
  });

  return NextResponse.json({ ok: true });
}
