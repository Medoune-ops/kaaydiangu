import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { depenseSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des dépenses (filtrable par mois/année)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const mois = searchParams.get("mois");
    const annee = searchParams.get("annee");
    const categorie = searchParams.get("categorie");

    const where: Record<string, unknown> = { ecole_id: session.user.ecoleId };

    if (mois && annee) {
      const m = parseInt(mois);
      const a = parseInt(annee);
      where.date = {
        gte: new Date(a, m - 1, 1),
        lt: new Date(a, m, 1),
      };
    } else if (annee) {
      const a = parseInt(annee);
      where.date = {
        gte: new Date(a, 0, 1),
        lt: new Date(a + 1, 0, 1),
      };
    }

    if (categorie) {
      where.categorie = categorie;
    }

    const page = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (page) {
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.depense.findMany({
          where,
          include: { enregistre_par: { select: { nom: true, prenom: true } } },
          orderBy: { date: "desc" },
          skip,
          take: limit,
        }),
        prisma.depense.count({ where }),
      ]);

      return NextResponse.json({
        data,
        pagination: {
          page: pageNum,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const depenses = await prisma.depense.findMany({
      where,
      include: { enregistre_par: { select: { nom: true, prenom: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(depenses);
  } catch (error) {
    console.error("[DEPENSES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST — créer une dépense
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = depenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { libelle, montant, date, categorie } = parsed.data;

    const depense = await prisma.depense.create({
      data: {
        libelle,
        montant,
        date: new Date(date),
        categorie,
        ecole_id: session.user.ecoleId,
        enregistre_par_id: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DEPENSE_ENREGISTREE",
        auteur_id: session.user.id,
        details: JSON.parse(JSON.stringify({ libelle, montant, categorie, date })),
      },
    });

    return NextResponse.json(depense, { status: 201 });
  } catch (error) {
    console.error("[DEPENSES_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// DELETE — supprimer une dépense
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const depense = await prisma.depense.findUnique({ where: { id } });
    if (!depense || depense.ecole_id !== session.user.ecoleId) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    await prisma.depense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DEPENSES_DELETE] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
