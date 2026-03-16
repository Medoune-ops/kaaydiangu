import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GestionEmploiDuTemps } from "@/components/dashboard/gestion-emploi-du-temps";

export const dynamic = "force-dynamic";

export default async function EmploiDuTempsPage() {
  const session = await auth();
  if (!session) return null;

  const classes = await prisma.classe.findMany({
    where: { ecole_id: session.user.ecoleId },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
    select: { id: true, nom: true, niveau: true },
  });

  const matieres = await prisma.matiere.findMany({
    where: { classe: { ecole_id: session.user.ecoleId } },
    include: {
      classe: { select: { id: true, nom: true } },
      professeur: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: { nom: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Emplois du temps</h2>
        <p className="text-neutral-500">
          Cliquez sur un créneau pour y assigner une matière.
        </p>
      </div>

      <GestionEmploiDuTemps classes={classes} matieres={matieres} />
    </div>
  );
}
