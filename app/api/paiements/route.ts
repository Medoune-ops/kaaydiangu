import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paiementSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des paiements d'un élève
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const eleveId = searchParams.get("eleve_id");
    if (!eleveId) {
      return NextResponse.json({ error: "eleve_id requis" }, { status: 400 });
    }

    const where = { eleve_id: eleveId };
    const page = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (page) {
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.paiement.findMany({
          where,
          orderBy: [{ annee: "asc" }, { mois: "asc" }],
          skip,
          take: limit,
        }),
        prisma.paiement.count({ where }),
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

    const paiements = await prisma.paiement.findMany({
      where,
      orderBy: [{ annee: "asc" }, { mois: "asc" }],
    });

    return NextResponse.json(paiements);
  } catch (error) {
    console.error("[PAIEMENTS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST — enregistrer un paiement
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = paiementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { paiement_id, montant, mode } = parsed.data;

    // Vérifier que le paiement existe et n'est pas déjà payé
    const paiement = await prisma.paiement.findUnique({
      where: { id: paiement_id },
      include: {
        eleve: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true,
            user_id: true,
            classe: { select: { nom: true, ecole_id: true } },
          },
        },
      },
    });

    if (!paiement) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    if (paiement.eleve.classe.ecole_id !== session.user.ecoleId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (paiement.statut === "PAYE") {
      return NextResponse.json({ error: "Ce mois est déjà payé" }, { status: 400 });
    }

    // Générer un numéro de reçu unique : RECU-ANNEE-XXXXX
    const count = await prisma.paiement.count({
      where: { statut: "PAYE", eleve: { classe: { ecole_id: session.user.ecoleId } } },
    });
    const recuNumero = `RECU-${paiement.annee}-${String(count + 1).padStart(5, "0")}`;

    const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];

    // Transaction : update paiement + notification + audit
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le paiement
      const updated = await tx.paiement.update({
        where: { id: paiement_id },
        data: {
          montant,
          statut: "PAYE",
          mode,
          date_paiement: new Date(),
          recu_numero: recuNumero,
          enregistre_par_id: session.user.id,
        },
      });

      // 2. Envoyer une notification à l'élève
      await tx.notification.create({
        data: {
          titre: "Paiement enregistré",
          message: `Votre paiement de ${montant.toLocaleString("fr-FR")} FCFA pour ${MOIS_NOMS[paiement.mois]} ${paiement.annee} a été enregistré. Reçu n° ${recuNumero}.`,
          type: "PAIEMENT",
          destinataire_id: paiement.eleve.user_id,
        },
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          action: "PAIEMENT_ENREGISTRE",
          auteur_id: session.user.id,
          details: JSON.parse(
            JSON.stringify({
              recu: recuNumero,
              eleve: `${paiement.eleve.prenom} ${paiement.eleve.nom}`,
              matricule: paiement.eleve.matricule,
              mois: paiement.mois,
              annee: paiement.annee,
              montant,
              mode,
            })
          ),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: result.id,
      recu_numero: recuNumero,
      montant: result.montant,
      mois: result.mois,
      annee: result.annee,
      statut: result.statut,
    });
  } catch (error) {
    console.error("[PAIEMENTS_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
