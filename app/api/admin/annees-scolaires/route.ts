import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Gestion des années scolaires.
 * - GET    : liste les années + nombre de classes / paiements rattachés.
 * - POST   : crée une année. La toute première année de l'école devient active
 *            et "absorbe" (backfill) toutes les données orphelines existantes.
 * - PATCH  : { id, action: "activer" | "cloturer" | "rouvrir" }.
 * - DELETE : supprime une année (seulement si non active et sans données rattachées).
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const annees = await prisma.anneeScolaire.findMany({
      where: { ecole_id: session.user.ecoleId },
      orderBy: { libelle: "desc" },
      include: {
        _count: { select: { classes: true, paiements: true, notes: true, absences: true } },
      },
    });

    return NextResponse.json(annees);
  } catch (error) {
    console.error("[ANNEES_GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { libelle, date_debut, date_fin } = body;

    if (!libelle || !date_debut || !date_fin) {
      return NextResponse.json(
        { error: "Libellé, date de début et date de fin obligatoires" },
        { status: 400 }
      );
    }

    const ecoleId = session.user.ecoleId;

    // Doublon ?
    const existing = await prisma.anneeScolaire.findFirst({
      where: { ecole_id: ecoleId, libelle: libelle.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Cette année scolaire existe déjà" }, { status: 409 });
    }

    // Première année de l'école ? → elle devient active et absorbe l'existant.
    const count = await prisma.anneeScolaire.count({ where: { ecole_id: ecoleId } });
    const estPremiere = count === 0;

    const annee = await prisma.$transaction(async (tx) => {
      const created = await tx.anneeScolaire.create({
        data: {
          libelle: libelle.trim(),
          date_debut: new Date(date_debut),
          date_fin: new Date(date_fin),
          est_active: estPremiere,
          ecole_id: ecoleId,
        },
      });

      // Backfill : rattacher les données orphelines (sans année) à cette
      // première année active. Les classes appartiennent à l'école ; notes,
      // paiements et absences sont rattachés via leurs élèves de l'école.
      if (estPremiere) {
        await tx.classe.updateMany({
          where: { ecole_id: ecoleId, annee_scolaire_id: null },
          data: { annee_scolaire_id: created.id },
        });
        await tx.paiement.updateMany({
          where: { annee_scolaire_id: null, eleve: { classe: { ecole_id: ecoleId } } },
          data: { annee_scolaire_id: created.id },
        });
        await tx.note.updateMany({
          where: { annee_scolaire_id: null, eleve: { classe: { ecole_id: ecoleId } } },
          data: { annee_scolaire_id: created.id },
        });
        await tx.absence.updateMany({
          where: { annee_scolaire_id: null, eleve: { classe: { ecole_id: ecoleId } } },
          data: { annee_scolaire_id: created.id },
        });
      }

      return created;
    });

    await prisma.auditLog.create({
      data: {
        action: estPremiere
          ? `Création année scolaire ${annee.libelle} (active, données existantes rattachées)`
          : `Création année scolaire ${annee.libelle}`,
        auteur_id: session.user.id,
      },
    });

    return NextResponse.json(annee, { status: 201 });
  } catch (error) {
    console.error("[ANNEES_POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body as { id?: string; action?: string };

    if (!id || !action) {
      return NextResponse.json({ error: "ID et action obligatoires" }, { status: 400 });
    }

    const annee = await prisma.anneeScolaire.findFirst({
      where: { id, ecole_id: session.user.ecoleId },
    });
    if (!annee) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    if (action === "activer") {
      // Une seule année active à la fois.
      await prisma.$transaction([
        prisma.anneeScolaire.updateMany({
          where: { ecole_id: session.user.ecoleId },
          data: { est_active: false },
        }),
        prisma.anneeScolaire.update({
          where: { id },
          data: { est_active: true, est_cloturee: false },
        }),
      ]);
    } else if (action === "cloturer") {
      await prisma.anneeScolaire.update({
        where: { id },
        data: { est_cloturee: true, est_active: false },
      });
    } else if (action === "rouvrir") {
      await prisma.anneeScolaire.update({
        where: { id },
        data: { est_cloturee: false },
      });
    } else {
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: `Année scolaire ${annee.libelle} : ${action}`,
        auteur_id: session.user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ANNEES_PATCH]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const annee = await prisma.anneeScolaire.findFirst({
      where: { id, ecole_id: session.user.ecoleId },
      include: {
        _count: { select: { classes: true, paiements: true, notes: true, absences: true } },
      },
    });
    if (!annee) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    if (annee.est_active) {
      return NextResponse.json(
        { error: "Impossible de supprimer l'année active" },
        { status: 400 }
      );
    }

    const total =
      annee._count.classes + annee._count.paiements + annee._count.notes + annee._count.absences;
    if (total > 0) {
      return NextResponse.json(
        { error: "Cette année contient des données et ne peut pas être supprimée" },
        { status: 400 }
      );
    }

    await prisma.anneeScolaire.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Suppression année scolaire ${annee.libelle}`,
        auteur_id: session.user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ANNEES_DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
