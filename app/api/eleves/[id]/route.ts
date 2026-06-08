import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateEleveSchema = z.object({
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  date_naissance: z.string().nullable().optional(),
  sexe: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  nom_parent: z.string().nullable().optional(),
  telephone_parent: z.string().nullable().optional(),
  email_parent: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  photo: z.string().nullable().optional(),
  actif: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const eleve = await prisma.eleve.findFirst({
      where: { id, classe: { ecole_id: session.user.ecoleId } },
    });
    if (!eleve) {
      return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateEleveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nom, prenom, date_naissance, ...rest } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const eleveUpdated = await tx.eleve.update({
        where: { id },
        data: {
          ...(nom && { nom }),
          ...(prenom && { prenom }),
          date_naissance: date_naissance !== undefined
            ? (date_naissance ? new Date(date_naissance) : null)
            : undefined,
          ...rest,
        },
      });

      // Sync nom/prenom sur le User associé
      if (nom || prenom) {
        await tx.user.update({
          where: { id: eleve.user_id },
          data: {
            ...(nom && { nom }),
            ...(prenom && { prenom }),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "ELEVE_MODIFIE",
          auteur_id: session.user.id,
          details: { eleveId: id, modifications: parsed.data },
        },
      });

      return eleveUpdated;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ELEVES_PATCH] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;

    const eleve = await prisma.eleve.findFirst({
      where: { id, classe: { ecole_id: session.user.ecoleId } },
      include: {
        classe: { select: { nom: true, niveau: true } },
        user: { select: { email: true } },
      },
    });

    if (!eleve) {
      return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
    }

    return NextResponse.json(eleve);
  } catch (error) {
    console.error("[ELEVES_GET_ID] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
