import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const profs = await prisma.professeurInfo.findMany({
      where: { ecole_id: session.user.ecoleId },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    return NextResponse.json(profs);
  } catch (error) {
    console.error("[PROFESSEURS_GET]", error);
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
    const { nom, prenom, fonction, age, diplome_academique, diplome_professionnel, numero_autorisation, telephone, classe_tenue, adresse } = body;

    if (!nom || !prenom) {
      return NextResponse.json({ error: "Nom et prénom obligatoires" }, { status: 400 });
    }

    const prof = await prisma.professeurInfo.create({
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        fonction: fonction?.trim() || null,
        age: age ? parseInt(age) : null,
        diplome_academique: diplome_academique?.trim() || null,
        diplome_professionnel: diplome_professionnel?.trim() || null,
        numero_autorisation: numero_autorisation?.trim() || null,
        telephone: telephone?.trim() || null,
        classe_tenue: classe_tenue?.trim() || null,
        adresse: adresse?.trim() || null,
        ecole_id: session.user.ecoleId,
      },
    });

    return NextResponse.json(prof, { status: 201 });
  } catch (error) {
    console.error("[PROFESSEURS_POST]", error);
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
    const { id, nom, prenom, fonction, age, diplome_academique, diplome_professionnel, numero_autorisation, telephone, classe_tenue, adresse } = body;

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const existing = await prisma.professeurInfo.findFirst({ where: { id, ecole_id: session.user.ecoleId } });
    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    const prof = await prisma.professeurInfo.update({
      where: { id },
      data: {
        nom: nom?.trim() ?? existing.nom,
        prenom: prenom?.trim() ?? existing.prenom,
        fonction: fonction?.trim() || null,
        age: age ? parseInt(age) : null,
        diplome_academique: diplome_academique?.trim() || null,
        diplome_professionnel: diplome_professionnel?.trim() || null,
        numero_autorisation: numero_autorisation?.trim() || null,
        telephone: telephone?.trim() || null,
        classe_tenue: classe_tenue?.trim() || null,
        adresse: adresse?.trim() || null,
      },
    });

    return NextResponse.json(prof);
  } catch (error) {
    console.error("[PROFESSEURS_PATCH]", error);
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

    const existing = await prisma.professeurInfo.findFirst({ where: { id, ecole_id: session.user.ecoleId } });
    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    await prisma.professeurInfo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PROFESSEURS_DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
