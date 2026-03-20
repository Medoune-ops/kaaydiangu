import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { batchAbsencesSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET — absences avec filtres
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const classeId = searchParams.get("classe_id");
    const eleveId = searchParams.get("eleve_id");
    const dateDebut = searchParams.get("date_debut");
    const dateFin = searchParams.get("date_fin");
    const matiereId = searchParams.get("matiere_id");

    const where: Record<string, unknown> = {};

    if (classeId) where.eleve = { classe_id: classeId };
    if (eleveId) where.eleve_id = eleveId;
    if (matiereId) where.matiere_id = matiereId;
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) (where.date as Record<string, unknown>).gte = new Date(dateDebut);
      if (dateFin) (where.date as Record<string, unknown>).lte = new Date(dateFin);
    }

    const page = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");

    const includeOpts = {
      eleve: {
        select: { id: true, nom: true, prenom: true, matricule: true, classe: { select: { nom: true } } },
      },
      matiere: { select: { nom: true } },
    };

    if (page) {
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.absence.findMany({
          where,
          include: includeOpts,
          orderBy: { date: "desc" },
          skip,
          take: limit,
        }),
        prisma.absence.count({ where }),
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

    const absences = await prisma.absence.findMany({
      where,
      include: includeOpts,
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json(absences);
  } catch (error) {
    console.error("[ABSENCES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST — pointage des absences en lot
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "PROFESSEUR", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = batchAbsencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { matiere_id, date, duree_heures, absences } = parsed.data;

    const dateAbs = new Date(date);

    const result = await prisma.$transaction(async (tx) => {
      const created = [];

      for (const a of absences) {
        // Éviter les doublons (même élève, même date, même matière)
        const existing = await tx.absence.findFirst({
          where: {
            eleve_id: a.eleve_id,
            matiere_id,
            date: dateAbs,
          },
        });

        if (!existing) {
          const absence = await tx.absence.create({
            data: {
              date: dateAbs,
              duree_heures: duree_heures,
              justifiee: false,
              motif: a.motif || null,
              eleve_id: a.eleve_id,
              matiere_id,
            },
          });
          created.push(absence);
        }
      }

      await tx.auditLog.create({
        data: {
          action: "ABSENCES_POINTEES",
          auteur_id: session.user.id,
          details: JSON.parse(
            JSON.stringify({ matiere_id, date, nb_absents: absences.length })
          ),
        },
      });

      return created;
    });

    return NextResponse.json({ saved: result.length });
  } catch (error) {
    console.error("[ABSENCES_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// PATCH — justifier une absence
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { id, justifiee, motif } = body;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const absence = await prisma.absence.update({
      where: { id },
      data: {
        justifiee: justifiee ?? undefined,
        motif: motif ?? undefined,
      },
    });

    return NextResponse.json(absence);
  } catch (error) {
    console.error("[ABSENCES_PATCH] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
