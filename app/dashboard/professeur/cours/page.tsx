import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DepotCours } from "@/components/dashboard/depot-cours";

export const dynamic = "force-dynamic";

export default async function ProfesseurCoursPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const matieres = await prisma.matiere.findMany({
    where: { professeur_id: session.user.id },
    include: { classe: { select: { id: true, nom: true, niveau: true } } },
    orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dépôt de cours</h2>
        <p className="text-neutral-500">
          Déposez vos supports de cours (PDF, Word, images). Ils seront
          accessibles aux élèves et sur le site de révisions.
        </p>
      </div>
      <DepotCours
        matieres={matieres.map((m) => ({
          id: m.id,
          nom: m.nom,
          classe: m.classe,
        }))}
      />
    </div>
  );
}
