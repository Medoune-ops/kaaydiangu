import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { batchNotesSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET — récupérer les élèves d'une classe avec leurs notes pour une matière/séquence
export async function GET(req: NextRequest) {
  try {
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

  const eleveWhere = { classe_id: classeId, actif: true };
  const page = searchParams.get("page");
  const limit = parseInt(searchParams.get("limit") || "20");

  const fetchEleves = (skip?: number, take?: number) =>
    prisma.eleve.findMany({
      where: eleveWhere,
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
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    });

  const mapEleves = (eleves: Awaited<ReturnType<typeof fetchEleves>>) =>
    eleves.map((eleve) => {
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

  if (page) {
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limit;

    const [eleves, total] = await Promise.all([
      fetchEleves(skip, limit),
      prisma.eleve.count({ where: eleveWhere }),
    ]);

    return NextResponse.json({
      data: mapEleves(eleves),
      pagination: {
        page: pageNum,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

    const eleves = await fetchEleves();
    return NextResponse.json(mapEleves(eleves));
  } catch (error) {
    console.error("[NOTES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST — saisie de notes en lot
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "PROFESSEUR", "CENSEUR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const body = await req.json();
  const parsed = batchNotesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { matiere_id, type, sequence, date, notes } = parsed.data;

  // Vérifier l'accès à la matière selon le rôle
  let matiere;
  if (session.user.role === "PROFESSEUR") {
    // Le professeur ne peut saisir que pour ses propres matières
    matiere = await prisma.matiere.findFirst({
      where: { id: matiere_id, professeur_id: session.user.id },
      include: { classe: true },
    });
    if (!matiere) {
      return NextResponse.json({ error: "Matière non assignée à ce professeur" }, { status: 403 });
    }
  } else if (session.user.role === "CENSEUR") {
    // Le censeur peut saisir pour toutes les matières de son école
    matiere = await prisma.matiere.findFirst({
      where: { id: matiere_id, classe: { ecole_id: session.user.ecoleId } },
      include: { classe: true },
    });
    if (!matiere) {
      return NextResponse.json({ error: "Matière introuvable dans cet établissement" }, { status: 403 });
    }
  } else {
    // SUPER_ADMIN — accès libre
    matiere = await prisma.matiere.findFirst({
      where: { id: matiere_id },
      include: { classe: true },
    });
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
  } catch (error) {
    console.error("[NOTES_POST] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
