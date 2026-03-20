import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { eleveSchema } from "@/lib/validations";
import { genererMatricule } from "@/lib/matricule";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const classeId = searchParams.get("classe_id");

    const where: Record<string, unknown> = {
      classe: { ecole_id: session.user.ecoleId },
    };
    if (classeId) where.classe_id = classeId;

    const page = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (page) {
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.eleve.findMany({
          where,
          include: {
            classe: { select: { nom: true, niveau: true } },
            user: { select: { email: true } },
          },
          orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
          skip,
          take: limit,
        }),
        prisma.eleve.count({ where }),
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

    const eleves = await prisma.eleve.findMany({
      where,
      include: {
        classe: { select: { nom: true, niveau: true } },
        user: { select: { email: true } },
      },
      orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
    });

    return NextResponse.json(eleves);
  } catch (error) {
    console.error("[ELEVES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = eleveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const {
      nom,
      prenom,
      date_naissance,
      sexe,
      photo,
      adresse,
      nom_parent,
      telephone_parent,
      email_parent,
      classe_id,
    } = parsed.data;

    // Vérifier que la classe appartient à cette école
    const classe = await prisma.classe.findFirst({
      where: { id: classe_id, ecole_id: session.user.ecoleId },
    });
    if (!classe) {
      return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
    }

    // Générer le matricule
    const matricule = await genererMatricule(classe.nom);

    // Générer un email et un mot de passe provisoire
    const emailEleve =
      `${prenom.toLowerCase().replace(/\s/g, "")}.${nom.toLowerCase().replace(/\s/g, "")}@monecole.sn`;
    const motDePasseProvisoire = `MP-${matricule}`;
    const hashedPassword = await bcrypt.hash(motDePasseProvisoire, 10);

    // Création atomique : User + Eleve + 10 mensualités
    const annee = new Date().getFullYear();
    const moisDebut = 10; // Octobre
    const moisFin = 7;    // Juillet

    const moisList: { mois: number; annee: number }[] = [];
    for (let m = moisDebut; m <= 12; m++) {
      moisList.push({ mois: m, annee });
    }
    for (let m = 1; m <= moisFin; m++) {
      moisList.push({ mois: m, annee: annee + 1 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le User
      const user = await tx.user.create({
        data: {
          nom,
          prenom,
          email: emailEleve,
          mot_de_passe: hashedPassword,
          role: "ELEVE",
          ecole_id: session.user.ecoleId,
        },
      });

      // 2. Créer l'Eleve
      const eleve = await tx.eleve.create({
        data: {
          matricule,
          nom,
          prenom,
          date_naissance: date_naissance ? new Date(date_naissance) : null,
          sexe: sexe || null,
          photo: photo || null,
          adresse: adresse || null,
          nom_parent: nom_parent || null,
          telephone_parent: telephone_parent || null,
          email_parent: email_parent || null,
          classe_id,
          user_id: user.id,
        },
      });

      // 3. Initialiser les 10 mensualités NON_PAYE
      await tx.paiement.createMany({
        data: moisList.map((m) => ({
          mois: m.mois,
          annee: m.annee,
          montant: 0,
          statut: "NON_PAYE" as const,
          eleve_id: eleve.id,
        })),
      });

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          action: "ELEVE_INSCRIT",
          auteur_id: session.user.id,
          details: JSON.parse(
            JSON.stringify({ matricule, nom, prenom, classe: classe.nom })
          ),
        },
      });

      return { eleve, user, motDePasseProvisoire: motDePasseProvisoire };
    });

    return NextResponse.json({
      id: result.eleve.id,
      matricule: result.eleve.matricule,
      email: result.user.email,
      mot_de_passe_provisoire: result.motDePasseProvisoire,
    });
  } catch (error) {
    console.error("[ELEVES_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
