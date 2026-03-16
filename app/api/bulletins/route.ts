import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererBulletinPDF, type BulletinData } from "@/lib/bulletin-pdf";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const eleveId = searchParams.get("eleve_id");
  const sequenceStr = searchParams.get("sequence");

  if (!eleveId || !sequenceStr) {
    return NextResponse.json({ error: "eleve_id et sequence requis" }, { status: 400 });
  }

  const sequence = parseInt(sequenceStr);
  if (isNaN(sequence) || sequence < 1 || sequence > 6) {
    return NextResponse.json({ error: "Séquence invalide (1-6)" }, { status: 400 });
  }

  // Vérifier les droits : ELEVE ne peut voir que son propre bulletin
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      classe: {
        include: {
          ecole: true,
          matieres: {
            include: {
              professeur: { select: { nom: true, prenom: true } },
            },
            orderBy: { nom: "asc" },
          },
        },
      },
      user: { select: { id: true, email: true } },
    },
  });

  if (!eleve) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  // Contrôle d'accès — seuls CENSEUR et SUPER_ADMIN peuvent télécharger le PDF
  if (!["SUPER_ADMIN", "CENSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Récupérer les notes de cet élève pour cette séquence
  const notes = await prisma.note.findMany({
    where: { eleve_id: eleveId, sequence },
    include: { matiere: true },
  });

  // Récupérer les appréciations pour cette séquence
  const appreciations = await prisma.appreciation.findMany({
    where: { eleve_id: eleveId, sequence },
  });

  // Construire les données par matière
  const matieresData = eleve.classe.matieres.map((mat) => {
    const notesMatiere = notes.filter((n) => n.matiere_id === mat.id);
    const moyenne =
      notesMatiere.length > 0
        ? notesMatiere.reduce((s, n) => s + n.valeur, 0) / notesMatiere.length
        : null;

    // Chercher une appréciation sur une note ou dans la table Appreciation
    const appreciationNote = notesMatiere.find((n) => n.appreciation)?.appreciation;

    return {
      nom: mat.nom,
      coefficient: mat.coefficient,
      notes: notesMatiere.map((n) => ({ valeur: n.valeur, type: n.type })),
      moyenne,
      appreciation: appreciationNote || null,
    };
  });

  // Calculer la moyenne générale pondérée
  const matieresAvecMoyenne = matieresData.filter((m) => m.moyenne !== null);
  let moyenneGenerale: number | null = null;
  if (matieresAvecMoyenne.length > 0) {
    const totalCoefMoy = matieresAvecMoyenne.reduce(
      (s, m) => s + m.moyenne! * m.coefficient,
      0
    );
    const totalCoef = matieresAvecMoyenne.reduce((s, m) => s + m.coefficient, 0);
    moyenneGenerale = totalCoef > 0 ? totalCoefMoy / totalCoef : null;
  }

  // Calculer le rang : moyenne de tous les élèves de la classe
  const classeEleves = await prisma.eleve.findMany({
    where: { classe_id: eleve.classe_id, actif: true },
    select: {
      id: true,
      notes: {
        where: { sequence },
        select: { valeur: true, matiere: { select: { coefficient: true } } },
      },
    },
  });

  const moyennesClasse = classeEleves
    .map((ce) => {
      if (ce.notes.length === 0) return { id: ce.id, moy: null };
      const totalPondere = ce.notes.reduce(
        (s, n) => s + n.valeur * n.matiere.coefficient,
        0
      );
      const totalCoef = ce.notes.reduce((s, n) => s + n.matiere.coefficient, 0);
      return { id: ce.id, moy: totalCoef > 0 ? totalPondere / totalCoef : null };
    })
    .filter((m) => m.moy !== null)
    .sort((a, b) => b.moy! - a.moy!);

  const rang = moyennesClasse.findIndex((m) => m.id === eleveId) + 1;
  const totalEleves = moyennesClasse.length;

  // Absences
  const absences = await prisma.absence.findMany({
    where: { eleve_id: eleveId },
  });

  // Appréciation générale
  const appGenerale = appreciations.length > 0 ? appreciations[0].texte : null;

  const bulletinData: BulletinData = {
    ecole: {
      nom: eleve.classe.ecole.nom,
      adresse: eleve.classe.ecole.adresse,
      telephone: eleve.classe.ecole.telephone,
      annee_scolaire: eleve.classe.ecole.annee_scolaire,
    },
    eleve: {
      nom: eleve.nom,
      prenom: eleve.prenom,
      matricule: eleve.matricule,
      date_naissance: eleve.date_naissance?.toISOString() ?? null,
      sexe: eleve.sexe,
    },
    classe: {
      nom: eleve.classe.nom,
      niveau: eleve.classe.niveau,
    },
    sequence,
    matieres: matieresData,
    moyenneGenerale:
      moyenneGenerale !== null ? Math.round(moyenneGenerale * 100) / 100 : null,
    rang: rang || 1,
    totalEleves,
    appreciationGenerale: appGenerale,
    totalAbsences: absences.length,
    totalHeuresAbsences: absences.reduce((s, a) => s + a.duree_heures, 0),
  };

  // Notification in-app
  await prisma.notification.create({
    data: {
      titre: "Bulletin disponible",
      message: `Votre bulletin de notes pour la séquence ${sequence} est maintenant disponible. Consultez-le depuis votre espace élève.`,
      type: "BULLETIN",
      destinataire_id: eleve.user.id,
    },
  }).catch(() => {});

  // Email + WhatsApp (async, non-bloquant)
  import("@/lib/notifications").then(({ notifierBulletinDisponible }) => {
    const eleveUser = eleve.user as { id: string; email?: string };
    notifierBulletinDisponible(
      eleve.classe.ecole.nom,
      {
        prenom: eleve.prenom,
        nom: eleve.nom,
        matricule: eleve.matricule,
        classe: eleve.classe.nom,
        email_parent: (eleve as unknown as { email_parent?: string }).email_parent,
        telephone_parent: (eleve as unknown as { telephone_parent?: string }).telephone_parent,
      },
      eleveUser.email || null,
      sequence
    ).catch(() => {});
  }).catch(() => {});

  const pdfBuffer = genererBulletinPDF(bulletinData);

  const filename = `bulletin_${eleve.matricule}_seq${sequence}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
