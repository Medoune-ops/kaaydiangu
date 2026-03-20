import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — journal d'audit avec filtres et pagination
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const action = searchParams.get("action");
  const auteur_id = searchParams.get("auteur_id");
  const dateDebut = searchParams.get("date_debut");
  const dateFin = searchParams.get("date_fin");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {
    auteur: { ecole_id: session.user.ecoleId },
  };

  if (action) where.action = action;
  if (auteur_id) where.auteur_id = auteur_id;

  if (dateDebut || dateFin) {
    const dateFilter: Record<string, Date> = {};
    if (dateDebut) dateFilter.gte = new Date(dateDebut);
    if (dateFin) {
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      dateFilter.lte = fin;
    }
    where.date = dateFilter;
  }

  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { auteur: { nom: { contains: search, mode: "insensitive" } } },
      { auteur: { prenom: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        auteur: {
          select: { id: true, nom: true, prenom: true, role: true },
        },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Récupérer les actions distinctes pour le filtre
  const actions = await prisma.auditLog.groupBy({
    by: ["action"],
    where: { auteur: { ecole_id: session.user.ecoleId } },
    orderBy: { action: "asc" },
  });

  // Récupérer les auteurs distincts pour le filtre
  const auteurs = await prisma.user.findMany({
    where: {
      ecole_id: session.user.ecoleId,
      auditLogs: { some: {} },
    },
    select: { id: true, nom: true, prenom: true, role: true },
    orderBy: [{ nom: "asc" }],
  });

  return NextResponse.json({
    logs,
    total,
    page,
    pages: Math.ceil(total / limit),
    actions: actions.map((a) => a.action),
    auteurs,
  });
  } catch (error) {
    console.error("[ADMIN_AUDIT_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
