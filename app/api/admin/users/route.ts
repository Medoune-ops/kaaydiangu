import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// GET — lister les utilisateurs du personnel (hors ELEVE)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      ecole_id: session.user.ecoleId,
      role: { not: "ELEVE" },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      actif: true,
      createdAt: true,
      matieres: {
        select: {
          id: true,
          nom: true,
          classe: { select: { id: true, nom: true } },
        },
      },
    },
    orderBy: [{ role: "asc" }, { nom: "asc" }],
  });

  return NextResponse.json(users);
}

// POST — créer un compte personnel
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { nom, prenom, email, role } = body as {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };

  if (!nom || !prenom || !email || !role) {
    return NextResponse.json(
      { error: "Nom, prénom, email et rôle requis" },
      { status: 400 }
    );
  }

  const rolesAutorises = ["COMPTABLE", "CENSEUR", "PROFESSEUR"];
  if (!rolesAutorises.includes(role)) {
    return NextResponse.json(
      { error: "Rôle invalide (COMPTABLE, CENSEUR ou PROFESSEUR)" },
      { status: 400 }
    );
  }

  // Vérifier unicité email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }

  const motDePasseProvisoire = `MP-${Date.now().toString(36).toUpperCase()}`;
  const hashedPassword = await bcrypt.hash(motDePasseProvisoire, 10);

  const user = await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      role: role as "COMPTABLE" | "CENSEUR" | "PROFESSEUR",
      ecole_id: session.user.ecoleId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UTILISATEUR_CREE",
      auteur_id: session.user.id,
      details: JSON.parse(
        JSON.stringify({ user_id: user.id, nom, prenom, email, role })
      ),
    },
  });

  return NextResponse.json({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role,
    mot_de_passe_provisoire: motDePasseProvisoire,
  });
}

// PATCH — modifier un utilisateur (rôle, actif, reset mdp, assignation matières)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { user_id, action: actionType } = body as {
    user_id: string;
    action: string;
  };

  if (!user_id || !actionType) {
    return NextResponse.json(
      { error: "user_id et action requis" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: user_id, ecole_id: session.user.ecoleId, role: { not: "ELEVE" } },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Ne pas modifier son propre compte
  if (user_id === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas modifier votre propre compte" },
      { status: 400 }
    );
  }

  switch (actionType) {
    case "CHANGER_ROLE": {
      const { role } = body as { role: string };
      const rolesAutorises = ["COMPTABLE", "CENSEUR", "PROFESSEUR"];
      if (!role || !rolesAutorises.includes(role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: user_id },
        data: { role: role as "COMPTABLE" | "CENSEUR" | "PROFESSEUR" },
      });
      await prisma.auditLog.create({
        data: {
          action: "ROLE_MODIFIE",
          auteur_id: session.user.id,
          details: JSON.parse(
            JSON.stringify({
              user_id,
              ancien_role: user.role,
              nouveau_role: role,
            })
          ),
        },
      });
      return NextResponse.json({ ok: true, message: `Rôle changé en ${role}` });
    }

    case "TOGGLE_ACTIF": {
      const newActif = !user.actif;
      await prisma.user.update({
        where: { id: user_id },
        data: { actif: newActif },
      });
      await prisma.auditLog.create({
        data: {
          action: newActif ? "COMPTE_ACTIVE" : "COMPTE_DESACTIVE",
          auteur_id: session.user.id,
          details: JSON.parse(JSON.stringify({ user_id, nom: `${user.prenom} ${user.nom}` })),
        },
      });
      return NextResponse.json({ ok: true, actif: newActif });
    }

    case "RESET_PASSWORD": {
      const newPassword = `MP-${Date.now().toString(36).toUpperCase()}`;
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user_id },
        data: { mot_de_passe: hashed },
      });
      await prisma.auditLog.create({
        data: {
          action: "MOT_DE_PASSE_REINITIALISE",
          auteur_id: session.user.id,
          details: JSON.parse(JSON.stringify({ user_id, nom: `${user.prenom} ${user.nom}` })),
        },
      });
      return NextResponse.json({ ok: true, nouveau_mot_de_passe: newPassword });
    }

    case "ASSIGNER_MATIERES": {
      const { matiere_ids } = body as { matiere_ids: string[] };
      if (!Array.isArray(matiere_ids)) {
        return NextResponse.json({ error: "matiere_ids requis (tableau)" }, { status: 400 });
      }

      // Vérifier que les matières appartiennent à l'école
      const matieres = await prisma.matiere.findMany({
        where: {
          id: { in: matiere_ids },
          classe: { ecole_id: session.user.ecoleId },
        },
      });

      if (matieres.length !== matiere_ids.length) {
        return NextResponse.json(
          { error: "Certaines matières sont introuvables" },
          { status: 400 }
        );
      }

      // Retirer les anciennes assignations de ce prof
      await prisma.matiere.updateMany({
        where: { professeur_id: user_id },
        data: { professeur_id: null },
      });

      // Assigner les nouvelles
      if (matiere_ids.length > 0) {
        await prisma.matiere.updateMany({
          where: { id: { in: matiere_ids } },
          data: { professeur_id: user_id },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "MATIERES_ASSIGNEES",
          auteur_id: session.user.id,
          details: JSON.parse(
            JSON.stringify({
              user_id,
              nom: `${user.prenom} ${user.nom}`,
              nb_matieres: matiere_ids.length,
            })
          ),
        },
      });

      return NextResponse.json({ ok: true, matieres_assignees: matiere_ids.length });
    }

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }
}
