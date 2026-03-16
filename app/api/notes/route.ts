import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — récupérer les élèves d'une classe avec leurs notes pour une matière/séquence
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "PROFESSEUR", "CENSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const classeId = searchParams.get("classe_id");
  const matiereId = searchParams.get("matiere_id");
  const sequence = searchParams.get("sequence");

  if (!classeId || !matiereId) {
    return NextResponse.json({ error: "classe_id et matiere_id requis" }, { status: 400 });
  }

  const eleves = await prisma.eleve.findMany({
    where: { classe_id: classeId, actif: true },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      notes: {
        where: {
          matiere_id: matiereId,
          ...(sequence ? { sequence: parseInt(sequence) } : {}),
        },
        select: {
          id: true,
          valeur: true,
          type: true,
          sequence: true,
          appreciation: true,
          date: true,
        },
        orderBy: { date: "desc" },
      },
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  // Calculer la moyenne par élève pour cette matière/séquence
  const result = eleves.map((eleve) => {
    const notesSeq = sequence
      ? eleve.notes.filter((n) => n.sequence === parseInt(sequence))
      : eleve.notes;

    const moyenne =
      notesSeq.length > 0
        ? notesSeq.reduce((sum, n) => sum + n.valeur, 0) / notesSeq.length
        : null;

    return {
      ...eleve,
      moyenne: moyenne !== null ? Math.round(moyenne * 100) / 100 : null,
    };
  });

  return NextResponse.json(result);
}

// POST — saisie de notes en lot
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "PROFESSEUR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { matiere_id, type, sequence, date, notes } = body as {
    matiere_id: string;
    type: "CONTROLE" | "DEVOIR" | "EXAMEN";
    sequence: number;
    date: string;
    notes: { eleve_id: string; valeur: number; appreciation?: string }[];
  };

  if (!matiere_id || !type || !sequence || !notes?.length) {
    return NextResponse.json(
      { error: "matiere_id, type, sequence et notes sont requis" },
      { status: 400 }
    );
  }

  if (sequence < 1 || sequence > 6) {
    return NextResponse.json({ error: "Séquence doit être entre 1 et 6" }, { status: 400 });
  }

  // Vérifier que la matière appartient au prof
  const matiere = await prisma.matiere.findFirst({
    where: { id: matiere_id, professeur_id: session.user.id },
    include: { classe: true },
  });

  if (!matiere && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Matière non assignée à ce professeur" }, { status: 403 });
  }

  // Valider les notes (0-20)
  for (const n of notes) {
    if (n.valeur < 0 || n.valeur > 20) {
      return NextResponse.json(
        { error: "Les notes doivent être entre 0 et 20" },
        { status: 400 }
      );
    }
  }

  const dateEval = date ? new Date(date) : new Date();

  const result = await prisma.$transaction(async (tx) => {
    const created = [];

    for (const n of notes) {
      // Vérifier si une note existe déjà pour cet élève/matière/type/séquence
      const existing = await tx.note.findFirst({
        where: {
          eleve_id: n.eleve_id,
          matiere_id,
          type,
          sequence,
        },
      });

      if (existing) {
        // Mettre à jour la note existante
        const updated = await tx.note.update({
          where: { id: existing.id },
          data: {
            valeur: n.valeur,
            appreciation: n.appreciation || null,
            date: dateEval,
          },
        });
        created.push(updated);
      } else {
        // Créer une nouvelle note
        const note = await tx.note.create({
          data: {
            valeur: n.valeur,
            type,
            sequence,
            date: dateEval,
            appreciation: n.appreciation || null,
            eleve_id: n.eleve_id,
            matiere_id,
          },
        });
        created.push(note);
      }
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        action: "NOTES_SAISIES",
        auteur_id: session.user.id,
        details: JSON.parse(
          JSON.stringify({
            matiere_id,
            type,
            sequence,
            nb_notes: notes.length,
          })
        ),
      },
    });

    return created;
  });

  // Notifications aux élèves (in-app + email)
  const matiereNom = matiere?.nom || "une matière";

  const elevesForNotif = await prisma.eleve.findMany({
    where: { id: { in: notes.map((n) => n.eleve_id) } },
    select: {
      id: true,
      prenom: true,
      user_id: true,
      user: { select: { email: true, ecole: { select: { nom: true } } } },
    },
  });

  // In-app notifications
  await prisma.notification.createMany({
    data: elevesForNotif.map((e) => ({
      titre: "Nouvelle note",
      message: `Une note de ${type.toLowerCase()} en ${matiereNom} (séquence ${sequence}) a été saisie.`,
      type: "NOTE",
      destinataire_id: e.user_id,
    })),
  });

  // Email notifications (async, non-bloquant)
  import("@/lib/notifications").then(({ notifierNouvelleNote }) => {
    for (const e of elevesForNotif) {
      notifierNouvelleNote(
        e.user.ecole.nom,
        e.user.email,
        e.prenom,
        matiereNom,
        type,
        sequence
      ).catch(() => {});
    }
  }).catch(() => {});

  // Calculer les moyennes mises à jour pour chaque élève
  const elevesIds = notes.map((n) => n.eleve_id);
  const moyennes = await Promise.all(
    elevesIds.map(async (eleveId) => {
      const notesEleve = await prisma.note.findMany({
        where: { eleve_id: eleveId, matiere_id, sequence },
      });
      const moy =
        notesEleve.length > 0
          ? notesEleve.reduce((s, n) => s + n.valeur, 0) / notesEleve.length
          : null;
      return {
        eleve_id: eleveId,
        moyenne: moy !== null ? Math.round(moy * 100) / 100 : null,
      };
    })
  );

  return NextResponse.json({
    saved: result.length,
    moyennes,
  });
}
