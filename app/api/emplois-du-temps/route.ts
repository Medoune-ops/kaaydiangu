import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — emploi du temps d'une classe (public ou authentifié)
export async function GET(req: NextRequest) {
  try {
    const classeId = req.nextUrl.searchParams.get("classe_id");
    if (!classeId) {
      return NextResponse.json({ error: "classe_id requis" }, { status: 400 });
    }

    const creneaux = await prisma.emploiDuTemps.findMany({
      where: { classe_id: classeId },
      include: {
        matiere: {
          select: {
            nom: true,
            professeur: { select: { nom: true, prenom: true } },
          },
        },
      },
      orderBy: [{ jour: "asc" }, { heure_debut: "asc" }],
    });

    return NextResponse.json(creneaux);
  } catch (error) {
    console.error("[EMPLOIS_DU_TEMPS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST — créer ou mettre à jour un créneau
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { classe_id, jour, heure_debut, heure_fin, matiere_id, salle } = body;

    if (!classe_id || !jour || !heure_debut || !heure_fin || !matiere_id) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier conflit : même classe, même jour, même créneau
    const conflit = await prisma.emploiDuTemps.findFirst({
      where: {
        classe_id,
        jour,
        heure_debut,
        heure_fin,
      },
    });

    if (conflit) {
      // Mettre à jour le créneau existant
      const updated = await prisma.emploiDuTemps.update({
        where: { id: conflit.id },
        data: { matiere_id, salle: salle || null },
        include: {
          matiere: {
            select: {
              nom: true,
              professeur: { select: { nom: true, prenom: true } },
            },
          },
        },
      });
      return NextResponse.json(updated);
    }

    const creneau = await prisma.emploiDuTemps.create({
      data: {
        jour,
        heure_debut,
        heure_fin,
        matiere_id,
        salle: salle || null,
        classe_id,
      },
      include: {
        matiere: {
          select: {
            nom: true,
            professeur: { select: { nom: true, prenom: true } },
          },
        },
      },
    });

    return NextResponse.json(creneau);
  } catch (error) {
    console.error("[EMPLOIS_DU_TEMPS_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// DELETE — supprimer un créneau
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    await prisma.emploiDuTemps.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[EMPLOIS_DU_TEMPS_DELETE] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
