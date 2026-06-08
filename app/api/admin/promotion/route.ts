import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { genererMensualites, anneeDebutDepuisLibelle } from "@/lib/mensualites";

export const dynamic = "force-dynamic";

/**
 * Workflow de promotion / passage d'année.
 *
 * GET ?annee_cible_id=...
 *   Prépare les données : élèves de l'année ACTIVE (avec leur classe), classes
 *   de l'année active (= modèles à dupliquer), et classes déjà existantes dans
 *   l'année cible (pour proposer les destinations).
 *
 * POST { annee_cible_id, affectations: [{ eleve_id, destination: classe_id | "QUITTE" }] }
 *   Exécute la promotion en une transaction :
 *     - réaffecte chaque élève promu/redoublant à la classe choisie (année cible)
 *     - régénère ses mensualités pour l'année cible
 *     - désactive les élèves "QUITTE"
 *     - active l'année cible (et désactive l'ancienne)
 */

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    const ecoleId = session.user.ecoleId;

    const { searchParams } = req.nextUrl;
    const anneeCibleId = searchParams.get("annee_cible_id");

    const anneeActive = await prisma.anneeScolaire.findFirst({
      where: { ecole_id: ecoleId, est_active: true },
    });

    // Élèves actifs de l'année active, regroupés par classe.
    const eleves = await prisma.eleve.findMany({
      where: {
        actif: true,
        classe: { ecole_id: ecoleId, annee_scolaire_id: anneeActive?.id ?? undefined },
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        matricule: true,
        classe: { select: { id: true, nom: true, niveau: true } },
      },
      orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
    });

    // Classes de la cible (si l'année cible a déjà des classes).
    const classesCible = anneeCibleId
      ? await prisma.classe.findMany({
          where: { ecole_id: ecoleId, annee_scolaire_id: anneeCibleId },
          select: { id: true, nom: true, niveau: true, filiere: true },
          orderBy: { nom: "asc" },
        })
      : [];

    // Classes de l'année active (modèles potentiels à dupliquer).
    const classesActive = await prisma.classe.findMany({
      where: { ecole_id: ecoleId, annee_scolaire_id: anneeActive?.id ?? undefined },
      select: { id: true, nom: true, niveau: true, filiere: true, montant_scolarite: true, frais_inscription: true },
      orderBy: { nom: "asc" },
    });

    return NextResponse.json({ anneeActive, eleves, classesCible, classesActive });
  } catch (error) {
    console.error("[PROMOTION_GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    const ecoleId = session.user.ecoleId;

    const body = await req.json();
    const { annee_cible_id, affectations, dupliquer_classes } = body as {
      annee_cible_id?: string;
      affectations?: { eleve_id: string; destination: string }[];
      dupliquer_classes?: boolean;
    };

    if (!annee_cible_id || !Array.isArray(affectations)) {
      return NextResponse.json({ error: "Année cible et affectations obligatoires" }, { status: 400 });
    }

    const anneeCible = await prisma.anneeScolaire.findFirst({
      where: { id: annee_cible_id, ecole_id: ecoleId },
    });
    if (!anneeCible) return NextResponse.json({ error: "Année cible introuvable" }, { status: 404 });
    if (anneeCible.est_active) {
      return NextResponse.json({ error: "L'année cible est déjà l'année active" }, { status: 400 });
    }

    const moisList = genererMensualites(anneeDebutDepuisLibelle(anneeCible.libelle));

    const result = await prisma.$transaction(async (tx) => {
      // Optionnel : dupliquer les classes de l'année active vers la cible si la
      // cible n'a pas encore de classes.
      if (dupliquer_classes) {
        const anneeActive = await tx.anneeScolaire.findFirst({
          where: { ecole_id: ecoleId, est_active: true },
        });
        const dejaPresentes = await tx.classe.count({
          where: { ecole_id: ecoleId, annee_scolaire_id: annee_cible_id },
        });
        if (anneeActive && dejaPresentes === 0) {
          const modeles = await tx.classe.findMany({
            where: { ecole_id: ecoleId, annee_scolaire_id: anneeActive.id },
          });
          for (const c of modeles) {
            await tx.classe.create({
              data: {
                nom: c.nom,
                niveau: c.niveau,
                filiere: c.filiere,
                annee_scolaire: anneeCible.libelle,
                montant_scolarite: c.montant_scolarite,
                frais_inscription: c.frais_inscription,
                ecole_id: ecoleId,
                annee_scolaire_id: annee_cible_id,
              },
            });
          }
        }
      }

      let promus = 0;
      let partants = 0;

      for (const aff of affectations) {
        if (aff.destination === "QUITTE") {
          await tx.eleve.update({ where: { id: aff.eleve_id }, data: { actif: false } });
          partants++;
          continue;
        }

        // Vérifier que la classe destination appartient bien à l'année cible.
        const dest = await tx.classe.findFirst({
          where: { id: aff.destination, ecole_id: ecoleId, annee_scolaire_id: annee_cible_id },
          select: { id: true },
        });
        if (!dest) continue; // destination invalide → ignorer cet élève

        // Réaffecter l'élève à la nouvelle classe.
        await tx.eleve.update({
          where: { id: aff.eleve_id },
          data: { classe_id: dest.id, actif: true },
        });

        // Régénérer les mensualités de l'année cible (si pas déjà créées).
        const existe = await tx.paiement.count({
          where: { eleve_id: aff.eleve_id, annee_scolaire_id: annee_cible_id },
        });
        if (existe === 0) {
          await tx.paiement.createMany({
            data: moisList.map((m) => ({
              mois: m.mois,
              annee: m.annee,
              montant: 0,
              statut: "NON_PAYE" as const,
              eleve_id: aff.eleve_id,
              annee_scolaire_id: annee_cible_id,
            })),
          });
        }
        promus++;
      }

      // Bascule : l'année cible devient l'année active.
      await tx.anneeScolaire.updateMany({
        where: { ecole_id: ecoleId, est_active: true },
        data: { est_active: false, est_cloturee: true },
      });
      await tx.anneeScolaire.update({
        where: { id: annee_cible_id },
        data: { est_active: true, est_cloturee: false },
      });

      return { promus, partants };
    });

    await prisma.auditLog.create({
      data: {
        action: `Promotion vers ${anneeCible.libelle} : ${result.promus} élève(s) promu(s), ${result.partants} sortie(s)`,
        auteur_id: session.user.id,
      },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[PROMOTION_POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
