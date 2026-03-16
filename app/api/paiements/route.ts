import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des paiements d'un élève
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const eleveId = req.nextUrl.searchParams.get("eleve_id");
  if (!eleveId) {
    return NextResponse.json({ error: "eleve_id requis" }, { status: 400 });
  }

  const paiements = await prisma.paiement.findMany({
    where: { eleve_id: eleveId },
    orderBy: [{ annee: "asc" }, { mois: "asc" }],
  });

  return NextResponse.json(paiements);
}

// POST — enregistrer un paiement
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { paiement_id, montant, mode } = body;

  if (!paiement_id || !montant || !mode) {
    return NextResponse.json(
      { error: "paiement_id, montant et mode requis" },
      { status: 400 }
    );
  }

  if (!["ESPECES", "MOBILE_MONEY", "VIREMENT"].includes(mode)) {
    return NextResponse.json({ error: "Mode de paiement invalide" }, { status: 400 });
  }

  if (montant <= 0) {
    return NextResponse.json({ error: "Le montant doit être positif" }, { status: 400 });
  }

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
    "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
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
}
